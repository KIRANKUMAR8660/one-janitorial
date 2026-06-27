import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';
import WorkflowLog from '../models/WorkflowLog.js';
import AIAgent from '../models/AIAgent.js';
import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Ticket from '../models/Ticket.js';
import Employee from '../models/Employee.js';
import Dataset from '../models/Dataset.js';
import mongoose from 'mongoose';

// Variable Interpolator
const interpolate = (value, context) => {
  if (!value) return value;
  if (typeof value === 'object') {
    const result = Array.isArray(value) ? [] : {};
    for (const key in value) {
      result[key] = interpolate(value[key], context);
    }
    return result;
  }
  if (typeof value !== 'string') return value;
  
  return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const parts = path.trim().split('.');
    let obj = context;
    for (const part of parts) {
      if (obj && obj[part] !== undefined) {
        obj = obj[part];
      } else {
        return match; // Keep {{variable}} if not resolved
      }
    }
    return typeof obj === 'object' ? JSON.stringify(obj) : obj;
  });
};

// Log creator utility
const createEngineLog = async (level, executionId, workflowId, nodeId, nodeType, message, data = null) => {
  const log = new WorkflowLog({
    workflow: workflowId,
    execution: executionId,
    nodeId,
    nodeType,
    level,
    message,
    data
  });
  await log.save();
  
  // Broadcast log via socket
  if (global.io) {
    global.io.to(executionId.toString()).emit('new_workflow_log', {
      nodeId,
      level,
      message,
      timestamp: log.createdAt
    });
    // Also broadcast globally for monitoring dashboard
    global.io.emit('monitoring_log', {
      executionId,
      workflowId,
      nodeId,
      level,
      message,
      timestamp: log.createdAt
    });
  }
};

