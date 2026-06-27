import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';
import fs from 'fs';
import path from 'path';
import WorkflowLog from '../models/WorkflowLog.js';
import AIAgent from '../models/AIAgent.js';
import { validateWorkflowDAG } from '../services/dagValidation.js';
import { addWorkflowJob } from '../services/workflowQueue.js';

// 1. Create Workflow
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    const workflow = new Workflow({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      createdBy: req.user?._id
    });
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Workflows List
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find().populate('createdBy', 'email');
    res.status(200).json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Workflow
export const updateWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, isActive } = req.body;
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found.' });
    }
    
    if (name !== undefined) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (isActive !== undefined) workflow.isActive = isActive;
    
    workflow.version += 1;
    await workflow.save();
    res.status(200).json(workflow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Workflow
export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found.' });
    }
    await workflow.deleteOne();
    res.status(200).json({ message: 'Workflow deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Validate DAG
export const validateWorkflow = (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const validation = validateWorkflowDAG(nodes || [], edges || []);
    res.status(200).json(validation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Execute Workflow
export const executeWorkflow = async (req, res) => {
  try {
    const { workflowId, triggerData } = req.body;
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found.' });
    }
    
    // Validate DAG first
    const dagResult = validateWorkflowDAG(workflow.nodes, workflow.edges);
    if (!dagResult.isDag) {
      return res.status(400).json({
        message: 'Cannot execute workflow: Circular dependency detected.',
        errors: dagResult.errors
      });
    }
    
    // Find initial trigger node ID
    const triggerNode = workflow.nodes.find(n => n.type === 'TriggerNode' || n.type.includes('Trigger') || n.type.includes('Scheduler'));
    const triggerNodeId = triggerNode ? triggerNode.id : 'trigger';
    
    // Create Execution record
    const execution = new Execution({
      workflow: workflow._id,
      status: 'Pending',
      triggerNodeId,
      triggerData: triggerData || {},
      executionPath: dagResult.executionPath
    });
    await execution.save();
    
    // Enqueue execution job
    await addWorkflowJob(execution._id);
    
    res.status(200).json({
      message: 'Workflow execution successfully scheduled.',
      executionId: execution._id,
      validation: dagResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Get Executions list
export const getExecutions = async (req, res) => {
  try {
    const { workflowId } = req.query;
    const filter = workflowId ? { workflow: workflowId } : {};
    const executions = await Execution.find(filter)
      .populate('workflow', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(executions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Get Execution logs
export const getLogs = async (req, res) => {
  try {
    const { executionId } = req.query;
    if (!executionId) {
      return res.status(400).json({ message: 'executionId is required.' });
    }
    const logs = await WorkflowLog.find({ execution: executionId }).sort({ createdAt: 1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. Parse Smart Variables from text
export const parseVariables = (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(200).json({ variables: [] });
    }
    
    const regex = /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }
    res.status(200).json({ variables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10. Create AI Agent
export const createAIAgent = async (req, res) => {
  try {
    const agent = new AIAgent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 11. Update AI Agent
export const updateAIAgent = async (req, res) => {
  try {
    const agent = await AIAgent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) {
      return res.status(404).json({ message: 'AI Agent not found.' });
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 12. Upload Workflow File
export const uploadWorkflowFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { originalname, filename, size, mimetype, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    
    // Normalize path to relative URL format
    const relativeUrl = `/uploads/${filename}`;
    
    let sampleContent = '';
    
    // Read text preview for common file types
    if (['.txt', '.csv', '.json', '.md', '.xml', '.yaml', '.yml'].includes(ext)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        sampleContent = fileContent.substring(0, 2000); // 2000 chars preview
      } catch (err) {
        sampleContent = 'Error reading preview: ' + err.message;
      }
    } else {
      sampleContent = `Preview not available for binary type ${ext}.`;
    }

    res.status(200).json({
      fileName: originalname,
      fileSize: size,
      fileType: mimetype,
      storageLocation: relativeUrl,
      sampleContent,
      uploadedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
