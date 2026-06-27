import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Tabs, Tab, Grid, Card, CardContent, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, Table, 
  TableBody, TableCell, TableHead, TableRow, Paper, Alert, Divider
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdvancedConsole = () => {
  const { accessToken } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState(0);

  // Tab State Data
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [coachingReports, setCoachingReports] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [marketplaceAgents, setMarketplaceAgents] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [costs, setCosts] = useState([]);
  const [supabaseConsole, setSupabaseConsole] = useState(null);
  const [chatbotFeedback, setChatbotFeedback] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [operationsStats, setOperationsStats] = useState(null);

  // Form Inputs
  const [selectedAgentForQA, setSelectedAgentForQA] = useState('');
  const [qaReason, setQaReason] = useState('');
  const [coachingDept, setCoachingDept] = useState('Sales');
  const [coachingPeriod, setCoachingPeriod] = useState('Daily');
  const [coachingEmployeeId, setCoachingEmployeeId] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [promptName, setPromptName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [promptProvider, setPromptProvider] = useState('GPT');
  const [promptTestInput, setPromptTestInput] = useState('');
  const [promptTestOutput, setPromptTestOutput] = useState('');
  const [n8nJson, setN8nJson] = useState('');
  const [n8nWorkflowName, setN8nWorkflowName] = useState('');
  const [n8nReport, setN8nReport] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM public.contacts_sync LIMIT 10;');
  const [sqlResult, setSqlResult] = useState('');
  const [chatbotQuestion, setChatbotQuestion] = useState('');
  const [chatbotAnswer, setChatbotAnswer] = useState('');
  const [chatbotRating, setChatbotRating] = useState('Thumbs Down');
  const [chatbotSopTopic, setChatbotSopTopic] = useState('');
  const [chatbotEscalate, setChatbotEscalate] = useState(false);
  const [chatbotFeedbackResult, setChatbotFeedbackResult] = useState('');
  const [execQueryPrompt, setExecQueryPrompt] = useState('');
  const [execQueryReply, setExecQueryReply] = useState('');
  const [execQueryVisual, setExecQueryVisual] = useState(null);
  const [testingType, setTestingType] = useState('Simulation');
  const [testingParams, setTestingParams] = useState('{}');
  const [testingResult, setTestingResult] = useState(null);
  const [auditSearch, setAuditSearch] = useState('');

  // Fetch functions
  const fetchQuality = async () => {
    try {
      const res = await axios.get('/api/advanced/quality/metrics');
      setQualityMetrics(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchSync = async () => {
    try {
      const res = await axios.get('/api/advanced/sync/status');
      setSyncStatus(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCoaching = async () => {
    try {
      const res = await axios.get('/api/advanced/coaching/reports');
      setCoachingReports(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchProcesses = async () => {
    try {
      const res = await axios.get('/api/advanced/process/discovery');
      setProcesses(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMarketplace = async () => {
    try {
      const res = await axios.get('/api/advanced/marketplace/agents');
      setMarketplaceAgents(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchPrompts = async () => {
    try {
      const res = await axios.get('/api/advanced/prompts');
      setPrompts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCosts = async () => {
    try {
      const res = await axios.get('/api/advanced/costs');
      setCosts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchSupabase = async () => {
    try {
      const res = await axios.get('/api/advanced/supabase/console');
      setSupabaseConsole(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get('/api/advanced/chatbot/feedback');
      setChatbotFeedback(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchAudits = async () => {
    try {
      const res = await axios.get('/api/advanced/audit/logs');
      setAuditLogs(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchRecovery = async () => {
    try {
      const res = await axios.get('/api/advanced/self-healing/status');
      setRecoveryLogs(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchOperations = async () => {
    try {
      const res = await axios.get('/api/advanced/operations/monitoring');
      setOperationsStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployeesList(res.data);
    } catch (e) { console.error(e); }
  };

  // Run initial fetch based on active tab selection
  useEffect(() => {
    if (activeTab === 0) fetchQuality();
    if (activeTab === 1) fetchSync();
    if (activeTab === 2) { fetchCoaching(); fetchEmployees(); }
    if (activeTab === 3) fetchProcesses();
    if (activeTab === 4) fetchMarketplace();
    if (activeTab === 5) fetchPrompts();
    if (activeTab === 6) fetchCosts();
    if (activeTab === 7) fetchPrompts();
    if (activeTab === 8) fetchSupabase();
    if (activeTab === 9) fetchOperations();
    if (activeTab === 10) fetchFeedback();
    if (activeTab === 11) fetchQuality();
    if (activeTab === 12) fetchMarketplace();
    if (activeTab === 13) fetchAudits();
    if (activeTab === 14) fetchRecovery();
  }, [activeTab]);

  // QA Action Handlers
  const handleQAOverride = async (evaluationId, logId, status) => {
    if (!qaReason) return alert('Please specify the override reason');
    try {
      await axios.post('/api/advanced/quality/override', { evaluationId, logId, status, reason: qaReason });
      setQaReason('');
      fetchQuality();
    } catch (e) { alert('Action failed'); }
  };

  // Sync Action Handlers
  const handleForceSync = async () => {
    try {
      await axios.post('/api/advanced/sync/trigger');
      fetchSync();
    } catch (e) { alert('Sync trigger failed'); }
  };

  const handleSyncRepair = async (action) => {
    try {
      await axios.post('/api/advanced/sync/repair', { action });
      fetchSync();
    } catch (e) { alert('Repair action failed'); }
  };

  // Coaching Action Handlers
  const handleCoachingGenerate = async () => {
    try {
      await axios.post('/api/advanced/coaching/generate', { 
        department: coachingDept, 
        reportType: coachingPeriod, 
        employeeId: coachingEmployeeId 
      });
      fetchCoaching();
    } catch (e) { alert('Coaching generation failed'); }
  };

  // Process Discovery Action
  const handleProcessMine = async () => {
    try {
      await axios.post('/api/advanced/process/mine');
      fetchProcesses();
    } catch (e) { alert('Mining run failed'); }
  };

  // Marketplace Action Handlers
  const handleMarketplaceAction = async (agentId, action) => {
    try {
      await axios.post('/api/advanced/marketplace/action', { agentId, action });
      fetchMarketplace();
    } catch (e) { alert('Marketplace action failed'); }
  };

  // Prompt Registry Actions
  const handleSavePrompt = async (id = null) => {
    try {
      await axios.post('/api/advanced/prompts/save', { id, name: promptName, content: promptContent, provider: promptProvider });
      setPromptName('');
      setPromptContent('');
      fetchPrompts();
    } catch (e) { alert('Failed to save prompt'); }
  };

  const handleApprovePrompt = async (id) => {
    try {
      await axios.post('/api/advanced/prompts/approve', { id });
      fetchPrompts();
    } catch (e) { alert('Failed to approve prompt'); }
  };

  const handleTestPrompt = async () => {
    try {
      const res = await axios.post('/api/advanced/prompts/test', { promptContent, testInput: promptTestInput, provider: promptProvider });
      setPromptTestOutput(res.data.output);
    } catch (e) { alert('Playground run failed'); }
  };

  // n8n Ingest Handlers
  const handleN8NMigrate = async () => {
    try {
      const res = await axios.post('/api/advanced/n8n/migrate', { workflowName: n8nWorkflowName, jsonContent: n8nJson });
      setN8nReport(res.data);
      setN8nJson('');
      setN8nWorkflowName('');
    } catch (e) { alert('n8n migration failed'); }
  };

  // SQL Query Explorer Handlers
  const handleSQLQuery = () => {
    if (!sqlQuery) return;
    // Simulate database lookup response
    setSqlResult(JSON.stringify([
      { id: 1, email: 'client-reconciled@example.com', sync_date: '2026-06-23T15:20:00Z', postgres_matched: true, mongo_matched: true },
      { id: 2, email: 'sales-deal-matched@corporate.com', sync_date: '2026-06-23T15:21:00Z', postgres_matched: true, mongo_matched: true }
    ], null, 2));
  };

  // Chatbot Feedback Handlers
  const handleChatbotFeedbackSubmit = async () => {
    try {
      const res = await axios.post('/api/advanced/chatbot/feedback/rate', {
        question: chatbotQuestion,
        answer: chatbotAnswer,
        rating: chatbotRating,
        sopTopic: chatbotSopTopic,
        escalate: chatbotEscalate
      });
      setChatbotFeedbackResult(`Logged feedback ID: ${res.data._id}`);
      setChatbotQuestion('');
      setChatbotAnswer('');
      setChatbotSopTopic('');
      setChatbotEscalate(false);
      fetchFeedback();
    } catch (e) { alert('Feedback log failed'); }
  };

  // Executive AI Query Handlers
  const handleExecutiveQuerySubmit = async () => {
    try {
      const res = await axios.post('/api/advanced/executive/query', { prompt: execQueryPrompt });
      setExecQueryReply(res.data.reply);
      setExecQueryVisual(res.data.visualData);
    } catch (e) { alert('Executive query failed'); }
  };

  // Agent Lab Simulator Handlers
  const handleTestingLabSubmit = async () => {
    try {
      const res = await axios.post('/api/advanced/testing/run', { testType: testingType, parameters: JSON.parse(testingParams || '{}') });
      setTestingResult(res.data);
    } catch (e) { alert('Testing run failed. Verify parameters JSON format.'); }
  };

  // Self-Healing Action Handlers
  const handleHealingAction = async (recoveryId, action) => {
    try {
      await axios.post('/api/advanced/self-healing/action', { recoveryId, action });
      fetchRecovery();
    } catch (e) { alert('Recovery Action failed'); }
  };

  // Tab navigation config matching primary/secondary color guidelines
  const tabsConfig = [
    { label: 'Agent QA' },
    { label: 'HubSpot Sync' },
    { label: 'AI Coaching' },
    { label: 'Process Discovery' },
    { label: 'Agent Marketplace' },
    { label: 'Prompts Registry' },
    { label: 'Cost Management' },
    { label: 'n8n Migration' },
    { label: 'Supabase Admin' },
    { label: 'Operations Command' },
    { label: 'Chatbot Feedback' },
    { label: 'Executive AI' },
    { label: 'Testing Lab' },
    { label: 'Audit Ledger' },
    { label: 'Self-Healing' }
  ];

  return (
    <Box sx={{ p: '2px', backgroundColor: '#FFFFFF' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#517891', mb: 2 }}>
        ADVANCED OPERATIONAL CONTROL CONSOLE
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: '#E5E7EB', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#4B5563',
              '&.Mui-selected': {
                color: '#57B9FF',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#57B9FF'
            }
          }}
        >
          {tabsConfig.map((t, idx) => (
            <Tab key={idx} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {/* =========================================================
         TAB 0: AGENT QA EVALUATION
         ========================================================= */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Agent Accuracy & Hallucination Review</Typography>
          <Grid container spacing={2}>
            {qualityMetrics.map((qm) => (
              <Grid item xs={12} md={6} key={qm._id}>
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>{qm.agentName}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 4 }}>
                      <Box><Typography variant="caption">Success Rate</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: 'green' }}>{qm.successRate}%</Typography></Box>
                      <Box><Typography variant="caption">Failure Rate</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: 'red' }}>{qm.failureRate}%</Typography></Box>
                      <Box><Typography variant="caption">Avg Confidence</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{(qm.averageConfidence * 100).toFixed(0)}%</Typography></Box>
                      <Box><Typography variant="caption">Avg Runtime</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{qm.averageRuntime}ms</Typography></Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Decisions & Overrides Pending Review:</Typography>
                      {qm.decisionLogs.map((log) => (
                        <Box key={log._id} sx={{ mt: 1, p: 1, backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                          <Typography variant="caption" display="block"><strong>Input:</strong> {log.input}</Typography>
                          <Typography variant="caption" display="block"><strong>Output:</strong> {log.output}</Typography>
                          <Typography variant="caption" display="block"><strong>Confidence:</strong> {log.confidence}% | <strong>Status:</strong> {log.overrideStatus}</Typography>
                          {log.overrideStatus === 'Auto-Approved' && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <TextField 
                                size="small" 
                                placeholder="Override Reason" 
                                value={qaReason} 
                                onChange={(e) => setQaReason(e.target.value)} 
                                sx={{ flexGrow: 1, input: { fontSize: '11px', py: 0.5 } }} 
                              />
                              <Button size="small" variant="contained" color="primary" onClick={() => handleQAOverride(qm._id, log._id, 'Approved')} sx={{ fontSize: '10px', height: '26px' }}>Approve</Button>
                              <Button size="small" variant="contained" color="error" onClick={() => handleQAOverride(qm._id, log._id, 'Rejected')} sx={{ fontSize: '10px', height: '26px' }}>Reject</Button>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 1: HUBSPOT SYNC
         ========================================================= */}
      {activeTab === 1 && syncStatus && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>HubSpot ↔ Supabase Sync Management</Typography>
          <Alert severity={syncStatus.syncHealthScore >= 95 ? 'success' : 'warning'} sx={{ borderRadius: 0, mb: 2 }}>
            Sync Health Status: <strong>{syncStatus.syncHealthScore}%</strong> | Last Synced: {new Date(syncStatus.lastSync).toLocaleTimeString()}
          </Alert>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[['Contacts', syncStatus.contactsCount], ['Companies', syncStatus.companiesCount], ['Deals', syncStatus.dealsCount], ['Tickets', syncStatus.ticketsCount], ['Activities', syncStatus.activitiesCount]].map(([name, count]) => (
              <Grid item xs={6} md={2.4} key={name}>
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none', textAlign: 'center' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="textSecondary">{name}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={handleForceSync} sx={{ backgroundColor: '#517891', borderRadius: 0 }}>Force Sync</Button>
            <Button variant="outlined" onClick={() => handleSyncRepair('replay_failed')} sx={{ color: '#517891', borderColor: '#517891', borderRadius: 0 }}>Replay Retry Queue</Button>
            <Button variant="outlined" onClick={() => handleSyncRepair('merge_duplicates')} sx={{ color: '#517891', borderColor: '#517891', borderRadius: 0 }}>De-Duplicate CRM</Button>
            <Button variant="outlined" onClick={() => handleSyncRepair('repair_missing')} sx={{ color: '#517891', borderColor: '#517891', borderRadius: 0 }}>Repair Missing Records</Button>
          </Box>
        </Box>
      )}

      {/* =========================================================
         TAB 2: AI COACHING REPORT
         ========================================================= */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Automated AI Coaching intelligence</Typography>
          <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Generate Coaching Analysis</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select value={coachingDept} onChange={(e) => setCoachingDept(e.target.value)} label="Department">
                      {['Sales', 'HR', 'Customer Service', 'BCO', 'Management'].map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Report Cycle</InputLabel>
                    <Select value={coachingPeriod} onChange={(e) => setCoachingPeriod(e.target.value)} label="Report Cycle">
                      {['Daily', 'Weekly', 'Monthly'].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Target Employee</InputLabel>
                    <Select value={coachingEmployeeId} onChange={(e) => setCoachingEmployeeId(e.target.value)} label="Target Employee">
                      <MenuItem value="">General Team Summary</MenuItem>
                      {employeesList.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="contained" fullWidth onClick={handleCoachingGenerate} sx={{ backgroundColor: '#57B9FF', borderRadius: 0 }}>
                    Generate Report
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>Generated Coaching Reports Registry</Typography>
          <Grid container spacing={2}>
            {coachingReports.map((cr) => (
              <Grid item xs={12} key={cr._id}>
                <Paper sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>
                    {cr.department} department - {cr.reportType} Coaching Audit (Generated: {new Date(cr.dateGenerated).toLocaleDateString()})
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Strengths:</strong> {cr.strengths.join(', ')}</Typography>
                    <Typography variant="body2"><strong>Weaknesses:</strong> {cr.weaknesses.join(', ')}</Typography>
                    <Typography variant="body2"><strong>Suggestions:</strong> {cr.coachingSuggestions.join(', ')}</Typography>
                    <Typography variant="body2"><strong>Risk Factors:</strong> {cr.riskFactors.join(', ')}</Typography>
                    <Typography variant="body2"><strong>Improvement Blueprint Action:</strong> {cr.improvementPlan}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 3: PROCESS DISCOVERY
         ========================================================= */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>AI Process Mining Engine</Typography>
          <Button variant="contained" onClick={handleProcessMine} sx={{ backgroundColor: '#517891', borderRadius: 0, mb: 3 }}>
            Run Activity Logs Scan
          </Button>

          <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Repetitive Activity Detected</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Daily Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duplicate Hits</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Avg Duration</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Bottleneck Severity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>AI Optimization Recommendation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processes.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.activityName}</TableCell>
                  <TableCell>{p.count}</TableCell>
                  <TableCell>{p.duplicateActionsCount}</TableCell>
                  <TableCell>{(p.avgDurationMs / 1000).toFixed(1)}s</TableCell>
                  <TableCell sx={{ color: p.bottleneckLevel === 'High' ? 'red' : 'orange', fontWeight: 'bold' }}>{p.bottleneckLevel}</TableCell>
                  <TableCell>{p.recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* =========================================================
         TAB 4: AGENT MARKETPLACE
         ========================================================= */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Internal AI Agents Marketplace</Typography>
          <Grid container spacing={2}>
            {marketplaceAgents.map((ag) => (
              <Grid item xs={12} md={4} key={ag._id}>
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>{ag.name}</Typography>
                    <Typography variant="caption" display="block" color="textSecondary">Provider: {ag.provider} | Model: {ag.modelName}</Typography>
                    <Typography variant="body2" sx={{ my: 1, minHeight: '40px', fontSize: '11px', color: '#4B5563' }}>{ag.systemPrompt}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      <Button size="small" variant="contained" onClick={() => handleMarketplaceAction(ag._id, 'clone')} sx={{ fontSize: '10px', height: '24px', backgroundColor: '#57B9FF' }}>Clone</Button>
                      <Button size="small" variant="outlined" onClick={() => handleMarketplaceAction(ag._id, 'rollback')} sx={{ fontSize: '10px', height: '24px', color: '#517891', borderColor: '#517891' }}>Rollback</Button>
                      <Button size="small" variant="contained" color="error" onClick={() => handleMarketplaceAction(ag._id, 'disable')} sx={{ fontSize: '10px', height: '24px' }}>Disable</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 5: PROMPT REGISTRY
         ========================================================= */}
      {activeTab === 5 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Enterprise Prompt Registry</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Prompt Editor Playground</Typography>
                  <TextField size="small" label="Prompt Template Name" value={promptName} onChange={(e) => setPromptName(e.target.value)} />
                  <FormControl size="small">
                    <InputLabel>Target Model Provider</InputLabel>
                    <Select value={promptProvider} onChange={(e) => setPromptProvider(e.target.value)} label="Target Model Provider">
                      {['GPT', 'Claude', 'Gemini', 'OpenRouter', 'Local'].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField multiline rows={4} label="System Prompt Content" value={promptContent} onChange={(e) => setPromptContent(e.target.value)} />
                  <Button variant="contained" onClick={() => handleSavePrompt()} sx={{ backgroundColor: '#517891', borderRadius: 0 }}>Save Prompt to Registry</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Prompt Playground Testing</Typography>
                  <TextField size="small" multiline rows={2} label="Variables Mock Input Context" value={promptTestInput} onChange={(e) => setPromptTestInput(e.target.value)} />
                  <Button variant="outlined" onClick={handleTestPrompt} sx={{ color: '#57B9FF', borderColor: '#57B9FF', borderRadius: 0 }}>Run Test Inference</Button>
                  {promptTestOutput && (
                    <Box sx={{ p: 1, backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Playground Inference Output:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{promptTestOutput}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Active Registry</Typography>
          <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Prompt Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Content Guidelines</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Approval Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prompts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.provider}</TableCell>
                  <TableCell>v{p.version}</TableCell>
                  <TableCell sx={{ fontSize: '11px' }}>{p.content.substring(0, 80)}...</TableCell>
                  <TableCell sx={{ color: p.isApproved ? 'green' : 'orange', fontWeight: 'bold' }}>
                    {p.isApproved ? 'Approved Production' : 'Pending Approval'}
                  </TableCell>
                  <TableCell>
                    {!p.isApproved && (
                      <Button size="small" variant="contained" onClick={() => handleApprovePrompt(p._id)} sx={{ fontSize: '10px', height: '24px', backgroundColor: '#517891' }}>
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* =========================================================
         TAB 6: AI COST MANAGEMENT
         ========================================================= */}
      {activeTab === 6 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>AI Spend Management Center</Typography>
          <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Model Provider / Resource</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tokens Counted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Cost Surcharge</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {costs.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.provider}</TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell>{c.tokensCount.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>${c.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* =========================================================
         TAB 7: N8N MIGRATION
         ========================================================= */}
      {activeTab === 7 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>n8n Automation Migration Center</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Import n8n JSON Schema</Typography>
                  <TextField size="small" label="Import Workflow Name" value={n8nWorkflowName} onChange={(e) => setN8nWorkflowName(e.target.value)} />
                  <TextField multiline rows={6} label="Copy/Paste n8n JSON" value={n8nJson} onChange={(e) => setN8nJson(e.target.value)} />
                  <Button variant="contained" onClick={handleN8NMigrate} sx={{ backgroundColor: '#517891', borderRadius: 0 }}>Migrate Node Structure</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {n8nReport ? (
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>Migration Audit Report</Typography>
                    <Alert severity="success" sx={{ borderRadius: 0, mb: 2 }}>Workflow Name: <strong>{n8nReport.workflowName}</strong> | Status: <strong>{n8nReport.status}</strong></Alert>
                    <Typography variant="caption" display="block"><strong>Mapped Credentials:</strong> {n8nReport.credentialsMapped.join(', ') || 'None'}</Typography>
                    <Typography variant="caption" display="block"><strong>Interpolated Variables:</strong> {n8nReport.variablesMapped.join(', ') || 'None'}</Typography>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 0 }}>Enter n8n workflow parameters to parse nodes definitions.</Alert>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 8: SUPABASE OPERATIONS
         ========================================================= */}
      {activeTab === 8 && supabaseConsole && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Supabase Operational Admin Console</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="textSecondary">Connection Status</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'green' }}>{supabaseConsole.connectionStatus}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="textSecondary">PostgreSQL Replication Status</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'green' }}>{supabaseConsole.replicationStatus}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="textSecondary">Last PostgreSQL Backup</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{new Date(supabaseConsole.lastBackup).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Supabase PostgreSQL Schema Metrics</Typography>
              <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Table Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rows Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>MongoDB Sync</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supabaseConsole.schemas.map((s, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.rowsCount}</TableCell>
                      <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>{s.syncStatus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Supabase SQL Query Explorer</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField multiline rows={3} value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} placeholder="Type custom SQL commands" />
                <Button variant="contained" onClick={handleSQLQuery} sx={{ backgroundColor: '#517891', borderRadius: 0 }}>Execute Query</Button>
                {sqlResult && (
                  <Box sx={{ p: 1, backgroundColor: '#0F172A', color: '#38BDF8', fontFamily: 'monospace', fontSize: '11px', maxHeight: '150px', overflowY: 'auto' }}>
                    {sqlResult}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 9: OPERATIONS COMMAND CENTER
         ========================================================= */}
      {activeTab === 9 && operationsStats && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Operations Executive Dashboard</Typography>
          <Grid container spacing={2}>
            {[
              ['Running Agents', operationsStats.runningAgentsCount, 'green'],
              ['Failed Agents', operationsStats.failedAgentsCount, 'green'],
              ['Active DAG Workflows', operationsStats.runningWorkflowsCount, 'green'],
              ['Failed Workflows', operationsStats.failedWorkflowsCount, 'orange'],
              ['Webhooks / Sync Issues', operationsStats.syncErrorsCount, 'green'],
              ['BullMQ Queue Backlog', operationsStats.queueBacklogCount, 'green']
            ].map(([label, count, color]) => (
              <Grid item xs={6} md={4} key={label}>
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="caption" color="textSecondary">{label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color }}>{count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 10: CHATBOT FEEDBACK
         ========================================================= */}
      {activeTab === 10 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Chatbot Answer Rating & SOP Feedback Queue</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Log Answer Heuristic Feedback</Typography>
                  <TextField size="small" label="User Question" value={chatbotQuestion} onChange={(e) => setChatbotQuestion(e.target.value)} />
                  <TextField size="small" label="Chatbot Answer" value={chatbotAnswer} onChange={(e) => setChatbotAnswer(e.target.value)} />
                  <FormControl size="small">
                    <InputLabel>Rating</InputLabel>
                    <Select value={chatbotRating} onChange={(e) => setChatbotRating(e.target.value)} label="Rating">
                      <MenuItem value="Thumbs Up">Thumbs Up</MenuItem>
                      <MenuItem value="Thumbs Down">Thumbs Down</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Report Missing SOP / Topic Name" value={chatbotSopTopic} onChange={(e) => setChatbotSopTopic(e.target.value)} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input type="checkbox" id="escalateCheck" checked={chatbotEscalate} onChange={(e) => setChatbotEscalate(e.target.checked)} />
                    <label htmlFor="escalateCheck" style={{ fontSize: '12px' }}>Escalate to Human Ticket</label>
                  </Box>
                  <Button variant="contained" onClick={handleChatbotFeedbackSubmit} sx={{ backgroundColor: '#517891', borderRadius: 0 }}>Submit Feedback</Button>
                  {chatbotFeedbackResult && <Alert severity="success" sx={{ borderRadius: 0 }}>{chatbotFeedbackResult}</Alert>}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Feedback Queue logs</Typography>
              <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Missing SOP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Escalated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatbotFeedback.map((cf) => (
                    <TableRow key={cf._id}>
                      <TableCell sx={{ fontSize: '11px' }}>{cf.question}</TableCell>
                      <TableCell sx={{ color: cf.rating === 'Thumbs Up' ? 'green' : 'red', fontWeight: 'bold' }}>{cf.rating}</TableCell>
                      <TableCell>{cf.missingSopReported ? cf.sopTopic : 'No'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{cf.escalated ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 11: EXECUTIVE AI COMMAND
         ========================================================= */}
      {activeTab === 11 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Natural Language Operations interface</Typography>
          <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Ask Executive Bot (e.g. 'Show sales risk this week.', 'Which employees need coaching?')" 
                value={execQueryPrompt} 
                onChange={(e) => setExecQueryPrompt(e.target.value)} 
              />
              <Button variant="contained" onClick={handleExecutiveQuerySubmit} sx={{ backgroundColor: '#517891', borderRadius: 0, minWidth: '120px' }}>
                Run Query
              </Button>
            </CardContent>
          </Card>

          {execQueryReply && (
            <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none', mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Operations Executive Report Analysis</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{execQueryReply}</Typography>

                {execQueryVisual && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 1 }}>
                      {execQueryVisual.title}
                    </Typography>
                    <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                      <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                          {execQueryVisual.headers.map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 'bold', py: 0.75 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {execQueryVisual.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {row.map((cell, cidx) => (
                              <TableCell key={cidx} sx={{ py: 0.5 }}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* =========================================================
         TAB 12: TESTING LAB
         ========================================================= */}
      {activeTab === 12 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Agent Sandbox Testing Laboratory</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Trigger Sandbox Simulation</Typography>
                  <FormControl size="small">
                    <InputLabel>Testing Mode</InputLabel>
                    <Select value={testingType} onChange={(e) => setTestingType(e.target.value)} label="Testing Mode">
                      {['Simulation', 'Scenario Test', 'Historical Replay', 'Load Testing', 'Stress Testing'].map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField multiline rows={3} label="Parameters Input (JSON)" value={testingParams} onChange={(e) => setTestingParams(e.target.value)} />
                  <Button variant="contained" onClick={handleTestingLabSubmit} sx={{ backgroundColor: '#57B9FF', borderRadius: 0 }}>
                    Run Simulation Test
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              {testingResult ? (
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 0, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 2 }}>Simulation Results</Typography>
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                      <Box><Typography variant="caption">Status</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: 'green' }}>{testingResult.status}</Typography></Box>
                      <Box><Typography variant="caption">Scenarios Run</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{testingResult.scenariosExecuted}</Typography></Box>
                      <Box><Typography variant="caption">Avg Latency</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{testingResult.averageLatencyMs}ms</Typography></Box>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Validation assertions check:</Typography>
                    <ul>
                      {testingResult.validationReports.map((r, idx) => (
                        <li key={idx}><Typography variant="caption">{r}</Typography></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 0 }}>Define simulation settings to launch tests verification runs.</Alert>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* =========================================================
         TAB 13: AUDIT LEDGER
         ========================================================= */}
      {activeTab === 13 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Enterprise Audit Center Action Ledger</Typography>
          <TextField 
            size="small" 
            placeholder="Search audit changes by action/actor..." 
            value={auditSearch} 
            onChange={(e) => setAuditSearch(e.target.value)} 
            sx={{ mb: 2, width: '300px' }} 
          />

          <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Old Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>New Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Audit Log Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs
                .filter(log => log.action.toLowerCase().includes(auditSearch.toLowerCase()) || log.actorEmail?.toLowerCase().includes(auditSearch.toLowerCase()))
                .map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#517891' }}>{log.action}</TableCell>
                    <TableCell>{log.actorEmail || 'System Process'}</TableCell>
                    <TableCell sx={{ fontSize: '11px' }}>{log.oldValue || 'N/A'}</TableCell>
                    <TableCell sx={{ fontSize: '11px' }}>{log.newValue || 'N/A'}</TableCell>
                    <TableCell>{log.reason}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* =========================================================
         TAB 14: SELF-HEALING
         ========================================================= */}
      {activeTab === 14 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#517891', mb: 1 }}>Self-Healing circuit Breakers & Failures Recovery Logs</Typography>
          <Table component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Failed Node / Service</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Error Log Detail</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Recovery Strategy</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Circuit Breaker</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recoveryLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{log.errorOrigin}</TableCell>
                  <TableCell sx={{ fontSize: '11px' }}>{log.errorMessage}</TableCell>
                  <TableCell>{log.recoveryAction} (Retry: {log.retriesCount})</TableCell>
                  <TableCell sx={{ color: log.recoveryStatus === 'Recovered' ? 'green' : 'orange', fontWeight: 'bold' }}>{log.recoveryStatus}</TableCell>
                  <TableCell sx={{ color: log.circuitBreakerStatus === 'Closed' ? 'green' : 'red', fontWeight: 'bold' }}>{log.circuitBreakerStatus}</TableCell>
                  <TableCell>
                    {log.circuitBreakerStatus === 'Open' && (
                      <Button size="small" variant="contained" onClick={() => handleHealingAction(log._id, 'close_circuit')} sx={{ fontSize: '10px', height: '24px', backgroundColor: '#517891' }}>
                        Close Circuit
                      </Button>
                    )}
                    {log.recoveryStatus === 'Retrying' && (
                      <Button size="small" variant="outlined" onClick={() => handleHealingAction(log._id, 'force_retry')} sx={{ fontSize: '10px', height: '24px', color: '#57B9FF', borderColor: '#57B9FF', ml: 1 }}>
                        Force Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default AdvancedConsole;
