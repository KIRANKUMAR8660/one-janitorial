import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  MenuItem,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DnsIcon from '@mui/icons-material/Dns';
import MemoryIcon from '@mui/icons-material/Memory';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';

import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = '/api/integrations';

const Integrations = () => {
  const { accessToken, role } = useSelector(state => state.auth);
  
  // Navigation Tabs
  const [tabIndex, setTabIndex] = useState(0);

  // States
  const [integrations, setIntegrations] = useState([]);
  const [secrets, setSecrets] = useState([]);
  const [audits, setAudits] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Setup Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [wizardConfig, setWizardConfig] = useState({});
  const [wizardSecret, setWizardSecret] = useState('');
  const [wizardSecretRotDays, setWizardSecretRotDays] = useState(90);

  // Secret Vault Form State
  const [vaultKey, setVaultKey] = useState('');
  const [vaultVal, setVaultVal] = useState('');
  const [vaultCategory, setVaultCategory] = useState('AI Providers');
  const [vaultRotDays, setVaultRotDays] = useState(90);

  // Email Test Dialog
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Custom API Generator States
  const [customApis, setCustomApis] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [openCreateApi, setOpenCreateApi] = useState(false);
  const [openApiDetails, setOpenApiDetails] = useState(false);
  const [openApiTest, setOpenApiTest] = useState(false);
  const [openApiLogs, setOpenApiLogs] = useState(false);

  // API builder fields
  const [apiName, setApiName] = useState('');
  const [apiDesc, setApiDesc] = useState('');
  const [apiRoute, setApiRoute] = useState('');
  const [apiMethod, setApiMethod] = useState('POST');
  const [apiVersion, setApiVersion] = useState('1.0.0');
  const [apiAuth, setApiAuth] = useState(true);
  const [apiRateLimit, setApiRateLimit] = useState(60);
  const [apiWorkflow, setApiWorkflow] = useState('');
  const [apiRules, setApiRules] = useState([]); // Array of { fieldName, fieldType, required }
  const [editingApiId, setEditingApiId] = useState(null);
  const [selectedApi, setSelectedApi] = useState(null);

  // Testing fields
  const [testPayload, setTestPayload] = useState('{}');
  const [testResponse, setTestResponse] = useState(null);
  const [testApiLogs, setTestApiLogs] = useState([]);

  const socketRef = useRef(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      const [intRes, secRes, audRes, healthRes, customApisRes, workflowsRes] = await Promise.all([
        axios.get(`${API_BASE}/`, config),
        axios.get(`${API_BASE}/secrets`, config),
        axios.get(`${API_BASE}/audit`, config),
        axios.get(`${API_BASE}/health`, config),
        axios.get(`/api/custom-apis`, config),
        axios.get(`/api/workflows`, config)
      ]);

      setIntegrations(intRes.data || []);
      setSecrets(secRes.data || []);
      setAudits(audRes.data || []);
      setHealthMetrics(healthRes.data || null);
      setCustomApis(customApisRes.data || []);
      setWorkflows(workflowsRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load integration systems data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Listen to real-time events via websocket
    socketRef.current = io();
    socketRef.current.on('realtime_integration_event', () => {
      fetchAllData();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [accessToken]);

  // Helper for success timeout
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 5000);
  };

  // Helper for error timeout
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 7000);
  };

  // Toggle Integration Status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(true);
      const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      await axios.put(`${API_BASE}/${id}/status`, { status: newStatus }, config);
      showSuccess(`Integration status changed to ${newStatus}`);
      fetchAllData();
      setActionLoading(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to toggle status.');
      setActionLoading(false);
    }
  };

  // Test Connection Call
  const handleTestConnection = async (name) => {
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      const res = await axios.post(`${API_BASE}/test`, { name }, config);
      if (res.data.success) {
        showSuccess(`${name} connection test: ${res.data.message} (Latency: ${res.data.latency}ms)`);
      } else {
        showError(`${name} connection test failed: ${res.data.message}`);
      }
      fetchAllData();
      setActionLoading(false);
    } catch (err) {
      showError(err.response?.data?.message || `Failed to test connection for ${name}`);
      setActionLoading(false);
    }
  };

  // Rotate Secret in Vault
  const handleRotateSecret = async (e) => {
    if (e) e.preventDefault();
    if (!vaultKey || !vaultVal) {
      return showError('Both secret key and credential value are required.');
    }
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      await axios.post(`${API_BASE}/secrets`, {
        key: vaultKey,
        value: vaultVal,
        category: vaultCategory,
        rotationPeriodDays: vaultRotDays
      }, config);
      
      showSuccess(`Vault Secret ${vaultKey} rotated and saved successfully.`);
      setVaultKey('');
      setVaultVal('');
      fetchAllData();
      setActionLoading(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to rotate credential secret.');
      setActionLoading(false);
    }
  };

  // Save Wizard Configuration & Secret
  const handleSaveWizard = async () => {
    try {
      setActionLoading(true);
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      // 1. Update Config Object
      await axios.put(`${API_BASE}/${activeIntegration._id}/config`, { config: wizardConfig }, config);
      
      // 2. Rotate Secret if provided
      if (wizardSecret) {
        const associatedKey = activeIntegration.name.toUpperCase().replace(/[\s\.]/g, '_') + '_API_KEY';
        await axios.post(`${API_BASE}/secrets`, {
          key: associatedKey,
          value: wizardSecret,
          category: activeIntegration.category,
          rotationPeriodDays: wizardSecretRotDays
        }, config);
      }
      
      showSuccess(`Config and Credentials updated for ${activeIntegration.name}.`);
      setWizardOpen(false);
      setActiveIntegration(null);
      setWizardConfig({});
      setWizardSecret('');
      fetchAllData();
      setActionLoading(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save configuration settings.');
      setActionLoading(false);
    }
  };

  // Category Icons Mappings
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'AI Providers': return <SettingsInputComponentIcon sx={{ color: '#57B9FF' }} />;
      case 'CRM': return <SyncIcon sx={{ color: '#57B9FF' }} />;
      case 'Databases': return <StorageIcon sx={{ color: '#57B9FF' }} />;
      case 'Communication': return <ChatIcon sx={{ color: '#57B9FF' }} />;
      case 'Email': return <EmailIcon sx={{ color: '#57B9FF' }} />;
      case 'Storage': return <CloudQueueIcon sx={{ color: '#57B9FF' }} />;
      case 'Vector Databases': return <DnsIcon sx={{ color: '#57B9FF' }} />;
      default: return <SettingsIcon sx={{ color: '#57B9FF' }} />;
    }
  };

  // Open Wizard for integration
  const openWizard = (int) => {
    setActiveIntegration(int);
    setWizardConfig(int.config || {});
    setWizardSecret('');
    setWizardSecretRotDays(90);
    setWizardOpen(true);
  };

  // Custom API Management Handlers
  const handleOpenCreateApi = () => {
    setEditingApiId(null);
    setApiName('');
    setApiDesc('');
    setApiRoute('');
    setApiMethod('POST');
    setApiVersion('1.0.0');
    setApiAuth(true);
    setApiRateLimit(60);
    setApiWorkflow('');
    setApiRules([]);
    setOpenCreateApi(true);
  };

  const handleOpenEditApi = (api) => {
    setEditingApiId(api._id);
    setApiName(api.name);
    setApiDesc(api.description || '');
    setApiRoute(api.routePath);
    setApiMethod(api.method);
    setApiVersion(api.version);
    setApiAuth(api.authRequired);
    setApiRateLimit(api.rateLimit || 60);
    setApiWorkflow(api.workflow?._id || api.workflow || '');
    setApiRules(api.validationRules || []);
    setOpenCreateApi(true);
  };

  const handleSaveCustomApi = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const body = {
        name: apiName,
        description: apiDesc,
        routePath: apiRoute,
        method: apiMethod,
        version: apiVersion,
        authRequired: apiAuth,
        rateLimit: apiRateLimit,
        workflow: apiWorkflow || undefined,
        validationRules: apiRules
      };

      if (editingApiId) {
        await axios.put(`/api/custom-apis/${editingApiId}`, body, config);
        showSuccess('Custom API updated successfully.');
      } else {
        await axios.post(`/api/custom-apis`, body, config);
        showSuccess('Custom API generated successfully.');
      }

      setOpenCreateApi(false);
      fetchAllData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save Custom API.');
    }
  };

  const handleDeleteCustomApi = async (id) => {
    if (!window.confirm('Delete this generated custom API?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      await axios.delete(`/api/custom-apis/${id}`, config);
      showSuccess('Custom API deleted successfully.');
      fetchAllData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete Custom API.');
    }
  };

  const handleToggleApiStatus = async (api) => {
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const nextStatus = api.status === 'Enabled' ? 'Disabled' : 'Enabled';
      await axios.put(`/api/custom-apis/${api._id}`, { status: nextStatus }, config);
      showSuccess(`Custom API status toggled to ${nextStatus}.`);
      fetchAllData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to toggle API status.');
    }
  };

  // Add rule helper
  const handleAddRule = () => {
    setApiRules(prev => [...prev, { fieldName: '', fieldType: 'String', required: true }]);
  };

  // Remove rule helper
  const handleRemoveRule = (index) => {
    setApiRules(prev => prev.filter((_, i) => i !== index));
  };

  // Edit rule field
  const handleEditRuleField = (index, key, val) => {
    setApiRules(prev => prev.map((r, i) => i === index ? { ...r, [key]: val } : r));
  };

  // Open testing sandbox
  const openTestSandbox = (api) => {
    setSelectedApi(api);
    setTestPayload('{\n  \n}');
    setTestResponse(null);
    setOpenApiTest(true);
  };

  // Execute manual connection test on dynamic runner
  const handleExecuteApiTest = async () => {
    setTestResponse('Executing...');
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(testPayload);
      } catch (e) {
        return setTestResponse('Error: Invalid JSON body template.');
      }

      const path = `/api/custom-run/${selectedApi.version}/${selectedApi.routePath}`;
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      let res;
      if (selectedApi.method === 'GET') {
        res = await axios.get(path, config);
      } else if (selectedApi.method === 'PUT') {
        res = await axios.put(path, parsedPayload, config);
      } else if (selectedApi.method === 'DELETE') {
        res = await axios.delete(path, config);
      } else {
        res = await axios.post(path, parsedPayload, config);
      }

      setTestResponse(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setTestResponse(JSON.stringify(err.response?.data || err.message, null, 2));
    }
  };

  // View logs helper
  const openApiLogsView = async (api) => {
    setSelectedApi(api);
    setTestApiLogs([]);
    setOpenApiLogs(true);
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const res = await axios.get(`/api/custom-apis/${api._id}/logs`, config);
      setTestApiLogs(res.data || []);
    } catch (err) {
      showError('Failed to fetch logs.');
    }
  };

  if (!['Super Admin', 'Admin'].includes(role)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Access Denied: Only platform administrators are permitted to view credentials and vault configurations.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: '2px', backgroundColor: '#FFFFFF', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#845EC2', fontWeight: 'bold' }}>
            ENTERPRISE API INTEGRATION & VAULT CONTROL
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Centralized third-party endpoints provisioning, AES credential secrets rotation, connection auditing, and dynamic custom API generator
          </Typography>
        </Box>
        <Button size="small" variant="contained" onClick={fetchAllData} startIcon={<RefreshIcon />} sx={{ backgroundColor: '#845EC2', '&:hover': { backgroundColor: '#6c49a6' } }}>
          Sync Catalog
        </Button>
      </Box>

      {/* Notifications */}
      {error && <Alert severity="error" sx={{ py: 0.25, fontSize: '12px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ py: 0.25, fontSize: '12px' }}>{success}</Alert>}

      {/* Navigation tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{ borderBottom: '1px solid #845EC2', mb: 1 }}
      >
        <Tab label="Integrations Catalog" icon={<SettingsIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Secrets Vault & Rotations" icon={<VpnKeyIcon fontSize="small" />} iconPosition="start" />
        <Tab label="System Hardware Monitor" icon={<MonitorHeartIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Administrative Audits" icon={<LockIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Custom API Builder" icon={<MemoryIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          {/* TAB 0: INTEGRATIONS CATALOG */}
          {tabIndex === 0 && (
            <Box>
              <Grid container spacing={2}>
                {integrations.map(int => (
                  <Grid item xs={12} sm={6} md={4} key={int._id}>
                    <Card sx={{ border: '1px solid #845EC2', boxShadow: 'none' }}>
                      <CardHeader
                        avatar={getCategoryIcon(int.category)}
                        title={int.name.toUpperCase()}
                        subheader={int.category}
                        titleTypographyProps={{ fontWeight: 'bold', fontSize: '14px', color: '#845EC2' }}
                        subheaderTypographyProps={{ fontSize: '11px' }}
                        action={
                          <Switch
                            size="small"
                            checked={int.status === 'Enabled'}
                            onChange={() => handleToggleStatus(int._id, int.status)}
                            disabled={actionLoading}
                          />
                        }
                        sx={{ p: 1.5, pb: 0 }}
                      />
                      <CardContent sx={{ p: 1.5, pt: 1, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '12px' }}>
                          <span style={{ color: '#64748B' }}>Status:</span>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: int.healthStatus === 'Connected' ? '#00C9A7' : int.healthStatus === 'Error' ? '#EF4444' : '#6B7280' 
                          }}>
                            {int.healthStatus}
                          </span>
                        </Box>
                        
                        <Grid container spacing={1} sx={{ mb: 1.5, fontSize: '11px', textAlign: 'center', backgroundColor: '#FEFEDF', border: '1px solid #845EC2', py: 0.5, borderRadius: '4px' }}>
                          <Grid item xs={4}>
                            <Typography variant="caption" display="block" color="textSecondary">Latency</Typography>
                            <strong>{int.status === 'Enabled' ? `${int.latency}ms` : 'N/A'}</strong>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" display="block" color="textSecondary">Error Rate</Typography>
                            <strong style={{ color: int.errorRate > 0 ? '#EF4444' : 'inherit' }}>{int.errorRate}%</strong>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" display="block" color="textSecondary">Webhook</Typography>
                            <strong>{int.webhookStatus}</strong>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth 
                            onClick={() => handleTestConnection(int.name)}
                            disabled={int.status === 'Disabled' || actionLoading}
                            sx={{ height: 28, fontSize: '11px' }}
                          >
                            Test Ping
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            fullWidth 
                            onClick={() => openWizard(int)}
                            disabled={actionLoading}
                            sx={{ height: 28, fontSize: '11px' }}
                          >
                            Provision
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 1: SECRETS VAULT */}
          {tabIndex === 1 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                      Rotate Secrets Credentials
                    </Typography>
                    <Divider />
                    <TextField
                      size="small"
                      label="Key ID Identifier (e.g. RINGCENTRAL_PASSWORD)"
                      value={vaultKey}
                      onChange={(e) => setVaultKey(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      type="password"
                      label="Value / Password / Token"
                      value={vaultVal}
                      onChange={(e) => setVaultVal(e.target.value)}
                      fullWidth
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select value={vaultCategory} label="Category" onChange={(e) => setVaultCategory(e.target.value)}>
                        {['AI Providers', 'CRM', 'Databases', 'Communication', 'Email', 'Storage'].map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      type="number"
                      label="Enforce rotation period (Days)"
                      value={vaultRotDays}
                      onChange={(e) => setVaultRotDays(Number(e.target.value))}
                      fullWidth
                    />
                    <Button variant="contained" onClick={handleRotateSecret} sx={{ mt: 1 }}>
                      Rotate Secret
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                      Active Credentials Registry Vault (Encrypted AES-256 GCM)
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Secret Key Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Masked Value</TableCell>
                            <TableCell>Last Rotated</TableCell>
                            <TableCell align="center">Policy Limit</TableCell>
                            <TableCell>Rotated By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {secrets.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">No secure credentials registered in Vault.</TableCell>
                            </TableRow>
                          ) : (
                            secrets.map(sec => (
                              <TableRow key={sec._id}>
                                <TableCell sx={{ fontWeight: 'bold', color: '#845EC2', fontSize: '11px' }}>{sec.key}</TableCell>
                                <TableCell sx={{ fontSize: '11px' }}>{sec.category}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748B' }}>
                                  {sec.maskedValue}
                                </TableCell>
                                <TableCell sx={{ fontSize: '11px' }}>{new Date(sec.lastRotated).toLocaleDateString()}</TableCell>
                                <TableCell align="center" sx={{ fontSize: '11px' }}>{sec.rotationPeriodDays} Days</TableCell>
                                <TableCell sx={{ fontSize: '11px' }}>{sec.updatedBy}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 2: SYSTEM HARDWARE MONITOR */}
          {tabIndex === 2 && healthMetrics && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 2 }}>
                      Host Resources Utilization
                    </Typography>
                    
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MemoryIcon fontSize="small" color="primary" /> Node Heap Memory</span>
                        <strong>{healthMetrics.systemResources?.memoryHeapUsedMb} MB / {healthMetrics.systemResources?.memoryHeapTotalMb} MB</strong>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, Math.round((healthMetrics.systemResources?.memoryHeapUsedMb / healthMetrics.systemResources?.memoryHeapTotalMb) * 100))} 
                        sx={{ height: 10, borderRadius: 2 }}
                      />
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DnsIcon fontSize="small" color="primary" /> CPU Processing Time</span>
                        <strong>{(healthMetrics.systemResources?.cpuUserMicroSecs / 1000 / 1000).toFixed(2)} Sec</strong>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, Math.round(healthMetrics.systemResources?.cpuUserMicroSecs / 100000))} 
                        color="success"
                        sx={{ height: 10, borderRadius: 2 }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                      Network Diagnostics Console Logs
                    </Typography>
                    
                    <Box sx={{
                      backgroundColor: '#1E293B',
                      color: '#F8FAFC',
                      p: 1.5,
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      maxHeight: 180,
                      overflowY: 'auto',
                      minHeight: 180
                    }}>
                      {integrations.flatMap(i => i.logs.map(l => ({ ...l, serviceName: i.name }))).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).length === 0 ? (
                        <div style={{ color: '#94A3B8' }}>No diagnostic test log items found in history.</div>
                      ) : (
                        integrations.flatMap(i => i.logs.map(l => ({ ...l, serviceName: i.name }))).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', color: log.status === 'Success' ? '#34D399' : '#F87171' }}>
                            [{new Date(log.timestamp).toLocaleTimeString()}] [{log.serviceName.toUpperCase()}] {log.action} - {log.status}: {log.message}
                          </div>
                        ))
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: AUDITS */}
          {tabIndex === 3 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                Central Vault System Audits Log
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Action Event</TableCell>
                      <TableCell>Integration</TableCell>
                      <TableCell>Audited Log Details</TableCell>
                      <TableCell>Actor Username</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {audits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No vault audit log records available.</TableCell>
                      </TableRow>
                    ) : (
                      audits.map(aud => (
                        <TableRow key={aud._id}>
                          <TableCell sx={{ fontSize: '11px' }}>{new Date(aud.createdAt).toLocaleString()}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#845EC2', fontSize: '11px' }}>{aud.action}</TableCell>
                          <TableCell sx={{ fontSize: '11px' }}>{aud.integrationName}</TableCell>
                          <TableCell sx={{ fontSize: '11px' }}>{aud.details}</TableCell>
                          <TableCell sx={{ fontSize: '11px' }}>{aud.actorEmail || 'System'}</TableCell>
                          <TableCell sx={{ fontSize: '11px', fontFamily: 'monospace' }}>{aud.ipAddress || '127.0.0.1'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* TAB 4: CUSTOM API BUILDER */}
          {tabIndex === 4 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                  Node-Generated Custom API Gateways Registry
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />} 
                  onClick={handleOpenCreateApi}
                  sx={{ height: 32 }}
                >
                  Generate Endpoint
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>API Endpoint Name</TableCell>
                      <TableCell>Path Route</TableCell>
                      <TableCell align="center">Method</TableCell>
                      <TableCell align="center">Version</TableCell>
                      <TableCell align="center">Auth Checked</TableCell>
                      <TableCell align="center">Rate Limit</TableCell>
                      <TableCell>Linked Workflow</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customApis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3, color: '#64748B' }}>
                          No custom APIs generated. Click "Generate Endpoint" to compile your first API.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customApis.map(api => (
                        <TableRow key={api._id}>
                          <TableCell sx={{ fontWeight: 'bold', color: '#845EC2' }}>{api.name}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            /api/custom-run/{api.version}/{api.routePath}
                          </TableCell>
                          <TableCell align="center">
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: api.method === 'POST' ? '#845EC2' : api.method === 'GET' ? '#00C9A7' : '#D65DB1' 
                            }}>
                              {api.method}
                            </span>
                          </TableCell>
                          <TableCell align="center">{api.version}</TableCell>
                          <TableCell align="center">{api.authRequired ? 'JWT Token' : 'Public'}</TableCell>
                          <TableCell align="center">{api.rateLimit} req/m</TableCell>
                          <TableCell>{api.workflow?.name || 'Generic Script Run'}</TableCell>
                          <TableCell align="center">
                            <Switch 
                              size="small" 
                              checked={api.status === 'Enabled'} 
                              onChange={() => handleToggleApiStatus(api)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => { setSelectedApi(api); setOpenApiDetails(true); }} title="View OpenAPI Spec">
                              <CodeIcon fontSize="small" sx={{ color: '#845EC2' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => openTestSandbox(api)} title="Run Connections Test">
                              <PlayArrowIcon fontSize="small" sx={{ color: '#00C9A7' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => openApiLogsView(api)} title="View Logs">
                              <TroubleshootIcon fontSize="small" sx={{ color: '#845EC2' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenEditApi(api)} title="Edit Settings">
                              <EditIcon fontSize="small" sx={{ color: '#845EC2' }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteCustomApi(api._id)} title="Delete">
                              <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}

      {/* CREATE/EDIT API BUILDER DIALOG */}
      <Dialog open={openCreateApi} onClose={() => setOpenCreateApi(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold', px: 2, py: 1.5 }}>
          {editingApiId ? 'EDIT CUSTOM ENDPOINT' : 'GENERATE CUSTOM API GATEWAY'}
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="API Name"
                size="small"
                fullWidth
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Route Endpoint Path"
                placeholder="my-custom-api"
                size="small"
                fullWidth
                value={apiRoute}
                onChange={(e) => setApiRoute(e.target.value)}
                disabled={!!editingApiId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                size="small"
                fullWidth
                value={apiDesc}
                onChange={(e) => setApiDesc(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>HTTP Method</InputLabel>
                <Select value={apiMethod} label="HTTP Method" onChange={(e) => setApiMethod(e.target.value)}>
                  {['POST', 'GET', 'PUT', 'DELETE'].map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="API Version"
                size="small"
                fullWidth
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rate Limit (req/min)"
                size="small"
                type="number"
                fullWidth
                value={apiRateLimit}
                onChange={(e) => setApiRateLimit(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Link Workflow to Node Execution</InputLabel>
                <Select value={apiWorkflow} label="Link Workflow to Node Execution" onChange={(e) => setApiWorkflow(e.target.value)}>
                  <MenuItem value="">-- Run Generic Default Code script --</MenuItem>
                  {workflows.map(wf => (
                    <MenuItem key={wf._id} value={wf._id}>{wf.name} ({wf.nodes?.length || 0} nodes)</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={apiAuth} onChange={(e) => setApiAuth(e.target.checked)} />}
                label={<Typography variant="body2">Enforce JWT Header Authentication Token</Typography>}
              />
            </Grid>

            {/* Validation fields mapping */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Input Parameters Validation Rules</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddRule}>Add Parameter</Button>
              </Box>
              <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: 150, overflowY: 'auto' }}>
                {apiRules.length === 0 ? (
                  <Typography variant="caption" color="textSecondary" align="center" display="block">No parameters validation active.</Typography>
                ) : (
                  apiRules.map((rule, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField
                        placeholder="FieldName"
                        size="small"
                        value={rule.fieldName}
                        onChange={(e) => handleEditRuleField(idx, 'fieldName', e.target.value)}
                        sx={{ height: 32, flex: 2 }}
                      />
                      <Select
                        value={rule.fieldType}
                        onChange={(e) => handleEditRuleField(idx, 'fieldType', e.target.value)}
                        sx={{ height: 32, flex: 1.5 }}
                      >
                        {['String', 'Number', 'Boolean', 'Object', 'Array'].map(t => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </Select>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            checked={rule.required} 
                            onChange={(e) => handleEditRuleField(idx, 'required', e.target.checked)} 
                          />
                        }
                        label={<span style={{ fontSize: '11px' }}>Required</span>}
                        sx={{ flex: 1 }}
                      />
                      <IconButton size="small" onClick={() => handleRemoveRule(idx)}>
                        <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenCreateApi(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleSaveCustomApi}>
            Save Custom API
          </Button>
        </DialogActions>
      </Dialog>

      {/* SWAGGER DETAILS DIALOG */}
      <Dialog open={openApiDetails} onClose={() => setOpenApiDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          OpenAPI / Swagger Spec Document
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {selectedApi && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#845EC2' }}>
                OpenAPI Spec JSON
              </Typography>
              <Box sx={{
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                p: 2,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                maxHeight: 350,
                overflowY: 'auto'
              }}>
                <pre>{JSON.stringify(selectedApi.swaggerDoc, null, 2)}</pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenApiDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* TESTING SANDBOX DIALOG */}
      <Dialog open={openApiTest} onClose={() => setOpenApiTest(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          API Connections Testing Sandbox
        </DialogTitle>
        <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedApi && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                Send test payload to: /api/custom-run/{selectedApi.version}/{selectedApi.routePath}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" display="block">
                Edit Request JSON Body:
              </Typography>
              <TextField
                multiline
                rows={4}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                sx={{
                  fontFamily: 'monospace',
                  '& textarea': { fontFamily: 'monospace', fontSize: '12px' }
                }}
              />

              <Button variant="contained" onClick={handleExecuteApiTest} startIcon={<PlayArrowIcon />}>
                Execute API Connections Test
              </Button>

              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                API Response Payload:
              </Typography>
              <Box sx={{
                backgroundColor: '#1E293B',
                color: '#34D399',
                p: 2,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                minHeight: 120,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                <pre>{testResponse || '// Waiting for connections execution...'}</pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenApiTest(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* INVOCATION LOGS DIALOG */}
      <Dialog open={openApiLogs} onClose={() => setOpenApiLogs(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          API Gateway Invocation Logs
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {selectedApi && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#845EC2', mb: 2 }}>
                Request audits log for API: {selectedApi.name}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Caller IP</TableCell>
                      <TableCell align="center">Method</TableCell>
                      <TableCell align="center">Status Code</TableCell>
                      <TableCell align="right">Latency Ping</TableCell>
                      <TableCell>Errors / Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testApiLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No request logs recorded in Vault.</TableCell>
                      </TableRow>
                    ) : (
                      testApiLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: '11px' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell sx={{ fontSize: '11px', fontFamily: 'monospace' }}>{log.ip}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>{log.method}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={log.statusCode} 
                              size="small" 
                              color={log.statusCode === 200 ? 'success' : 'error'}
                              sx={{ borderRadius: '4px', height: '18px', fontSize: '10px' }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '11px' }}>{log.latency}ms</TableCell>
                          <TableCell sx={{ color: '#EF4444', fontSize: '11px' }}>{log.error || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenApiLogs(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* SETUP WIZARD DIALOG DIALECT */}
      {activeIntegration && (
        <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#517891', color: '#FFFFFF', fontWeight: 'bold', px: 2, py: 1.5 }}>
            PROVISION WIZARD: {activeIntegration.name.toUpperCase()}
          </DialogTitle>
          <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" display="block" sx={{ mb: 1, color: '#4B5563' }}>
              Connect properties for the {activeIntegration.name} integration. Access keys are stored in the AES Secrets Vault.
            </Typography>

            {/* HUBSPOT SPECIFIC FIELDS */}
            {activeIntegration.name === 'HubSpot' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="HubSpot Portal ID (HubID)"
                  value={wizardConfig.portalId || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, portalId: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  label="HubSpot Webhook Secret"
                  value={wizardConfig.webhookSecret || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="password"
                  label="HubSpot Private App Access Token"
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Enter HubSpot private app token (sk-proj...)"
                  fullWidth
                  required
                />
                <Grid container spacing={1} sx={{ mt: 1, backgroundColor: '#FEFEDF', p: 1, borderRadius: '4px', border: '1px solid #845EC2' }}>
                  <Grid item xs={12}><Typography variant="caption" sx={{ fontWeight: 'bold' }}>Synchronized Objects Map</Typography></Grid>
                  {['Contacts', 'Companies', 'Deals', 'Tickets', 'Tasks', 'Notes', 'Meetings', 'Activities'].map(obj => (
                    <Grid item xs={3} key={obj} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DoneAllIcon sx={{ color: '#00C9A7', fontSize: '12px' }} />
                      <span style={{ fontSize: '10px' }}>{obj}</span>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* SUPABASE SPECIFIC FIELDS */}
            {activeIntegration.name === 'Supabase' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="Supabase Project API URL"
                  value={wizardConfig.projectUrl || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, projectUrl: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  type="password"
                  label="Supabase Anon/Public Key"
                  value={wizardConfig.anonKey || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  type="password"
                  label="Supabase Service Role Key"
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Enter high-privilege service key"
                  fullWidth
                  required
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={wizardConfig.realtimeSettings === 'Enabled'}
                      onChange={(e) => setWizardConfig(prev => ({ ...prev, realtimeSettings: e.target.checked ? 'Enabled' : 'Disabled' }))}
                    />
                  }
                  label={<Typography variant="body2">Enforce Postgres Realtime Channels</Typography>}
                />
              </Box>
            )}

            {/* AI PROVIDER CONFIG FIELDS */}
            {activeIntegration.category === 'AI Providers' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="Default Core Model Name"
                  value={wizardConfig.defaultModel || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                  fullWidth
                  required
                />
                {activeIntegration.name === 'OpenAI' && (
                  <TextField
                    size="small"
                    label="Organization ID (Optional)"
                    value={wizardConfig.organizationId || ''}
                    onChange={(e) => setWizardConfig(prev => ({ ...prev, organizationId: e.target.value }))}
                    fullWidth
                  />
                )}
                {activeIntegration.name === 'Anthropic Claude' && (
                  <TextField
                    size="small"
                    type="number"
                    label="Max Generation Token Limit"
                    value={wizardConfig.maxTokens || 4096}
                    onChange={(e) => setWizardConfig(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
                    fullWidth
                  />
                )}
                <TextField
                  size="small"
                  type="password"
                  label={`${activeIntegration.name} Secured API Key`}
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Set encrypted provider token key"
                  fullWidth
                  required
                />
              </Box>
            )}

            {/* EMAIL PROVIDERS CONFIG FIELDS */}
            {activeIntegration.category === 'Email' && activeIntegration.name !== 'SMTP' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="Verified Sending Domain"
                  value={wizardConfig.sendingDomain || wizardConfig.verifiedDomain || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, sendingDomain: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  type="password"
                  label="Provider Delivery API Key"
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Set email sending API token"
                  fullWidth
                  required
                />
              </Box>
            )}

            {/* SMTP SERVICES CONFIG FIELDS */}
            {activeIntegration.name === 'SMTP' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="SMTP Server Host Address"
                  value={wizardConfig.host || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, host: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  type="number"
                  label="SMTP Server Connection Port"
                  value={wizardConfig.port || 2525}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, port: Number(e.target.value) }))}
                  fullWidth
                  required
                />
                <TextField
                  size="small"
                  label="SMTP Authentication Username"
                  value={wizardConfig.username || ''}
                  onChange={(e) => setWizardConfig(prev => ({ ...prev, username: e.target.value }))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="password"
                  label="SMTP Authentication Password"
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Enter SMTP credentials password"
                  fullWidth
                />
              </Box>
            )}

            {/* COMMUNICATION & VECTOR DATABASES & OTHERS GENERAL FORM FIELDS */}
            {activeIntegration.name !== 'HubSpot' && activeIntegration.name !== 'Supabase' && activeIntegration.category !== 'AI Providers' && activeIntegration.category !== 'Email' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activeIntegration.config && Object.keys(activeIntegration.config).map(fieldKey => (
                  <TextField
                    key={fieldKey}
                    size="small"
                    label={`Property: ${fieldKey}`}
                    value={wizardConfig[fieldKey] || ''}
                    onChange={(e) => setWizardConfig(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                    fullWidth
                  />
                ))}
                <TextField
                  size="small"
                  type="password"
                  label="Vault Auth Key / Token"
                  value={wizardSecret}
                  onChange={(e) => setWizardSecret(e.target.value)}
                  placeholder="Enter access credentials / token"
                  fullWidth
                />
              </Box>
            )}

            <TextField
              size="small"
              type="number"
              label="Rotation period policy (Days)"
              value={wizardSecretRotDays}
              onChange={(e) => setWizardSecretRotDays(Number(e.target.value))}
              fullWidth
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button size="small" variant="outlined" onClick={() => setWizardOpen(false)}>Cancel</Button>
            <Button size="small" variant="contained" color="secondary" onClick={handleSaveWizard} disabled={actionLoading}>
              Save Integration Config
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Integrations;
