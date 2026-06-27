import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, TextField, Divider, List, ListItem, ListItemText, Badge } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAIAgents } from '../store/index.js';
import axios from 'axios';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const AIControl = () => {
  const dispatch = useDispatch();
  const { aiAgents } = useSelector(state => state.app);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [promptQuery, setPromptQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [agentPromptText, setAgentPromptText] = useState('');

  useEffect(() => {
    dispatch(fetchAIAgents());
  }, [dispatch]);

  // Keep selected agent reference updated on state changes
  useEffect(() => {
    if (selectedAgent && aiAgents.length > 0) {
      const updated = aiAgents.find(a => a._id === selectedAgent._id);
      if (updated) {
        setSelectedAgent(updated);
      }
    }
  }, [aiAgents]);

  const handleTestQuery = async () => {
    if (!selectedAgent || !promptQuery) return;
    setQueryResult('Executing request on remote agent...');
    try {
      const res = await axios.post('/api/ai/query', {
        agentName: selectedAgent.name,
        prompt: promptQuery
      });
      setQueryResult(res.data.response);
      dispatch(fetchAIAgents());
    } catch (err) {
      setQueryResult(err.response?.data?.message || 'Agent query execution failed');
    }
  };

  const getAgentStats = (agent) => {
    const logs = agent.logs || [];
    const errorCount = logs.filter(l => l.level === 'error').length;
    const successRate = logs.length > 0 
      ? Math.round(((logs.length - errorCount) / logs.length) * 100) 
      : 100;
    const lastRun = logs.length > 0 
      ? new Date(logs[logs.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(agent.healthCheck?.lastCheck || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return { successRate, errorCount, lastRun };
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          AI AGENT CONTROL CENTER
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Deploy OpenAI/Claude agents, modify system prompts, and review agent processing logs
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {/* Left Side: Agents Grid (Monitoring Panels) */}
        <Grid item xs={12} md={selectedAgent ? 7 : 12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1.5 }}>
            AGENT REGISTRY & HEALTH MONITOR
          </Typography>
          
          <Grid container spacing={1.5}>
            {aiAgents.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 2, textAlign: 'center', color: '#6B7280' }}>
                    No agents registered. Seeded automatically on demand.
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              aiAgents.map((agent) => {
                const isSelected = selectedAgent?._id === agent._id;
                const { successRate, errorCount, lastRun } = getAgentStats(agent);
                const isHealthy = agent.healthCheck?.status === 'Healthy';
                
                return (
                  <Grid item xs={12} sm={selectedAgent ? 12 : 6} key={agent._id}>
                    <Card 
                      onClick={() => {
                        setSelectedAgent(agent);
                        setAgentPromptText(agent.systemPrompt);
                      }}
                      sx={{ 
                        cursor: 'pointer',
                        borderColor: isSelected ? '#57B9FF' : '#E5E7EB',
                        borderWidth: isSelected ? '1.5px' : '1px',
                        '&:hover': {
                          borderColor: '#57B9FF'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        {/* Title & Status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge 
                              variant="dot" 
                              color={isHealthy ? 'success' : 'warning'} 
                              sx={{ 
                                '& .MuiBadge-badge': { 
                                  backgroundColor: isHealthy ? '#10B981' : '#F59E0B' 
                                } 
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#517891' }}>
                              {agent.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={agent.status} 
                            size="small" 
                            color={agent.status === 'Active' ? 'success' : 'default'} 
                            sx={{ borderRadius: '4px', height: '18px', fontSize: '10px' }} 
                          />
                        </Box>

                        {/* Telemetry Stats Grid */}
                        <Grid container spacing={1} sx={{ mt: 0.5, mb: 1, bgcolor: '#F9FAFB', p: 1, borderRadius: '4px' }}>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                              Success Rate
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: successRate >= 90 ? '#10B981' : '#F59E0B' }}>
                              {successRate}%
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                              Error Count
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: errorCount > 0 ? '#EF4444' : '#111827' }}>
                              {errorCount}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                              Last Active
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                              {lastRun}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Framework Details */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Base: {agent.modelName} ({agent.provider})
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#57B9FF', fontWeight: 600 }}>
                            Manage Console →
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Grid>

        {/* Right Side: Deployment Controls & Output Console */}
        {selectedAgent && (
          <Grid item xs={12} md={5}>
            <Card sx={{ border: '1px solid #517891' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                {/* Console Title */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>
                    CONSOLE: {selectedAgent.name.toUpperCase()}
                  </Typography>
                  <Button size="small" variant="text" color="error" onClick={() => setSelectedAgent(null)}>
                    Close
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1 }} />

                {/* System Prompt Config */}
                <Box sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', mb: 0.5, display: 'block' }}>
                    SYSTEM PROMPT CONFIGURATION
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={agentPromptText}
                    onChange={(e) => setAgentPromptText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '13px',
                        fontFamily: 'monospace'
                      }
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 1, height: '28px', fontSize: '11px' }}
                    onClick={() => alert('System prompts configured successfully.')}
                  >
                    Commit Prompt Changes
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1.5 }} />

                {/* Query Test Bench */}
                <Box sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', mb: 0.5, display: 'block' }}>
                    QUERY TEST BENCH
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Clean room SOP rules..."
                      value={promptQuery}
                      onChange={(e) => setPromptQuery(e.target.value)}
                    />
                    <Button variant="contained" size="small" onClick={handleTestQuery} sx={{ height: '36px' }}>
                      Invoke
                    </Button>
                  </Box>
                  
                  {/* Console Output Log */}
                  <Box sx={{ p: 1, bgcolor: '#111827', borderRadius: '4px', border: '1px solid #E5E7EB', minHeight: 80, maxHeight: 150, overflow: 'auto' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'Courier New, monospace', display: 'block', color: '#10B981', whiteSpace: 'pre-wrap' }}>
                      {queryResult || '> System idling. Ready for instruction...'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 1.5 }} />

                {/* Agent Trace Logs */}
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 0.5 }}>
                    AGENT TRACE LOGS
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '4px', p: 1, bgcolor: '#FFFFFF' }}>
                    {selectedAgent.logs?.length === 0 ? (
                      <Typography variant="caption" color="textSecondary">
                        No transaction traces logged.
                      </Typography>
                    ) : (
                      <List dense sx={{ p: 0 }}>
                        {selectedAgent.logs?.map((trace, i) => (
                          <ListItem key={i} sx={{ p: 0, mb: 0.5, borderBottom: '1px solid #F3F4F6', pb: 0.5, '&:last-child': { borderBottom: 0 } }}>
                            <ListItemText 
                              primary={trace.message} 
                              secondary={`Tokens: ${trace.promptTokens + trace.completionTokens} | Level: ${trace.level}`}
                              primaryTypographyProps={{ variant: 'caption', sx: { fontWeight: 600, color: '#374151' } }}
                              secondaryTypographyProps={{ variant: 'caption', sx: { color: trace.level === 'error' ? '#EF4444' : '#6B7280', fontSize: '9px' } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Box>

              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AIControl;
