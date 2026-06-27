import CustomAPI from '../models/CustomAPI.js';
import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';
import { executeWorkflowEngine } from '../services/workflowEngine.js';
import { validateWorkflowDAG } from '../services/dagValidation.js';
import jwt from 'jsonwebtoken';

// 1. Get Custom APIs
export const getCustomAPIs = async (req, res) => {
  try {
    const list = await CustomAPI.find().populate('workflow', 'name');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create Custom API
export const createCustomAPI = async (req, res) => {
  try {
    const { name, description, routePath, method, version, authRequired, rateLimit, workflow, validationRules } = req.body;
    
    // Auto-generate basic OpenAPI swagger schema for documentation
    const swaggerDoc = {
      openapi: '3.0.0',
      info: {
        title: name,
        description: description || 'Dynamically generated enterprise API endpoint.',
        version: version || '1.0.0'
      },
      paths: {
        [`/api/custom-run/${version || '1.0.0'}/${routePath}`]: {
          [method.toLowerCase()]: {
            summary: name,
            description: description || 'Execute custom logic via workflow automation',
            security: authRequired ? [{ BearerAuth: [] }] : [],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: (validationRules || []).reduce((acc, rule) => {
                      acc[rule.fieldName] = { type: rule.fieldType.toLowerCase() };
                      return acc;
                    }, {})
                  }
                }
              }
            },
            responses: {
              200: { description: 'Successful execution response' },
              400: { description: 'Input parameter validation failure' },
              401: { description: 'Unauthorized authentication header' },
              429: { description: 'Rate limiting threshold exceeded' },
              500: { description: 'Internal workflow compilation error' }
            }
          }
        }
      }
    };

    const newAPI = new CustomAPI({
      name,
      description,
      routePath,
      method,
      version: version || '1.0.0',
      authRequired: authRequired !== undefined ? authRequired : true,
      rateLimit: rateLimit || 60,
      workflow,
      validationRules: validationRules || [],
      swaggerDoc
    });

    await newAPI.save();
    res.status(201).json(newAPI);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Custom API
export const updateCustomAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, method, status, authRequired, rateLimit, workflow, validationRules } = req.body;
    
    const api = await CustomAPI.findById(id);
    if (!api) return res.status(404).json({ message: 'Custom API not found.' });

    if (name !== undefined) api.name = name;
    if (description !== undefined) api.description = description;
    if (method !== undefined) api.method = method;
    if (status !== undefined) api.status = status;
    if (authRequired !== undefined) api.authRequired = authRequired;
    if (rateLimit !== undefined) api.rateLimit = rateLimit;
    if (workflow !== undefined) api.workflow = workflow;
    if (validationRules !== undefined) api.validationRules = validationRules;

    // Recalculate Swagger doc
    api.swaggerDoc = {
      openapi: '3.0.0',
      info: {
        title: api.name,
        description: api.description || 'Dynamically generated enterprise API endpoint.',
        version: api.version
      },
      paths: {
        [`/api/custom-run/${api.version}/${api.routePath}`]: {
          [api.method.toLowerCase()]: {
            summary: api.name,
            description: api.description || 'Execute custom logic via workflow automation',
            security: api.authRequired ? [{ BearerAuth: [] }] : [],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: api.validationRules.reduce((acc, rule) => {
                      acc[rule.fieldName] = { type: rule.fieldType.toLowerCase() };
                      return acc;
                    }, {})
                  }
                }
              }
            },
            responses: {
              200: { description: 'Successful execution response' },
              400: { description: 'Input parameter validation failure' }
            }
          }
        }
      }
    };

    await api.save();
    res.status(200).json(api);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Custom API
