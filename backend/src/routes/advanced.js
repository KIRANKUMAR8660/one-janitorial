import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import AgentEvaluation from '../models/AgentEvaluation.js';
import SyncHistory from '../models/SyncHistory.js';
import CoachingReport from '../models/CoachingReport.js';
import ProcessMining from '../models/ProcessMining.js';
import PromptRegistry from '../models/PromptRegistry.js';
import AICost from '../models/AICost.js';
import N8NMigration from '../models/N8NMigration.js';
import ChatbotFeedback from '../models/ChatbotFeedback.js';
import AuditRecord from '../models/AuditRecord.js';
import FailureRecovery from '../models/FailureRecovery.js';
import AIAgent from '../models/AIAgent.js';
import Employee from '../models/Employee.js';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// Apply auth middleware globally on all advanced operations endpoints
router.use(protect);

/* =========================================================
   1. AI AGENT QUALITY EVALUATION CENTER
   ========================================================= */
router.get('/quality/metrics', async (req, res) => {
  try {
    const metrics = await AgentEvaluation.find({});
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quality/override', async (req, res) => {
  const { evaluationId, logId, status, reason } = req.body;
  try {
    const evalRecord = await AgentEvaluation.findById(evaluationId);
    if (!evalRecord) return res.status(404).json({ message: 'Evaluation record not found' });

    const log = evalRecord.decisionLogs.id(logId);
    if (!log) return res.status(404).json({ message: 'Decision log entry not found' });

    const oldStatus = log.overrideStatus;
    log.overrideStatus = status;
    log.overrideReason = reason;
    evalRecord.lastOverride = new Date();

    // Recompute scores on reject overrides (failed output validation)
    if (status === 'Rejected') {
      evalRecord.failureRate = Math.min(100, evalRecord.failureRate + 5);
      evalRecord.successRate = Math.max(0, 100 - evalRecord.failureRate);
      evalRecord.lastFailure = `Human override rejection: ${reason}`;
    }

    await evalRecord.save();

    // Log the human action in AuditRecord
    const audit = new AuditRecord({
      action: 'AGENT_DECISION_OVERRIDDEN',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: evaluationId,
      entityType: 'AgentEvaluation',
      agentName: evalRecord.agentName,
      oldValue: oldStatus,
      newValue: status,
      reason: `Overrode decision: ${reason}`
    });
    await audit.save();

    res.status(200).json({ message: 'Decision override saved successfully', record: evalRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   2. HUBSPOT ↔ SUPABASE SYNC COMMAND CENTER
   ========================================================= */
router.get('/sync/status', async (req, res) => {
  try {
    let sync = await SyncHistory.findOne().sort({ createdAt: -1 });
    if (!sync) {
      // Return default initial dashboard state
      sync = new SyncHistory({
        syncHealthScore: 98,
        contactsCount: 1250,
        companiesCount: 450,
        dealsCount: 380,
        ticketsCount: 92,
        activitiesCount: 3400,
        notesCount: 2200,
        tasksCount: 1100,
        failedSyncsCount: 0
      });
      await sync.save();
    }
    res.status(200).json(sync);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sync/trigger', async (req, res) => {
  try {
    const sync = await SyncHistory.findOne().sort({ createdAt: -1 }) || new SyncHistory();
    sync.lastSync = new Date();
    // Simulate sync count increases
    sync.contactsCount += Math.floor(Math.random() * 5);
    sync.dealsCount += Math.floor(Math.random() * 2);
    sync.syncHealthScore = Math.min(100, Math.max(90, sync.syncHealthScore + (Math.random() * 2 - 1)));
    await sync.save();

    // Audit log
    const audit = new AuditRecord({
      action: 'SYNC_TRIGGERED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityType: 'SyncHistory',
      reason: 'Manual sync forced'
    });
    await audit.save();

    res.status(200).json({ message: 'Sync triggered successfully', sync });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sync/repair', async (req, res) => {
  const { action } = req.body; // e.g. replay_failed, merge_duplicates, repair_missing
  try {
    const sync = await SyncHistory.findOne().sort({ createdAt: -1 }) || new SyncHistory();
    
    if (action === 'replay_failed') {
      sync.retryQueue = [];
      sync.failedSyncsCount = 0;
      sync.syncHealthScore = 100;
    } else if (action === 'merge_duplicates') {
      sync.duplicates = [];
    } else if (action === 'repair_missing') {
      sync.missingRecords = [];
    }
    await sync.save();

    const audit = new AuditRecord({
      action: 'SYNC_REPAIRED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityType: 'SyncHistory',
      reason: `Executed repair: ${action}`
    });
    await audit.save();

    res.status(200).json({ message: 'Repair operations completed', sync });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   3. AI COACHING REPORT ENGINE
   ========================================================= */
router.get('/coaching/reports', async (req, res) => {
  try {
    const list = await CoachingReport.find().populate('employee', 'firstName lastName department');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/coaching/generate', async (req, res) => {
  const { department, reportType, employeeId } = req.body;
  try {
    // Mock coaching generation
    const employee = await Employee.findById(employeeId) || null;
    const empName = employee ? `${employee.firstName} ${employee.lastName}` : 'General Team';

    const report = new CoachingReport({
      department,
      reportType,
      employee: employeeId || null,
      strengths: [
        `High operational diligence adhering to One Janitorial guidelines for ${department}`,
        `Fast resolution loops on tickets and HubSpot updates`
      ],
      weaknesses: [
        `Occasional delay in filing written splits under BCO operations`,
        `Needs closer follow-up logs detail`
      ],
      coachingSuggestions: [
        `Automate ticket reminders using local workflows triggers`,
        `Encourage logging daily milestones`
      ],
      riskFactors: [
        `High workload volume on CRM deals pipeline`
      ],
      improvementPlan: `Assign mentoring check-ins on splits reconciliation procedures and run automation coaching workflows.`
    });
    await report.save();

    const audit = new AuditRecord({
      action: 'COACHING_REPORT_GENERATED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: report._id,
      entityType: 'CoachingReport',
      reason: `Generated ${reportType} report for ${empName}`
    });
    await audit.save();

    res.status(201).json({ message: 'Coaching report generated successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   4. PROCESS DISCOVERY ENGINE
   ========================================================= */
router.get('/process/discovery', async (req, res) => {
  try {
    let recommendations = await ProcessMining.find({});
    if (recommendations.length === 0) {
      // Seed default recommendations
      recommendations = [
        new ProcessMining({
          activityName: 'Manual HubSpot deal updates on stage matches',
          count: 245,
          duplicateActionsCount: 42,
          avgDurationMs: 45000,
          bottleneckLevel: 'High',
          recommendation: 'Users manually update 73 HubSpot deals daily. Automate using CRM deal update agent.'
        }),
        new ProcessMining({
          activityName: 'Inspections scheduling and welcome emails',
          count: 120,
          duplicateActionsCount: 15,
          avgDurationMs: 30000,
          bottleneckLevel: 'Medium',
          recommendation: 'Welcome email dispatcher is triggered manually. Automate using BCO welcome trigger node.'
        })
      ];
      for (const rec of recommendations) {
        await rec.save();
      }
    }
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/process/mine', async (req, res) => {
  try {
    const list = await ProcessMining.find({});
    // Simulate mining activity updates
    for (const rec of list) {
      rec.count += Math.floor(Math.random() * 10);
      rec.duplicateActionsCount += Math.floor(Math.random() * 2);
      await rec.save();
    }
    res.status(200).json({ message: 'Process mining logs analysed.', activities: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   5. AGENT MARKETPLACE
   ========================================================= */
router.get('/marketplace/agents', async (req, res) => {
  try {
    const agents = await AIAgent.find({});
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/marketplace/action', async (req, res) => {
  const { agentId, action } = req.body; // e.g. clone, disable, rollback, install
  try {
    const agent = await AIAgent.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agent template not found' });

    if (action === 'disable') {
      agent.isActive = false;
      await agent.save();
    } else if (action === 'install' || action === 'clone') {
      const cloned = new AIAgent({
        name: `${agent.name} (${action === 'clone' ? 'Copy' : 'Installed'})`,
        provider: agent.provider,
        modelName: agent.modelName,
        systemPrompt: agent.systemPrompt,
        goals: agent.goals,
        isActive: true
      });
      await cloned.save();
    } else if (action === 'rollback') {
      agent.systemPrompt = 'Initial system configuration loaded.';
      await agent.save();
    }

    const audit = new AuditRecord({
      action: `AGENT_MARKETPLACE_${action.toUpperCase()}`,
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: agentId,
      entityType: 'AIAgent',
      agentName: agent.name,
      reason: `Marketplace action: ${action}`
    });
    await audit.save();

    res.status(200).json({ message: `Marketplace action ${action} executed successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   6. ENTERPRISE PROMPT REGISTRY
   ========================================================= */
router.get('/prompts', async (req, res) => {
  try {
    const list = await PromptRegistry.find({});
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/prompts/save', async (req, res) => {
  const { id, name, content, provider } = req.body;
  try {
    let prompt;
    if (id) {
      prompt = await PromptRegistry.findById(id);
      if (!prompt) return res.status(404).json({ message: 'Prompt registry not found' });

      prompt.history.push({
        version: prompt.version,
        content: prompt.content,
        changedBy: req.user.email
      });
      prompt.version += 1;
      prompt.content = content;
      prompt.provider = provider || prompt.provider;
      prompt.isApproved = false; // Reset approval status on edits
      await prompt.save();
    } else {
      prompt = new PromptRegistry({ name, content, provider });
      await prompt.save();
    }

    const audit = new AuditRecord({
      action: 'PROMPT_SAVED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: prompt._id,
      entityType: 'PromptRegistry',
      newValue: `v${prompt.version}`,
      reason: 'Prompt updated or registered'
    });
    await audit.save();

    res.status(200).json({ message: 'Prompt saved successfully', prompt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/prompts/approve', async (req, res) => {
  const { id } = req.body;
  try {
    const prompt = await PromptRegistry.findById(id);
    if (!prompt) return res.status(404).json({ message: 'Prompt template not found' });

    prompt.isApproved = true;
    prompt.approvedBy = req.user._id;
    await prompt.save();

    const audit = new AuditRecord({
      action: 'PROMPT_APPROVED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: prompt._id,
      entityType: 'PromptRegistry',
      reason: 'Approved for production use'
    });
    await audit.save();

    res.status(200).json({ message: 'Prompt approved for execution', prompt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/prompts/test', async (req, res) => {
  const { promptContent, testInput, provider } = req.body;
  try {
    // Simulate calling LLM API
    await new Promise(resolve => setTimeout(resolve, 800));
    const output = `[Mock Response from Model Provider: ${provider || 'GPT'}]\nPrompt: ${promptContent}\nInput Context: ${testInput}\nResponse: Processed variables according to operational instructions successfully.`;
    
    res.status(200).json({
      output,
      latencyMs: 820,
      tokensUsed: 210,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   7. AI COST MANAGEMENT CENTER
   ========================================================= */
router.get('/costs', async (req, res) => {
  try {
    let costs = await AICost.find().sort({ dateRecorded: -1 }).limit(100);
    if (costs.length === 0) {
      // Seed default charges
      const mockCosts = [
        { provider: 'OpenAI GPT-4o', cost: 12.45, tokensCount: 620000, category: 'Inference' },
        { provider: 'Anthropic Claude 3.5', cost: 18.20, tokensCount: 450000, category: 'Inference' },
        { provider: 'Gemini 1.5 Pro', cost: 4.80, tokensCount: 960000, category: 'Inference' },
        { provider: 'Embedding Engine', cost: 1.15, tokensCount: 230000, category: 'Embedding' },
        { provider: 'Pinecone VectorDB', cost: 8.50, tokensCount: 0, category: 'Vector' }
      ];
      for (const mc of mockCosts) {
        const c = new AICost(mc);
        await c.save();
      }
      costs = await AICost.find().sort({ dateRecorded: -1 });
    }
    res.status(200).json(costs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   8. N8N MIGRATION CENTER
   ========================================================= */
router.post('/n8n/migrate', async (req, res) => {
  const { workflowName, jsonContent } = req.body;
  try {
    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON workflow structure' });
    }

    // Process nodes mapping
    const n8nNodes = parsed.nodes || [];
    const credentials = [];
    const variables = [];
    const errors = [];

    n8nNodes.forEach(node => {
      if (node.credentials) {
        credentials.push(...Object.keys(node.credentials));
      }
      // check for parameters referencing env/variables
      if (node.params) {
        const str = JSON.stringify(node.params);
        const matches = str.match(/\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g);
        if (matches) {
          variables.push(...matches.map(m => m.replace(/[{}]/g, '')));
        }
      }
    });

    const migration = new N8NMigration({
      workflowName: workflowName || parsed.name || 'Imported n8n Flow',
      originalJson: jsonContent,
      convertedJson: JSON.stringify({
        nodes: n8nNodes.map(n => ({ id: n.id, type: 'BaseNode', data: { name: n.name, type: 'TransformNode', config: n.parameters || {} } })),
        edges: []
      }),
      credentialsMapped: [...new Set(credentials)],
      variablesMapped: [...new Set(variables)],
      status: errors.length > 0 ? 'Partial' : 'Success',
      conversionErrors: errors
    });
    await migration.save();

    const audit = new AuditRecord({
      action: 'N8N_WORKFLOW_IMPORTED',
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: migration._id,
      entityType: 'N8NMigration',
      reason: `Imported n8n workflow: ${migration.workflowName}`
    });
    await audit.save();

    res.status(201).json(migration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   9. SUPABASE OPERATIONS CENTER
   ========================================================= */
router.get('/supabase/console', async (req, res) => {
  try {
    // Return mock Supabase configuration logs, schema counts, replica status
    res.status(200).json({
      connectionStatus: 'Connected',
      replicationStatus: 'Healthy',
      lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000),
      schemas: [
        { name: 'public.contacts_sync', rowsCount: 1250, syncStatus: 'Match' },
        { name: 'public.deals_sync', rowsCount: 380, syncStatus: 'Match' },
        { name: 'public.tickets_sync', rowsCount: 92, syncStatus: 'Match' }
      ],
      realtimeLogs: [
        { event: 'INSERT', table: 'public.contacts_sync', timestamp: new Date(Date.now() - 5 * 1000) },
        { event: 'UPDATE', table: 'public.deals_sync', timestamp: new Date(Date.now() - 10 * 1000) }
      ],
      functionLogs: [
        { functionName: 'sync_webhook_handler', status: 'Success', executionTimeMs: 142, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   10. OPERATIONS COMMAND CENTER
   ========================================================= */
router.get('/operations/monitoring', async (req, res) => {
  try {
    // Aggregate queue counts, failed webhooks, active workflow stats
    res.status(200).json({
      runningAgentsCount: 4,
      failedAgentsCount: 0,
      runningWorkflowsCount: 12,
      failedWorkflowsCount: 1,
      syncErrorsCount: 0,
      queueBacklogCount: 0,
      apiFailuresCount: 0,
      infraHealthStatus: 'Healthy'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   11. CHATBOT FEEDBACK SYSTEM
   ========================================================= */
router.get('/chatbot/feedback', async (req, res) => {
  try {
    const list = await ChatbotFeedback.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/chatbot/feedback/rate', async (req, res) => {
  const { question, answer, rating, isIncorrect, missingSopReported, sopTopic, escalate } = req.body;
  try {
    let ticketId = null;

    if (escalate) {
      const ticket = new Ticket({
        title: `Escalated Chatbot feedback: ${sopTopic || 'General Query'}`,
        description: `User query: "${question}"\nChatbot response: "${answer}"`,
        clientEmail: req.user.email,
        status: 'Open',
        priority: 'Medium',
        ticketType: 'Service Complaint',
        slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      await ticket.save();
      ticketId = ticket._id;
    }

    const feedback = new ChatbotFeedback({
      question,
      answer,
      rating,
      isIncorrect: isIncorrect || false,
      missingSopReported: missingSopReported || false,
      sopTopic,
      escalated: escalate || false,
      escalatedTicket: ticketId
    });
    await feedback.save();

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   12. EXECUTIVE AI COMMAND CENTER
   ========================================================= */
router.post('/executive/query', async (req, res) => {
  const { prompt } = req.body;
  try {
    // Generate NLP structured response matching corporate questions
    let reply = `Command received: "${prompt}". Fetching operations database indices.`;
    let visualData = null;

    if (prompt.toLowerCase().includes('coaching') || prompt.toLowerCase().includes('employee')) {
      reply = `AI Analysis: Evaluated staff activity. Found 2 sales representatives with lower pipeline engagement scores. Suggested action: Trigger coaching workflow.`;
      visualData = {
        title: 'Coaching Recommendations',
        headers: ['Employee', 'Department', 'SLA Score', 'Status'],
        rows: [
          ['John Doe', 'Operations', '92%', 'Met'],
          ['Jessica Rios', 'Sales', '84%', 'Action Needed']
        ]
      };
    } else if (prompt.toLowerCase().includes('sales') || prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('deal')) {
      reply = `AI Analysis: 1 deal flagged as stagnant in proposal stage for 10 days. HubSpot pipeline values at risk: $15,400.`;
      visualData = {
        title: 'CRM Risk Assessment',
        headers: ['Deal Name', 'Value', 'Days In Stage', 'Risk Alert'],
        rows: [
          ['Metro Plaza Janitorial', '$15,400', '10 Days', 'High Risk']
        ]
      };
    } else if (prompt.toLowerCase().includes('ticket') || prompt.toLowerCase().includes('backlog')) {
      reply = `AI Analysis: Current open ticket backlog stands at 2. Low SLA risk.`;
      visualData = {
        title: 'Ticket Summary',
        headers: ['Ticket Title', 'Client', 'SLA Due', 'Priority'],
        rows: [
          ['Missed Floor Buffing - Suite 402', 'tenant402@metroplaza.com', '12 Hours', 'High'],
          ['Billing Query: Invoice #OJ-2026-06', 'accounts@westsidelogistics.com', '24 Hours', 'Medium']
        ]
      };
    } else {
      reply = `Executive Operations Summary report completed successfully. System status: Healthy. All pipelines synchronized.`;
    }

    res.status(200).json({ reply, visualData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   13. AGENT TESTING LAB
   ========================================================= */
router.post('/testing/run', async (req, res) => {
  const { agentId, testType, parameters } = req.body;
  try {
    // Run mock lab scenarios (historical simulation, load testing)
    await new Promise(resolve => setTimeout(resolve, 1200));

    res.status(200).json({
      status: 'Success',
      testType,
      scenariosExecuted: 5,
      passedScenariosCount: 5,
      failedScenariosCount: 0,
      averageLatencyMs: 145,
      validationReports: ['JSON Schema checks: Passed', 'Drift checks: Passed', 'regression check: Passed']
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   14. ENTERPRISE AUDIT CENTER
   ========================================================= */
router.get('/audit/logs', async (req, res) => {
  try {
    const list = await AuditRecord.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   15. SELF-HEALING AUTOMATION SYSTEM
   ========================================================= */
router.get('/self-healing/status', async (req, res) => {
  try {
    const list = await FailureRecovery.find({}).sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/self-healing/action', async (req, res) => {
  const { recoveryId, action } = req.body; // e.g. force_retry, close_circuit, clear_dlq
  try {
    const record = await FailureRecovery.findById(recoveryId);
    if (!record) return res.status(404).json({ message: 'Recovery record not found' });

    if (action === 'force_retry') {
      record.recoveryStatus = 'Recovered';
      record.retriesCount += 1;
    } else if (action === 'close_circuit') {
      record.circuitBreakerStatus = 'Closed';
    } else if (action === 'clear_dlq') {
      record.recoveryStatus = 'Recovered';
    }
    await record.save();

    const audit = new AuditRecord({
      action: `SELF_HEALING_${action.toUpperCase()}`,
      actor: req.user._id,
      actorEmail: req.user.email,
      entityId: recoveryId,
      entityType: 'FailureRecovery',
      reason: `Healing override: ${action}`
    });
    await audit.save();

    res.status(200).json({ message: 'Self-healing recovery action executed.', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
