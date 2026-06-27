import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Chip
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const WorkflowAgents = () => {
  const { accessToken } = useSelector(state => state.auth);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('OpenAI');
  const [modelName, setModelName] = useState('gpt-4');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [role, setRole] = useState('Worker');
  const [goals, setGoals] = useState('');
  const [tools, setTools] = useState([]);
  const [actions, setActions] = useState('');
  const [memoryType, setMemoryType] = useState('buffer');
  const [memoryWindow, setMemoryWindow] = useState(10);
  const [reasoning, setReasoning] = useState('ReAct');
  const [workers, setWorkers] = useState([]);

  // Available Tools Options
  const availableTools = ['Gmail', 'Google Calendar', 'Google Sheets', 'SMS Send', 'CRM HubSpot', 'OSHA Knowledge Base', 'Slack alerts'];

  // Fetch agents list
  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/ai/agents', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAgents(res.data);
      if (res.data.length > 0 && !selectedAgent) {
        handleSelectAgent(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [accessToken]);

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setName(agent.name);
    setProvider(agent.provider);
    setModelName(agent.modelName || 'gpt-4');
    setSystemPrompt(agent.systemPrompt);
    setRole(agent.role || 'Worker');
    setGoals(agent.goals?.join('\n') || '');
    setTools(agent.tools || []);
    setActions(agent.actions?.join('\n') || '');
    setMemoryType(agent.memory?.type || 'buffer');
    setMemoryWindow(agent.memory?.windowSize || 10);
    setReasoning(agent.reasoning || 'ReAct');
    setWorkers(agent.workers || []);
  };

  const handleCreateNew = () => {
    setSelectedAgent({ _id: 'new' });
    setName('New Operational Agent');
    setProvider('OpenAI');
    setModelName('gpt-4');
    setSystemPrompt('You are an operational agent assigned to assist in staff workflows.');
    setRole('Worker');
    setGoals('Automate janitorial workflows.\nVerify compliance logs.');
    setTools([]);
    setActions('send_email\nupdate_ticket');
    setMemoryType('buffer');
    setMemoryWindow(10);
    setReasoning('ReAct');
    setWorkers([]);
  };

  const handleSave = async () => {
    const goalsArray = goals.split('\n').map(g => g.trim()).filter(Boolean);
    const actionsArray = actions.split('\n').map(a => a.trim()).filter(Boolean);

    const payload = {
      name,
      provider,
      modelName,
      systemPrompt,
      role,
      goals: goalsArray,
      tools,
      actions: actionsArray,
      memory: { type: memoryType, windowSize: memoryWindow },
      reasoning,
      workers: role === 'Supervisor' ? workers : []
    };

    try {
      if (selectedAgent._id === 'new') {
        const res = await axios.post('/api/workflows/agents', payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setSelectedAgent(res.data);
      } else {
        const res = await axios.put(`/api/workflows/agents/${selectedAgent._id}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setSelectedAgent(res.data);
      }
      fetchAgents();
    } catch (err) {
      console.error('Failed to save agent:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#517891' }}>AI Agent Orchestrator</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleCreateNew} sx={{ backgroundColor: '#57B9FF' }}>
          Create Agent Builder
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Left Side: Agents List */}
        <Grid item xs={12} sm={3}>
          <Paper sx={{ border: '1px solid #E5E7EB', minHeight: 'calc(100vh - 200px)' }}>
            <Typography variant="subtitle2" sx={{ p: 1.5, fontWeight: 'bold', color: '#517891', borderBottom: '1px solid #E5E7EB' }}>
              Active Agents Registry
            </Typography>
            <List dense>
              {agents.map((agent) => (
                <ListItem key={agent._id} disablePadding>
                  <ListItemButton
                    selected={selectedAgent && selectedAgent._id === agent._id}
                    onClick={() => handleSelectAgent(agent)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 168, 232, 0.08) !important',
                        borderLeft: '4px solid #57B9FF'
                      }
                    }}
                  >
                    <ListItemText
                      primary={agent.name}
                      secondary={`${agent.role || 'Worker'} | ${agent.provider}`}
                      primaryTypographyProps={{ fontSize: '12px', fontWeight: 'bold', color: '#517891' }}
                      secondaryTypographyProps={{ fontSize: '10px' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Agent Configuration Form */}
        {selectedAgent && (
          <Grid item xs={12} sm={9}>
            <Paper sx={{ p: 2, border: '1px solid #E5E7EB' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891', mb: 2 }}>
                Configure Profile: {name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Agent Name"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Provider</InputLabel>
                    <Select value={provider} onChange={(e) => setProvider(e.target.value)} label="Provider">
                      <MenuItem value="OpenAI">OpenAI</MenuItem>
                      <MenuItem value="Claude">Claude</MenuItem>
                      <MenuItem value="CrewAI">CrewAI</MenuItem>
                      <MenuItem value="LangChain">LangChain</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Model Name"
                    size="small"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Collaboration Role</InputLabel>
                    <Select value={role} onChange={(e) => setRole(e.target.value)} label="Collaboration Role">
                      <MenuItem value="Worker">Worker Agent</MenuItem>
                      <MenuItem value="Supervisor">Supervisor Agent</MenuItem>
                      <MenuItem value="Reviewer">Reviewer Agent</MenuItem>
                      <MenuItem value="Planner">Planner Agent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Reasoning Loop</InputLabel>
                    <Select value={reasoning} onChange={(e) => setReasoning(e.target.value)} label="Reasoning Loop">
                      <MenuItem value="ReAct">ReAct (Reason + Act)</MenuItem>
                      <MenuItem value="Chain-of-Thought">Chain of Thought</MenuItem>
                      <MenuItem value="Plan-and-Solve">Plan and Solve</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Supervisor Agent Worker Selection */}
                {role === 'Supervisor' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Managed Worker Agents</InputLabel>
                      <Select
                        multiple
                        value={workers}
                        onChange={(e) => setWorkers(e.target.value)}
                        input={<OutlinedInput label="Managed Worker Agents" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const match = agents.find(a => a._id === value);
                              return <Chip key={value} label={match ? match.name : value} size="small" />;
                            })}
                          </Box>
                        )}
                      >
                        {agents
                          .filter(a => a._id !== selectedAgent._id && a.role !== 'Supervisor')
                          .map((a) => (
                            <MenuItem key={a._id} value={a._id}>
                              <Checkbox checked={workers.indexOf(a._id) > -1} />
                              <ListItemText primary={a.name} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    label="System Prompt / Guidelines"
                    size="small"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Goals (One per line)"
                    size="small"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Actions (One per line)"
                    size="small"
                    value={actions}
                    onChange={(e) => setActions(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="send_email&#10;create_hubspot_lead"
                  />
                </Grid>

                {/* Memory Settings */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Memory Type</InputLabel>
                    <Select value={memoryType} onChange={(e) => setMemoryType(e.target.value)} label="Memory Type">
                      <MenuItem value="buffer">Buffer Memory</MenuItem>
                      <MenuItem value="summary">Summary Memory</MenuItem>
                      <MenuItem value="window">Windowed Memory</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Memory Window Size"
                    size="small"
                    type="number"
                    value={memoryWindow}
                    onChange={(e) => setMemoryWindow(Number(e.target.value))}
                    fullWidth
                  />
                </Grid>

                {/* Tools Multi-Select */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Integration Tools</InputLabel>
                    <Select
                      multiple
                      value={tools}
                      onChange={(e) => setTools(e.target.value)}
                      input={<OutlinedInput label="Integration Tools" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availableTools.map((t) => (
                        <MenuItem key={t} value={t}>
                          <Checkbox checked={tools.indexOf(t) > -1} />
                          <ListItemText primary={t} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} sx={{ backgroundColor: '#517891' }}>
                  Save Agent Profile
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default WorkflowAgents;
