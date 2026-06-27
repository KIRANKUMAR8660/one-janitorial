import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './workflows/smartNode.css';

import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';

import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { BaseNodeComponent, nodeRegistry } from './workflows/NodeFactory.jsx';
import SmartTextNode from './workflows/SmartTextNode.jsx';

// Register custom node types in React Flow
const nodeTypes = {
  BaseNode: BaseNodeComponent,
  SmartTextNode: SmartTextNode
};

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useSelector(state => state.auth);

  // Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('New Automated Workflow');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [isActive, setIsActive] = useState(false);

  // UI Panels
  const [selectedNode, setSelectedNode] = useState(null);
  const [bottomTab, setBottomTab] = useState(0); // 0 = Logs, 1 = History
  const [logs, setLogs] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Validation Dialog
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Undo/Redo Stacks
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Socket connection
  const socketRef = useRef(null);
  const currentExecutionId = useRef(null);

  // Auto-save State
  const [saveStatus, setSaveStatus] = useState('Saved'); // Saved, Changes, Saving
  const autoSaveTimer = useRef(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Workflow Details
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await axios.get(`/api/workflows`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const flow = res.data.find(w => w._id === id);
        if (flow) {
          setWorkflowName(flow.name);
          setWorkflowDesc(flow.description || '');
          setIsActive(flow.isActive);
          
          // Reconnect handlers on loads
          const loadedNodes = (flow.nodes || []).map(node => {
            if (node.type === 'SmartTextNode') {
              return {
                ...node,
                data: {
                  ...node.data,
                  onChange: handleSmartTextChange,
                  onVariablesChange: handleVariablesChange
                }
              };
            }
            return node;
          });
          
          setNodes(loadedNodes);
          setEdges(flow.edges || []);
          undoStack.current = [];
          redoStack.current = [];
        }
      } catch (err) {
        console.error('Failed to load workflow:', err);
      }
    };
    if (id) fetchWorkflow();
  }, [id, accessToken]);

  // Track History State
  const recordHistory = useCallback((newNodes, newEdges) => {
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    redoStack.current = [];
    setSaveStatus('Changes');
    
    // Auto Save trigger (after 3 seconds of idle time)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  }, [nodes, edges]);

  // Save workflow API
  const handleSave = async (isAuto = false) => {
    if (!isAuto) setSaveStatus('Saving');
    try {
      // Strip off visual dynamic function hooks prior to database write
      const nodesToSave = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          name: n.data.name,
          type: n.data.type,
          config: n.data.config,
          status: n.data.status,
          error: n.data.error,
          value: n.data.value
        }
      }));

      await axios.put(`/api/workflows/${id}`, {
        name: workflowName,
        description: workflowDesc,
        nodes: nodesToSave,
        edges,
        isActive
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSaveStatus('Saved');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('Changes');
    }
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    const previous = undoStack.current.pop();
    redoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    setNodes(previous.nodes);
    setEdges(previous.edges);
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    setNodes(next.nodes);
    setEdges(next.edges);
  };

  // Drag and Drop implementation
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow-type');
    const nodeTypeClass = event.dataTransfer.getData('application/reactflow-class');
    
    if (!type) return;
    
    const reactFlowBounds = event.target.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };

    const newNodeId = `node_${Date.now()}`;
    let newNode = null;

    if (nodeTypeClass === 'SmartTextNode') {
      newNode = {
        id: newNodeId,
        type: 'SmartTextNode',
        position,
        data: {
          value: '',
          onChange: handleSmartTextChange,
          onVariablesChange: handleVariablesChange,
          status: 'Pending'
        }
      };
    } else {
      newNode = {
        id: newNodeId,
        type: 'BaseNode',
        position,
        data: {
          type,
          name: nodeRegistry[type]?.name || 'New Node',
          config: {},
          status: 'Pending'
        }
      };
    }

    recordHistory(nodes, edges);
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, edges, recordHistory]);

  // Connect Nodes
  const onConnect = useCallback((params) => {
    recordHistory(nodes, edges);
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#57B9FF' }
    }, eds));
  }, [nodes, edges, recordHistory]);

  // Smart Text Change handlers
  const handleSmartTextChange = (nodeId, newVal) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, value: newVal }
        };
      }
      return node;
    }));
  };

  const handleVariablesChange = (nodeId, vars) => {
    // Dynamic handle creation is automatically calculated in SmartTextNode.jsx component rendering
  };

  // Config fields update handler
  const handleConfigChange = (field, value) => {
    if (!selectedNode) return;
    recordHistory(nodes, edges);
    setNodes(nds => nds.map(node => {
      if (node.id === selectedNode.id) {
        const updatedConfig = { ...node.data.config, [field]: value };
        return {
          ...node,
          data: { ...node.data, config: updatedConfig }
        };
      }
      return node;
    }));
    // Sync UI selection state
    setSelectedNode(prev => ({
      ...prev,
      data: { ...prev.data, config: { ...prev.data.config, [field]: value } }
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedNode) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/workflows/upload', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { fileName, fileSize, fileType, storageLocation, sampleContent } = res.data;
      
      recordHistory(nodes, edges);
      setNodes(nds => nds.map(node => {
        if (node.id === selectedNode.id) {
          const updatedConfig = {
            ...node.data.config,
            fileName,
            fileSize,
            fileType,
            storageLocation,
            sampleContent
          };
          return {
            ...node,
            data: { ...node.data, config: updatedConfig }
          };
        }
        return node;
      }));

      setSelectedNode(prev => ({
        ...prev,
        data: {
          ...prev.data,
          config: {
            ...prev.data.config,
            fileName,
            fileSize,
            fileType,
            storageLocation,
            sampleContent
          }
        }
      }));

    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Duplicate Selected Node
  const duplicateNode = () => {
    if (!selectedNode) return;
    recordHistory(nodes, edges);
    const newNodeId = `node_${Date.now()}`;
    const copy = {
      ...selectedNode,
      id: newNodeId,
      position: { x: selectedNode.position.x + 30, y: selectedNode.position.y + 30 },
      selected: false
    };
    setNodes(nds => nds.concat(copy));
  };

  // Delete Selected Node
  const deleteNode = () => {
    if (!selectedNode) return;
    recordHistory(nodes, edges);
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  // Run DAG validation
  const validateDAG = async () => {
    setIsValidating(true);
    try {
      const res = await axios.post(`/api/workflows/validate`, {
        nodes,
        edges
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setValidationData(res.data);
      setValidationOpen(true);
    } catch (err) {
      console.error('Validation API failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Run/Execute Workflow
  const executeWorkflow = async () => {
    setIsExecuting(true);
    try {
      const res = await axios.post(`/api/workflows/execute`, {
        workflowId: id,
        triggerData: { clientEmail: 'test-client@onejanitorial.com', amount: 12000, firstName: 'Derek' }
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const execId = res.data.executionId;
      currentExecutionId.current = execId;
      setValidationOpen(false);
      setBottomTab(0);
      setLogs([{ level: 'info', message: 'Triggered execution queue.' }]);

      // Establish websocket connection for live progress monitoring
      if (socketRef.current) socketRef.current.disconnect();
      const socket = io();
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_execution', execId);
      });

      socket.on('new_workflow_log', (logData) => {
        setLogs(prev => [...prev, logData]);
      });

      socket.on('node_status_change', (statusData) => {
        setNodes(nds => nds.map(node => {
          if (node.id === statusData.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: statusData.status,
                error: statusData.error,
                output: statusData.output
              }
            };
          }
          return node;
        }));
      });

      socket.on('execution_status_change', (execData) => {
        if (execData.status === 'Completed' || execData.status === 'Failed') {
          setIsExecuting(false);
          fetchHistory();
        }
      });

    } catch (err) {
      console.error('Execution request failed:', err);
      setIsExecuting(false);
    }
  };

  // Fetch Execution History
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`/api/workflows/executions?workflowId=${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setExecutions(res.data);
    } catch (err) {
      console.error('History load failed:', err);
    }
  }, [id, accessToken]);

  useEffect(() => {
    if (id) fetchHistory();
  }, [id, fetchHistory]);

  const loadHistoricalRunLogs = async (execId) => {
    try {
      const res = await axios.get(`/api/workflows/logs?executionId=${execId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setLogs(res.data);
      setBottomTab(0);
    } catch (err) {
      console.error('Logs fetch failed:', err);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Visual Sub-Navbar Panel */}
      <Paper sx={{ p: 1, mb: 1, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            value={workflowName}
            onChange={(e) => { setWorkflowName(e.target.value); setSaveStatus('Changes'); }}
            sx={{ fontWeight: 'bold', width: 260 }}
            placeholder="Workflow Name"
          />
          <Typography variant="caption" sx={{ color: saveStatus === 'Saved' ? 'green' : 'orange', fontWeight: 'bold' }}>
            ● {saveStatus === 'Saving' ? 'Saving...' : saveStatus}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleUndo} title="Undo">
            <UndoIcon />
          </IconButton>
          <IconButton size="small" onClick={handleRedo} title="Redo">
            <RedoIcon />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            sx={{ color: '#517891', borderColor: '#517891' }}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<PlayArrowIcon />}
            onClick={validateDAG}
            sx={{ backgroundColor: '#57B9FF' }}
          >
            Execute
          </Button>
        </Box>
      </Paper>

      {/* Main Layout Area */}
      <Grid container spacing={1} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Panel: Nodes library & Templates */}
        <Grid item xs={2.5} sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <Paper sx={{ p: 1, height: '100%', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Nodes Library</Typography>
            <TextField
              size="small"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Divider />
            <Box sx={{ flexGrow: 1, mt: 1 }}>
              {/* Category Grouping */}
              {[
                { name: 'Triggers', tag: 'trigger' },
                { name: 'Analytics', tag: 'analytics' },
                { name: 'CRM', tag: 'crm' },
                { name: 'AI Agents', tag: 'ai' },
                { name: 'HR', tag: 'hr' },
                { name: 'Reporting', tag: 'reporting' },
                { name: 'Integrations', tag: 'integration' },
                { name: 'Files & Documents', tag: 'files' },
                { name: 'Databases', tag: 'database' },
                { name: 'Utilities', tag: 'utility' },
                { name: 'Quality Control', tag: 'quality' },
                { name: 'Sync Status', tag: 'sync' },
                { name: 'AI Coaching', tag: 'coaching' },
                { name: 'Process Mining', tag: 'process_mining' },
                { name: 'Marketplace', tag: 'marketplace' },
                { name: 'Prompt Registry', tag: 'prompts' },
                { name: 'Cost Center', tag: 'cost_tracking' },
                { name: 'n8n Migration', tag: 'n8n_migration' },
                { name: 'Supabase Admin', tag: 'supabase' },
                { name: 'Operations Center', tag: 'operations' },
                { name: 'Chatbot Feedback', tag: 'feedback' },
                { name: 'Executive AI', tag: 'executive_ai' },
                { name: 'Testing Lab', tag: 'testing' },
                { name: 'Audit Ledger', tag: 'audit' },
                { name: 'Self-Healing', tag: 'recovery' }
              ].map((category) => {
                const filteredTypes = Object.entries(nodeRegistry).filter(([type, spec]) => {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch = spec.name.toLowerCase().includes(query) || 
                                      spec.description.toLowerCase().includes(query) || 
                                      type.toLowerCase().includes(query);
                  return matchesSearch && spec.headerClass === category.tag;
                });

                if (filteredTypes.length === 0) return null;

                return (
                  <Box key={category.name} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#57B9FF', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      {category.name} Nodes
                    </Typography>
                    {filteredTypes.map(([type, spec]) => (
                      <div
                        key={type}
                        className="node-library-item"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/reactflow-type', type);
                          e.dataTransfer.setData('application/reactflow-class', 'BaseNode');
                        }}
                      >
                        {spec.name}
                      </div>
                    ))}
                  </Box>
                );
              })}

              {/* Smart Text Template Node */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#57B9FF', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Templates
                </Typography>
                <div
                  className="node-library-item"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow-type', 'SmartTextNode');
                    e.dataTransfer.setData('application/reactflow-class', 'SmartTextNode');
                  }}
                >
                  Smart Text Template Node
                </div>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Center: React Flow Canvas */}
        <Grid item xs={selectedNode ? 6.5 : 9.5} sx={{ height: '100%', position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
          <Paper sx={{ height: '100%', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(e, node) => setSelectedNode(node)}
                onPaneClick={() => setSelectedNode(null)}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background color="#ccc" gap={16} />
              </ReactFlow>
            </Box>
            
            {/* Bottom Console Panel */}
            <Box sx={{ height: 180, borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor: '#f9fafb' }}>
                <Tabs value={bottomTab} onChange={(e, val) => setBottomTab(val)} variant="dense" sx={{ minHeight: '32px' }}>
                  <Tab label="Execution Logs" sx={{ minHeight: '32px', py: 0.5, fontSize: '11px' }} />
                  <Tab label="Run History" sx={{ minHeight: '32px', py: 0.5, fontSize: '11px' }} />
                </Tabs>
              </Box>
              <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto', backgroundColor: '#0F172A', color: '#38BDF8', fontFamily: 'monospace', fontSize: '11px' }}>
                {bottomTab === 0 ? (
                  logs.length === 0 ? (
                    <div style={{ color: '#64748B' }}>No execution logs available. Click Execute to run.</div>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} style={{ color: log.level === 'error' ? '#EF4444' : log.level === 'warning' ? '#FBBF24' : '#38BDF8' }}>
                        [{new Date(log.timestamp || Date.now()).toLocaleTimeString()}] [{log.nodeType || 'System'}] {log.message}
                      </div>
                    ))
                  )
                ) : (
                  <List dense sx={{ p: 0 }}>
                    {executions.map((exec) => (
                      <ListItem
                        key={exec._id}
                        button
                        onClick={() => loadHistoricalRunLogs(exec._id)}
                        sx={{ py: 0.25, borderBottom: '1px solid #1E293B', '&:hover': { background: '#1E293B' } }}
                      >
                        <ListItemText
                          primary={`Run #${exec._id.substring(18)} - Status: ${exec.status}`}
                          secondary={`Started: ${new Date(exec.startedAt).toLocaleString()} | Duration: ${exec.durationMs || 0}ms`}
                          primaryTypographyProps={{ fontSize: '11px', color: exec.status === 'Completed' ? '#10B981' : exec.status === 'Failed' ? '#EF4444' : '#FBBF24' }}
                          secondaryTypographyProps={{ fontSize: '9px', color: '#94A3B8' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Properties Inspector */}
        {selectedNode && (
          <Grid item xs={3} sx={{ height: '100%', overflowY: 'auto' }}>
            <Paper sx={{ p: 1, height: '100%', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891' }}>Properties Inspector</Typography>
                <IconButton size="small" onClick={() => setSelectedNode(null)}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label="Node Title"
                  size="small"
                  value={selectedNode.data.name || ''}
                  onChange={(e) => {
                    recordHistory(nodes, edges);
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, name: e.target.value } } : n));
                    setSelectedNode(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }));
                  }}
                  fullWidth
                />
                
                {/* File Upload Drop Area for File Nodes */}
                {nodeRegistry[selectedNode.data.type]?.headerClass === 'files' && (
                  <Box sx={{ mt: 1, border: '1px dashed #57B9FF', p: 1, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5, color: '#517891' }}>
                      Drag & Drop File Ingestion
                    </Typography>
                    {isUploading ? (
                      <Box sx={{ py: 1 }}>
                        <CircularProgress size={20} color="secondary" />
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Uploading file...</Typography>
                      </Box>
                    ) : (
                      <Box>
                        <input
                          accept="*/*"
                          style={{ display: 'none' }}
                          id="workflow-file-picker"
                          type="file"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="workflow-file-picker">
                          <Button size="small" variant="outlined" component="span" sx={{ fontSize: '10px', height: '24px', px: 1 }}>
                            Select File
                          </Button>
                        </label>
                      </Box>
                    )}

                    {/* Show extracted file details/metadata */}
                    {selectedNode.data.config?.fileName && (
                      <Box sx={{ mt: 1, textAlign: 'left', background: '#ffffff', p: 0.5, border: '1px solid #e5e7eb', borderRadius: '2px' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: '#517891', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          File: {selectedNode.data.config.fileName}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '8px', color: '#4B5563' }}>
                          Size: {(selectedNode.data.config.fileSize / 1024).toFixed(1)} KB | Type: {selectedNode.data.config.fileType}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '8px', color: '#9CA3AF', wordBreak: 'break-all' }}>
                          Path: {selectedNode.data.config.storageLocation}
                        </Typography>

                        {selectedNode.data.config.sampleContent && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', fontWeight: 'bold', color: '#4B5563' }}>Preview Extract:</Typography>
                            <Box sx={{ maxHeight: '60px', overflowY: 'auto', background: '#f3f4f6', p: 0.25, fontSize: '8px', fontFamily: 'monospace', color: '#374151' }}>
                              {selectedNode.data.config.sampleContent.substring(0, 300)}...
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Specific configs based on registry schema */}
                {nodeRegistry[selectedNode.data.type]?.configFields.map((field) => {
                  const currentValue = selectedNode.data.config?.[field.name] || '';
                  
                  if (field.type === 'select') {
                    return (
                      <FormControl key={field.name} fullWidth size="small">
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          value={currentValue}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          label={field.label}
                        >
                          {field.options.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }
                  
                  if (field.type === 'textarea') {
                    return (
                      <Box key={field.name}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>{field.label}</Typography>
                        <Editor
                          height="120px"
                          defaultLanguage="javascript"
                          theme="vs-dark"
                          value={currentValue}
                          onChange={(val) => handleConfigChange(field.name, val)}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 10,
                            lineNumbers: 'off',
                            folding: false
                          }}
                        />
                      </Box>
                    );
                  }
                  
                  return (
                    <TextField
                      key={field.name}
                      label={field.label}
                      size="small"
                      value={currentValue}
                      onChange={(e) => handleConfigChange(field.name, e.target.value)}
                      fullWidth
                    />
                  );
                })}
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={duplicateNode}
                  fullWidth
                >
                  Copy
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={deleteNode}
                  fullWidth
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* DAG Validation Modal */}
      <Dialog open={validationOpen} onClose={() => setValidationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#517891', color: '#fff', px: 2, py: 1 }}>
          <SettingsIcon fontSize="small" />
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>DAG Validation Summary</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {validationData && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                    <Typography variant="caption" color="textSecondary">Nodes</Typography>
                    <Typography variant="h6">{validationData.nodes}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                    <Typography variant="caption" color="textSecondary">Edges</Typography>
                    <Typography variant="h6">{validationData.edges}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                    <Typography variant="caption" color="textSecondary">DAG Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: validationData.isDag ? 'green' : 'red' }}>
                      {validationData.isDag ? <CheckCircleOutlineIcon sx={{ mr: 0.5 }} /> : <WarningAmberIcon sx={{ mr: 0.5 }} />}
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{validationData.isDag ? 'VALID' : 'INVALID'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
                    <Typography variant="caption" color="textSecondary">Runtime</Typography>
                    <Typography variant="h6">~{validationData.estimatedRuntimeSeconds}s</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {validationData.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Fatal DAG errors found:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {validationData.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </Alert>
              )}

              {validationData.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Warnings:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {validationData.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                  </ul>
                </Alert>
              )}

              {validationData.isDag && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Calculated Execution Path:</Typography>
                  <Box sx={{ background: '#F1F5F9', p: 1, borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    {validationData.executionPath.join(' ➔ ')}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setValidationOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={executeWorkflow}
            variant="contained"
            color="secondary"
            disabled={!validationData?.isDag || isExecuting}
            startIcon={isExecuting ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            sx={{ backgroundColor: '#57B9FF' }}
          >
            Confirm Run
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowBuilder;