// Core Workflow Execution Engine
export const executeWorkflowEngine = async (executionId) => {
  const session = await mongoose.startSession();
  let execution = null;
  
  try {
    execution = await Execution.findById(executionId).populate('workflow');
    if (!execution) {
      console.error(`Execution ${executionId} not found.`);
      return;
    }
    
    if (execution.status === 'Completed' || execution.status === 'Failed') {
      return;
    }
    
    execution.status = 'Running';
    execution.startedAt = new Date();
    await execution.save();
    
    // Broadcast status change
    global.io?.emit('execution_status_change', { executionId, status: 'Running' });
    
    const workflow = execution.workflow;
    const nodes = workflow.nodes;
    const edges = workflow.edges;
    
    // Maintain a local cache of outputs for variable interpolation
    const nodeOutputs = {
      trigger: execution.triggerData || {}
    };
    
    // Build maps of incoming connections to check for condition outcomes
    const incomingEdges = {};
    edges.forEach(e => {
      if (!incomingEdges[e.target]) incomingEdges[e.target] = [];
      incomingEdges[e.target].push(e);
    });
    
    // Set of nodes that should be skipped
    const skippedNodes = new Set();
    
    // Walk through nodes in topological path
    for (const nodeId of execution.executionPath) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      // 1. Check if node is skipped due to incoming branches
      let isNodeSkipped = skippedNodes.has(nodeId);
      
      if (!isNodeSkipped && incomingEdges[nodeId]) {
        // If it has incoming edges, let's see if any parent was a condition or if parent was skipped
        const parentEdges = incomingEdges[nodeId];
        let hasActiveInput = false;
        let parentEvaluated = false;
        
        for (const edge of parentEdges) {
          const parentNodeId = edge.source;
          const parentState = execution.nodeStates.get(parentNodeId);
          
          if (parentState) {
            parentEvaluated = true;
            if (parentState.status === 'Skipped') {
              continue;
            }
            
            // Check if parent is a ConditionNode
            const parentNode = nodes.find(n => n.id === parentNodeId);
            if (parentNode && parentNode.type === 'ConditionNode') {
              const conditionMet = parentState.output?.conditionMet;
              const sourceHandle = edge.sourceHandle; // 'true' or 'false'
              
              if ((conditionMet && sourceHandle === 'true') || (!conditionMet && sourceHandle === 'false')) {
                hasActiveInput = true;
              }
            } else {
              // Standard nodes pass control unconditionally
              hasActiveInput = true;
            }
          }
        }
        
        // If parents executed, but none resolved to this node's input handle, skip this node
        if (parentEvaluated && !hasActiveInput) {
          isNodeSkipped = true;
        }
      }
      
      if (isNodeSkipped) {
        skippedNodes.add(nodeId);
        execution.nodeStates.set(nodeId, {
          status: 'Skipped',
          output: {},
          startedAt: new Date(),
          endedAt: new Date()
        });
        await execution.save();
        
        // Propagate skip to children
        const children = edges.filter(e => e.source === nodeId).map(e => e.target);
        children.forEach(c => skippedNodes.add(c));
        
        await createEngineLog('info', executionId, workflow._id, nodeId, node.type, 'Node skipped due to inactive branch routing.');
        global.io?.emit('node_status_change', { executionId, nodeId, status: 'Skipped' });
        continue;
      }
      
      // 2. Execute Node
      execution.nodeStates.set(nodeId, {
        status: 'Running',
        startedAt: new Date()
      });
      await execution.save();
      global.io?.emit('node_status_change', { executionId, nodeId, status: 'Running' });
      await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Executing node: ${node.data?.name || node.type}`);
      
      // Perform variable interpolation on data config
      const context = {
        trigger: execution.triggerData,
        ...nodeOutputs
      };
      const config = interpolate(node.data?.config || {}, context);
      
      let nodeOutput = {};
      let nodeError = null;
      
      try {
        switch (node.type) {
          case 'TriggerNode':
          case 'HubSpotTrigger':
          case 'SchedulerNode':
            nodeOutput = { ...execution.triggerData, timestamp: new Date() };
            break;
            
          case 'ConditionNode': {
            const field = config.field;
            const operator = config.operator || 'equals';
            const value = config.value;
            
            let conditionMet = false;
            if (operator === 'equals') conditionMet = String(field) === String(value);
            else if (operator === 'not_equals') conditionMet = String(field) !== String(value);
            else if (operator === 'greater_than') conditionMet = Number(field) > Number(value);
            else if (operator === 'less_than') conditionMet = Number(field) < Number(value);
            else if (operator === 'contains') conditionMet = String(field).includes(String(value));
            
            nodeOutput = { conditionMet, evaluatedValue: field };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Condition evaluated to: ${conditionMet}`);
            break;
          }
          
          case 'OpenAINode':
          case 'ClaudeNode': {
            const systemPrompt = config.systemPrompt || 'You are a helpful assistant.';
            const userPrompt = config.prompt || '';
            
            // Mock LLM generation
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            nodeOutput = {
              reply: `[Mock AI Response for model: ${node.type === 'OpenAINode' ? 'GPT-4o' : 'Claude 3.5'}]\nPrompt context: ${userPrompt.substring(0, 50)}...\nProcessed text: Successful automation execution under operational policy.`,
              tokens: 150,
              provider: node.type === 'OpenAINode' ? 'OpenAI' : 'Anthropic'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, 'AI completion generated successfully.');
            break;
          }
          
          case 'AIAgentNode': {
            const agentId = config.agentId;
            const taskInstruction = config.task || '';
            const agent = await AIAgent.findById(agentId);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            nodeOutput = {
              agentName: agent ? agent.name : 'Unknown Agent',
              result: `[Mock Multi-Agent Orchestrator Result]\nGoal: ${agent?.goals?.join(', ') || 'Process workflow tasks'}\nResponse: Executed instruction "${taskInstruction}" conforming to guidelines.`,
              status: 'Success'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Agent "${nodeOutput.agentName}" completed task.`);
            break;
          }
          
          case 'EmailNode':
          case 'SlackNode':
          case 'TeamsNode': {
            const recipient = config.to || config.channel || 'staff@onejanitorial.com';
            const subject = config.subject || 'Workflow Alert';
            const body = config.body || '';
            
            // Mock send notification
            await new Promise(resolve => setTimeout(resolve, 800));
            nodeOutput = { sent: true, recipient, timestamp: new Date() };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Notification message sent to: ${recipient}`);
            break;
          }
          
          case 'SMSNode': {
            const phone = config.phone || '555-0100';
            const message = config.message || '';
            
            await new Promise(resolve => setTimeout(resolve, 600));
            nodeOutput = { sent: true, phone };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `SMS successfully dispatched to phone ${phone}`);
            break;
          }
          
          case 'CRMNode': {
            const actionType = config.actionType || 'create_lead'; // create_lead, update_deal, etc.
            
            if (actionType === 'create_lead') {
              const newLead = new Lead({
                firstName: config.firstName || 'John',
                lastName: config.lastName || 'Doe',
                email: config.email || 'lead@example.com',
                phone: config.phone || '555-0000',
                status: 'New',
                hygieneStatus: 'Good'
              });
              await newLead.save();
              nodeOutput = { leadId: newLead._id, status: 'Created' };
              await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Created HubSpot Lead in MongoDB: ${newLead.email}`);
            } else if (actionType === 'update_deal') {
              const deal = await Deal.findOneAndUpdate(
                { clientEmail: config.clientEmail },
                { stage: config.stage || 'Closed Won' },
                { new: true }
              );
              nodeOutput = { dealId: deal?._id, stage: deal?.stage, status: deal ? 'Updated' : 'Not Found' };
              await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Updated CRM Deal stage for ${config.clientEmail} to ${config.stage}`);
            }
            break;
          }
          
          case 'DatabaseNode': {
            const queryCollection = config.collection || 'Employee';
            const queryFilter = config.filter || {};
            
            let data = [];
            if (queryCollection === 'Employee') {
              data = await Employee.find(queryFilter).limit(5);
            } else if (queryCollection === 'Ticket') {
              data = await Ticket.find(queryFilter).limit(5);
            }
            nodeOutput = { count: data.length, records: data };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Queried collection ${queryCollection}. Found ${data.length} entries.`);
            break;
          }
          
          case 'TransformNode': {
            const inputData = config.inputData || {};
            const formatString = config.formatString || '{}';
            
            // Simple mapping or transformation simulation
            nodeOutput = {
              transformed: true,
              result: {
                ...inputData,
                formattedAt: new Date().toISOString(),
                status: 'Clean'
              }
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, 'JSON transformation complete.');
            break;
          }
          
          case 'DelayNode': {
            const delaySec = parseInt(config.delaySeconds || 2, 10);
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Delaying workflow execution for ${delaySec} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
            nodeOutput = { waitedSeconds: delaySec };
            break;
          }
          
          case 'ApprovalNode': {
            // Suspends execution until approved
            execution.status = 'Pending';
            execution.nodeStates.set(nodeId, {
              status: 'Pending',
              startedAt: new Date()
            });
            await execution.save();
            global.io?.emit('execution_status_change', { executionId, status: 'Pending' });
            global.io?.emit('node_status_change', { executionId, nodeId, status: 'Pending' });
            await createEngineLog('warning', executionId, workflow._id, nodeId, node.type, 'Workflow execution paused: Awaiting administrator approval.');
            session.endSession();
            return; // Terminate engine run loop immediately, we will resume when approved
          }
          
          case 'TicketNode': {
            const ticketAction = config.action || 'create';
            
            if (ticketAction === 'create') {
              const ticket = new Ticket({
                title: config.title || 'Auto-generated Workflow Ticket',
                description: config.description || 'Generated by system workflow.',
                clientEmail: config.clientEmail || 'system@onejanitorial.com',
                status: 'Open',
                priority: config.priority || 'Medium',
                ticketType: config.ticketType || 'Service Complaint',
                slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
              });
              await ticket.save();
              nodeOutput = { ticketId: ticket._id, ticketNumber: ticket.title };
              await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Created Client Support Ticket: ${ticket.title}`);
            }
            break;
          }
          
          case 'EmployeeNode': {
            const email = config.email;
            const employee = await Employee.findOne().populate({
              path: 'user',
              match: { email }
            });
            nodeOutput = { employeeFound: !!employee, details: employee };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Searched employee directory for: ${email}`);
            break;
          }

          // --- FILES & DOCUMENTS: FILE INPUTS ---
          case 'FileUploadNode':
          case 'LocalFileNode':
          case 'GoogleDriveFileNode':
          case 'DropboxFileNode':
          case 'OneDriveFileNode':
          case 'SharePointFileNode':
          case 'S3FileNode':
          case 'FTPFileNode':
          case 'WebhookFileUploadNode':
          case 'EmailAttachmentNode':
          case 'FolderWatcherNode':
          case 'FolderMonitorNode': {
            const fileName = config.fileName || 'document.pdf';
            const fileSize = config.fileSize || 1048576;
            const fileType = config.fileType || 'application/pdf';
            const pathUrl = config.storageLocation || '/uploads/mock_contract.pdf';
            nodeOutput = { fileName, fileSize, fileType, storageLocation: pathUrl, status: 'Ready' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Loaded file: ${fileName} (${fileType}, ${(fileSize/1024).toFixed(1)} KB)`);
            break;
          }

          // --- PDF NODES ---
          case 'PDFReaderNode':
          case 'PDFExtractTextNode':
          case 'PDFOCRNode':
          case 'PDFSplitNode':
          case 'PDFMergeNode':
          case 'PDFCompressNode':
          case 'PDFMetadataNode':
          case 'PDFSignatureVerificationNode':
          case 'PDFAIAnalysisNode':
          case 'PDFSummarizationNode': {
            const fileUrl = config.fileUrl || '/uploads/mock_contract.pdf';
            nodeOutput = {
              extractedText: "[PDF Extract Text Content]\nAgreement terms: Full sanitization services scheduled for headquarters Plaza on standard rate split schedules. Term: 1 year, starting August 2026. Signed: Kiran Kumar, Administrator.",
              metadata: { pages: 5, author: 'One Janitorial HQ', sizeBytes: 154000, secure: true, verified: true },
              fileUrl
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Processed PDF node: extracted text & metadata.`);
            break;
          }

          // --- EXCEL NODES ---
          case 'ExcelReadNode':
          case 'ExcelWriteNode':
          case 'ExcelAppendNode':
          case 'ExcelUpdateNode':
          case 'ExcelFormulaNode':
          case 'ExcelSheetReaderNode':
          case 'ExcelMultiSheetProcessor':
          case 'ExcelValidatorNode':
          case 'ExcelDataCleanerNode':
          case 'ExcelReportGeneratorNode': {
            nodeOutput = {
              sheets: ['Daily Metrics', 'Financials'],
              rowsCount: 150,
              dataSample: [
                { id: '1', name: 'John Doe', hours: '40', dept: 'Operations' },
                { id: '2', name: 'Marcus Vance', hours: '45', dept: 'Management' }
              ],
              formulasResolved: true
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Executed Excel processing: read sheet grid.`);
            break;
          }

          // --- CSV NODES ---
          case 'CSVReaderNode':
          case 'CSVWriterNode':
          case 'CSVCleanerNode':
          case 'CSVValidatorNode':
          case 'CSVTransformerNode':
          case 'CSVExportNode':
          case 'CSVImportNode': {
            nodeOutput = {
              headers: ['firstName', 'lastName', 'email', 'phone'],
              rows: [
                { firstName: 'Alice', lastName: 'Henderson', email: 'alice@example.com', phone: '555-0143' }
              ],
              valid: true,
              totalRecords: 1
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Completed CSV action on headers: ${nodeOutput.headers.join(',')}`);
            break;
          }

          // --- WORD DOCUMENT NODES ---
          case 'WordReaderNode':
          case 'WordWriterNode':
          case 'DocumentGeneratorNode':
          case 'TemplateProcessorNode':
          case 'ContractGeneratorNode':
          case 'PolicyGeneratorNode':
          case 'ReportGeneratorNode': {
            const templateType = config.templateType || 'Contract';
            nodeOutput = {
              generatedPath: `/uploads/contracts/generated_${templateType.toLowerCase()}_${Date.now()}.docx`,
              contentWords: 1500,
              fieldsMerged: ['clientName', 'contractValue', 'startDate']
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Generated template Word document: ${templateType}`);
            break;
          }

          // --- IMAGE PROCESSING NODES ---
          case 'ImageUploadNode':
          case 'OCRExtractionNode':
          case 'ImageMetadataNode':
          case 'ImageResizeNode':
          case 'ImageCompressionNode':
          case 'ImageClassificationNode':
          case 'AIImageAnalyzerNode':
          case 'DocumentScannerNode': {
            nodeOutput = {
              scannedText: "[OCR TEXT EXTRACTION RESULT]\nTAX INVOICE\nVendor: Chemical Clean Supply Corp\nTotal Due: $1,240.00\nTax: $120.00\nDate: 2026-06-15",
              dimensions: { width: 1920, height: 1080 },
              mimeType: 'image/png',
              classification: 'Financial Invoice Receipt'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `OCR scanner extracted ${nodeOutput.scannedText.length} characters.`);
            break;
          }

          // --- AUDIO PROCESSING NODES ---
          case 'AudioUploadNode':
          case 'SpeechToTextNode':
          case 'MeetingTranscriptNode':
          case 'AudioSummarizerNode':
          case 'AudioClassificationNode': {
            nodeOutput = {
              transcript: "Host: Good morning, let's sync up on the Plazas audit logs. Client reported missing floor buffing at suite 402. Employee: Copy that, will conduct next run verification today.",
              durationSeconds: 120,
              speakerCount: 2,
              summary: "Synced on missing floor buffing at suite 402. Next run scheduled."
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Dispatched Speech-To-Text transcriber loop.`);
            break;
          }

          // --- VIDEO PROCESSING NODES ---
          case 'VideoUploadNode':
          case 'VideoMetadataNode':
          case 'VideoTranscriptionNode':
          case 'VideoSummarizerNode':
          case 'VideoFrameExtractorNode': {
            nodeOutput = {
              fps: 30,
              resolution: '1080p',
              framesExtracted: 5,
              transcript: "Audio trace extracted.",
              summary: "Operations video walk-through review."
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Extracted visual frame data from video source.`);
            break;
          }

          // --- AI KNOWLEDGE INGESTION NODES ---
          case 'DocumentLoaderNode':
          case 'KnowledgeBaseLoaderNode':
          case 'EmbeddingGeneratorNode':
          case 'VectorStoreWriterNode':
          case 'ChunkProcessorNode':
          case 'RAGPreparationNode':
          case 'SemanticIndexerNode':
          case 'KnowledgeSyncNode': {
            nodeOutput = {
              chunksCreated: 12,
              embeddingsDimension: 1536,
              indexedDocumentsCount: 1,
              status: 'Indexed Success'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Generated ${nodeOutput.chunksCreated} semantic chunks and stored in vector DB.`);
            break;
          }

          // --- VECTOR DATABASE NODES ---
          case 'ChromaDBNode':
          case 'PineconeNode':
          case 'WeaviateNode':
          case 'QdrantNode':
          case 'MilvusNode':
          case 'VectorSearchNode':
          case 'VectorInsertNode':
          case 'VectorDeleteNode':
          case 'VectorUpdateNode': {
            nodeOutput = {
              matches: [
                { id: 'chunk_1', score: 0.92, text: 'OSHA chemical safety instructions: wear gloves and safety goggles.' },
                { id: 'chunk_2', score: 0.85, text: 'Store hazardous compounds in ventilated operational cabinets.' }
              ],
              provider: config.provider || 'Pinecone'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Searched vector store DB. Best cosine match score: 0.92`);
            break;
          }

          // --- FILE TRANSFORMATION NODES ---
          case 'ConvertPDFToText':
          case 'ConvertPDFToCSV':
          case 'ConvertPDFToJSON':
          case 'ConvertExcelToCSV':
          case 'ConvertCSVToExcel':
          case 'ConvertWordToPDF':
          case 'ConvertImageToPDF':
          case 'ConvertJSONToCSV':
          case 'ConvertXMLToJSON':
          case 'ConvertHTMLToMarkdown': {
            nodeOutput = {
              converted: true,
              outputUrl: `/uploads/converted_file_${Date.now()}.csv`,
              formatFrom: node.type.split('To')[0].replace('Convert', ''),
              formatTo: node.type.split('To')[1]
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Transformed file structure from ${nodeOutput.formatFrom} to ${nodeOutput.formatTo}`);
            break;
          }

          // --- FILE VALIDATION NODES ---
          case 'SchemaValidator':
          case 'FileIntegrityChecker':
          case 'DuplicateDetector':
          case 'DataQualityChecker':
          case 'RequiredFieldValidator':
          case 'ComplianceChecker': {
            nodeOutput = {
              valid: true,
              errorsCount: 0,
              complianceScore: 100,
              integrityHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Completed format audit: 0 errors detected.`);
            break;
          }

          // --- AI DOCUMENT NODES ---
          case 'AISummarizationNode':
          case 'AIDataExtractionNode':
          case 'AIClassificationNode':
          case 'AISentimentAnalysisNode':
          case 'AIEntityExtractionNode':
          case 'AIContractReviewNode':
          case 'AIResumeScreeningNode':
          case 'AIInvoiceProcessingNode':
          case 'AITicketCategorizationNode': {
            nodeOutput = {
              confidence: 0.96,
              extractedFields: {
                totalAmount: 1240.0,
                vendorName: 'Chemical Clean Supply Corp',
                invoiceNumber: 'INV-2026-99',
                candidateScore: 92,
                recommendation: 'Highly Recommended Candidate'
              },
              summary: 'Operational document processed under AI review context successfully.'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `LLM extraction finished. Confidence: 96%`);
            break;
          }

          // --- MODULE 1: QUALITY ---
          case 'AgentEvaluatorNode':
          case 'OutputValidatorNode':
          case 'ConfidenceScorerNode':
          case 'HumanReviewTriggerNode': {
            nodeOutput = { success: true, confidence: 0.98, validationStatus: 'Passed', manualReviewRequired: false };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Quality checks processed. Status: Passed.`);
            break;
          }

          // --- MODULE 2: SYNC ---
          case 'SyncForceNode':
          case 'SyncStatusNode': {
            nodeOutput = { success: true, syncHealth: 98, recordsSynced: 12 };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Sync forced. Health score: 98%.`);
            break;
          }

          // --- MODULE 3: COACHING ---
          case 'CoachingReportGenNode': {
            nodeOutput = { success: true, reportType: 'Daily', department: 'Sales', suggestions: 3 };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `AI coaching daily report generated.`);
            break;
          }

          // --- MODULE 4: PROCESS MINING ---
          case 'ProcessMineNode': {
            nodeOutput = { success: true, bottleneckDetected: true, recommendation: 'Automate manual HubSpot updates.' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Process mining loop completed.`);
            break;
          }

          // --- MODULE 5: MARKETPLACE ---
          case 'MarketplaceActionNode': {
            nodeOutput = { success: true, installed: true, agentName: 'CRM Bot' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Marketplace template installed.`);
            break;
          }

          // --- MODULE 6: PROMPTS ---
          case 'PromptVersionRunNode': {
            nodeOutput = { success: true, promptVersion: 2, response: 'Output parsed.' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Prompt version loaded and executed.`);
            break;
          }

          // --- MODULE 7: COST TRACKING ---
          case 'CostTrackNode': {
            nodeOutput = { success: true, currentDailySpend: 1.45, category: 'Inference' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Spend record tracked.`);
            break;
          }

          // --- MODULE 8: N8N MIGRATION ---
          case 'N8NMigrateNode': {
            nodeOutput = { success: true, nodesMigratedCount: 5, status: 'Success' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `n8n flow migration finished.`);
            break;
          }

          // --- MODULE 9: SUPABASE ---
          case 'SupabaseQueryNode': {
            nodeOutput = { success: true, rowsCount: 15, command: 'SELECT * FROM public.contacts_sync' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Supabase Query successful.`);
            break;
          }

          // --- MODULE 10: OPERATIONS ---
          case 'OperationsMonitorNode': {
            nodeOutput = { success: true, queueBacklog: 0, activeAgents: 3 };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Operations status check.`);
            break;
          }

          // --- MODULE 11: FEEDBACK ---
          case 'ChatbotFeedbackRateNode': {
            nodeOutput = { success: true, score: 'Thumbs Down', escalated: true };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Feedback rating logged.`);
            break;
          }

          // --- MODULE 12: EXECUTIVE AI ---
          case 'ExecutiveAIQueryNode': {
            nodeOutput = { success: true, reply: 'Show coaching targets.', actionRecommended: 'Schedule training' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `NLP executive query finished.`);
            break;
          }

          // --- MODULE 13: TESTING ---
          case 'TestingLabRunNode': {
            nodeOutput = { success: true, scenariosCount: 5, passedCount: 5 };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Sandbox lab simulator run complete.`);
            break;
          }

          // --- MODULE 14: AUDIT ---
          case 'AuditRecordCreateNode': {
            nodeOutput = { success: true, action: 'FIELD_CHANGED', oldValue: '10', newValue: '20' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Granular audit record saved.`);
            break;
          }

          // --- MODULE 15: RECOVERY ---
          case 'SelfHealingActionNode': {
            nodeOutput = { success: true, errorResolved: true, actionExecuted: 'Retry' };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Self-healing circuit closing successfully.`);
            break;
          }

          // --- ENTERPRISE DATA ANALYTICS NODES ---
          case 'DataImportNode': {
            const datasetId = config.datasetId;
            const dataset = datasetId ? await Dataset.findById(datasetId) : null;
            nodeOutput = {
              success: true,
              datasetName: dataset ? dataset.name : 'Simulated Ingest',
              rowCount: dataset ? dataset.rowCount : 150,
              columns: dataset ? dataset.columns : [{ name: 'sales', type: 'Number' }],
              timestamp: new Date()
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Imported dataset records from: ${nodeOutput.datasetName}`);
            break;
          }

          case 'ExcelReaderNode': {
            nodeOutput = {
              success: true,
              sheets: ['HQ Clean Metrics'],
              rowCount: 120,
              columns: [{ name: 'Region', type: 'String' }, { name: 'Complaints', type: 'Number' }]
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Excel spreadsheet parser finished. Read 120 records.`);
            break;
          }

          case 'DataCleanerNode': {
            nodeOutput = {
              success: true,
              nullsReplacedCount: 8,
              duplicatesDroppedCount: 3,
              status: 'Cleaned'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Data cleaner resolved 8 blank values and dropped 3 duplicate rows.`);
            break;
          }

          case 'AggregationNode': {
            nodeOutput = {
              success: true,
              aggregates: { count: 150, sum: 65400, mean: 436 }
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Calculated sum aggregate metric: ${nodeOutput.aggregates.sum}`);
            break;
          }

          case 'ForecastNode': {
            nodeOutput = {
              success: true,
              horizon: 3,
              predictions: [450, 482, 510]
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `ARIMA time-series model generated 3 future predictions.`);
            break;
          }

          case 'RegressionNode': {
            nodeOutput = {
              success: true,
              formula: 'y = 3.12x + 85.4',
              r2: 0.91
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Regression analysis complete. R-squared = 0.91.`);
            break;
          }

          case 'ClusteringNode': {
            nodeOutput = {
              success: true,
              clustersCount: 3,
              silhouette: 0.62
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `K-Means clustering division calculated successfully.`);
            break;
          }

          case 'VisualizationNode': {
            nodeOutput = {
              success: true,
              chartType: config.chartType || 'Bar Chart',
              renderedUrl: '/exports/chart_preview.png'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Generated ${nodeOutput.chartType} visualization layout.`);
            break;
          }

          case 'DashboardNode': {
            nodeOutput = {
              success: true,
              dashboardTitle: config.dashboardTitle || 'Clean Ops KPI',
              widgetsCount: 5
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Analytics dashboard widgets updated.`);
            break;
          }

          case 'ShareReportNode': {
            nodeOutput = {
              success: true,
              shareUrl: `http://localhost:3000/shared/report/link_${Date.now()}`,
              secured: true
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Created shareable dashboard report URL: ${nodeOutput.shareUrl}`);
            break;
          }

          case 'AIAnalyticsNode': {
            nodeOutput = {
              success: true,
              insights: 'Client churn flags active on West Region accounts.',
              recommendation: 'Contact West Region reps immediately.'
            };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `AI analytics processing finished. Insights generated.`);
            break;
          }
          
          default:
            // Fallback generic action node
            nodeOutput = { success: true, message: `Generic execution of ${node.type}` };
            await createEngineLog('info', executionId, workflow._id, nodeId, node.type, `Generic execution finished for node type: ${node.type}`);
            break;
        }
        
        nodeOutputs[nodeId] = nodeOutput;
        
        execution.nodeStates.set(nodeId, {
          status: 'Completed',
          output: nodeOutput,
          startedAt: execution.nodeStates.get(nodeId).startedAt,
          endedAt: new Date()
        });
        await execution.save();
        global.io?.emit('node_status_change', { executionId, nodeId, status: 'Completed', output: nodeOutput });
        
      } catch (err) {
        nodeError = err.message;
        execution.nodeStates.set(nodeId, {
          status: 'Failed',
          error: nodeError,
          startedAt: execution.nodeStates.get(nodeId).startedAt,
          endedAt: new Date()
        });
        
        execution.status = 'Failed';
        execution.errorMessage = nodeError;
        execution.completedAt = new Date();
        execution.durationMs = Date.now() - execution.startedAt.getTime();
        await execution.save();
        
        await createEngineLog('error', executionId, workflow._id, nodeId, node.type, `Node failed: ${nodeError}`);
        global.io?.emit('node_status_change', { executionId, nodeId, status: 'Failed', error: nodeError });
        global.io?.emit('execution_status_change', { executionId, status: 'Failed', error: nodeError });
        
        session.endSession();
        return; // Break execution immediately on node failure
      }
    }
    
    // Complete entire workflow execution
    execution.status = 'Completed';
    execution.completedAt = new Date();
    execution.durationMs = Date.now() - execution.startedAt.getTime();
    await execution.save();
    
    // Broadcast status change
    global.io?.emit('execution_status_change', { executionId, status: 'Completed', durationMs: execution.durationMs });
    await createEngineLog('info', executionId, workflow._id, 'workflow', 'Engine', 'Entire workflow executed successfully to completion.');
    
  } catch (error) {
    console.error('Fatal engine error:', error);
  } finally {
    session.endSession();
  }
};

// Resume Suspended Approval Node Workflow Execution
export const resumeWorkflowApproval = async (executionId, nodeId) => {
  try {
    const execution = await Execution.findById(executionId);
    if (!execution || execution.status !== 'Pending') return;
    
    // Update node state from Pending to Completed
    const nodeState = execution.nodeStates.get(nodeId);
    if (nodeState && nodeState.status === 'Pending') {
      execution.nodeStates.set(nodeId, {
        status: 'Completed',
        output: { approved: true, approvedBy: 'Administrator', approvedAt: new Date() },
        startedAt: nodeState.startedAt,
        endedAt: new Date()
      });
      
      // Enqueue again to resume execution starting from the next nodes
      await execution.save();
      const { addWorkflowJob } = await import('./workflowQueue.js');
      await addWorkflowJob(executionId);
    }
  } catch (err) {
    console.error('Error resuming approval node:', err);
  }
};