export const deleteCustomAPI = async (req, res) => {
  try {
    const { id } = req.params;
    await CustomAPI.findByIdAndDelete(id);
    res.status(200).json({ message: 'Custom API deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Get Custom API Logs
export const getCustomAPILogs = async (req, res) => {
  try {
    const { id } = req.params;
    const api = await CustomAPI.findById(id);
    if (!api) return res.status(404).json({ message: 'Custom API not found.' });
    res.status(200).json(api.logs || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Direct execution handler for dynamically generated routes
export const handleCustomAPIExecution = async (req, res) => {
  const start = Date.now();
  const { version, path } = req.params;
  
  let customApi = null;
  try {
    customApi = await CustomAPI.findOne({ routePath: path, version, status: 'Enabled' });
    if (!customApi) {
      return res.status(404).json({ message: `Custom API Endpoint not found for version ${version} and path /${path}` });
    }

    // 1. Authentication Check
    if (customApi.authRequired) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
      }
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_access_key_12345!');
        req.user = decoded;
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired access token.' });
      }
    }

    // 2. Rate Limiting Check
    const oneMinAgo = new Date(Date.now() - 60000);
    const recentRequests = customApi.logs.filter(l => l.timestamp > oneMinAgo).length;
    if (recentRequests >= customApi.rateLimit) {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }

    // 3. Validation Rules Check
    if (customApi.validationRules && customApi.validationRules.length > 0) {
      for (const rule of customApi.validationRules) {
        const value = req.body[rule.fieldName];
        if (rule.required && (value === undefined || value === null || value === '')) {
          return res.status(400).json({ message: `Validation failed: Required field '${rule.fieldName}' is missing.` });
        }
        if (value !== undefined && value !== null) {
          const typeOfVal = Array.isArray(value) ? 'Array' : typeof value;
          const expectedType = rule.fieldType;
          if (expectedType === 'Number' && typeOfVal !== 'number') {
            return res.status(400).json({ message: `Validation failed: Field '${rule.fieldName}' must be a Number.` });
          }
          if (expectedType === 'Boolean' && typeOfVal !== 'boolean') {
            return res.status(400).json({ message: `Validation failed: Field '${rule.fieldName}' must be a Boolean.` });
          }
          if (expectedType === 'Object' && typeOfVal !== 'object') {
            return res.status(400).json({ message: `Validation failed: Field '${rule.fieldName}' must be an Object.` });
          }
          if (expectedType === 'Array' && typeOfVal !== 'Array') {
            return res.status(400).json({ message: `Validation failed: Field '${rule.fieldName}' must be an Array.` });
          }
        }
      }
    }

    // 4. Execute Linked Workflow
    let workflowOutput = { success: true, message: 'Custom API executed successfully.' };
    if (customApi.workflow) {
      const workflow = await Workflow.findById(customApi.workflow);
      if (!workflow) {
        return res.status(500).json({ message: 'Internal Error: Linked workflow not found.' });
      }
      
      const dagResult = validateWorkflowDAG(workflow.nodes, workflow.edges);
      if (!dagResult.isDag) {
        return res.status(500).json({ message: 'Linked workflow has dependency errors or cycles.', errors: dagResult.errors });
      }

      // Create execution run
      const triggerNode = workflow.nodes.find(n => n.type === 'TriggerNode' || n.type.includes('Trigger') || n.type.includes('Scheduler'));
      const triggerNodeId = triggerNode ? triggerNode.id : 'trigger';
      
      const execution = new Execution({
        workflow: workflow._id,
        status: 'Pending',
        triggerNodeId,
        triggerData: req.body || {},
        executionPath: dagResult.executionPath
      });
      await execution.save();

      // Execute synchronously
      await executeWorkflowEngine(execution._id);

      // Reload execution results
      const completedExec = await Execution.findById(execution._id);
      
      // Pull output of final completed node
      let finalOutput = {};
      if (completedExec.nodeStates) {
        const completedNodes = Array.from(completedExec.nodeStates.keys()).filter(nodeId => completedExec.nodeStates.get(nodeId).status === 'Completed');
        if (completedNodes.length > 0) {
          const lastNodeId = completedNodes[completedNodes.length - 1];
          finalOutput = completedExec.nodeStates.get(lastNodeId).output || {};
        }
      }

      workflowOutput = {
        executionId: completedExec._id,
        status: completedExec.status,
        output: finalOutput,
        errorMessage: completedExec.errorMessage
      };

      if (completedExec.status === 'Failed') {
        throw new Error(completedExec.errorMessage || 'Workflow execution failed');
      }
    }

    // Logging successful call
    const latency = Date.now() - start;
    customApi.logs.push({
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      statusCode: 200,
      latency
    });
    await customApi.save();

    return res.status(200).json(workflowOutput);

  } catch (error) {
    const latency = Date.now() - start;
    if (customApi) {
      customApi.logs.push({
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        statusCode: 500,
        latency,
        error: error.message
      });
      await customApi.save();
    }
    return res.status(500).json({ message: error.message });
  }
};
