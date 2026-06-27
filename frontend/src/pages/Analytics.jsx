import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Analytics = () => {
  const { accessToken, role } = useSelector(state => state.auth);

  // Core states
  const [activeTab, setActiveTab] = useState(0);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Upload Center States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 2. Data Prep States
  const [prepOps, setPrepOps] = useState([]);
  const [renameOldName, setRenameOldName] = useState('');
  const [renameNewName, setRenameNewName] = useState('');
  const [typecastCol, setTypecastCol] = useState('');
  const [typecastTarget, setTypecastTarget] = useState('Number');

  // 3. Stats States
  const [statsData, setStatsData] = useState(null);

  // 4. Advanced Analytics States
  const [advancedType, setAdvancedType] = useState('forecast');
  const [advancedHorizon, setAdvancedHorizon] = useState('6');
  const [advancedY, setAdvancedY] = useState('');
  const [advancedX, setAdvancedX] = useState('');
  const [advancedResult, setAdvancedResult] = useState(null);

  // 5. Dashboard Builder States
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [newDashTitle, setNewDashTitle] = useState('');
  const [widgetType, setWidgetType] = useState('KPI Card');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetCol, setWidgetCol] = useState('');

  // 6. AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiChart, setAiChart] = useState(null);

  // 7. Sharing & Scheduling States
  const [shareType, setShareType] = useState('Public');
  const [sharePassword, setSharePassword] = useState('');
  const [shareExpiry, setShareExpiry] = useState('7');
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState('Daily');
  const [scheduleChannel, setScheduleChannel] = useState('Email');
  const [scheduleConfig, setScheduleConfig] = useState('');

  // Load datasets and dashboards
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/datasets', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDataset) {
        setSelectedDataset(res.data[0]);
      }

      const dashRes = await axios.get('/api/analytics/dashboards', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setDashboards(dashRes.data);
      if (dashRes.data.length > 0 && !selectedDashboard) {
        setSelectedDashboard(dashRes.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics datasets or dashboards.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  // Load stats when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      fetchStats(selectedDataset._id);
    }
  }, [selectedDataset]);

  const fetchStats = async (id) => {
    try {
      const res = await axios.get(`/api/analytics/stats/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStatsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);

    const formData = new FormData();
    formData.append('file', file);
    try {
      setIsUploading(true);
      setError(null);
      const res = await axios.post('/api/analytics/upload', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Dataset uploaded and auto schema detection complete.');
      setUploadPreview(res.data.preview || []);
      fetchData();
      setIsUploading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  // Data Clean operation handler
  const addPrepOp = (type, params) => {
    setPrepOps([...prepOps, { type, params }]);
  };

  const applyPrep = async () => {
    if (!selectedDataset) return;
    try {
      setLoading(true);
      await axios.post('/api/analytics/prepare', {
        datasetId: selectedDataset._id,
        operations: prepOps
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess('Applied cleaning operations and updated dataset metadata schemas.');
      setPrepOps([]);
      fetchData();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to run data cleaning operations pipeline.');
      setLoading(false);
    }
  };

  // Run Advanced analytics models
  const executeAdvanced = async () => {
    if (!selectedDataset) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/analytics/advanced', {
        datasetId: selectedDataset._id,
        type: advancedType,
        params: {
          horizon: advancedHorizon,
          targetY: advancedY,
          predictorX: advancedX
        }
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAdvancedResult(res.data.result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Advanced calculation failure.');
      setLoading(false);
    }
  };

  // AI assistant
  const runAiQuery = async () => {
    if (!aiPrompt) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/analytics/ai-query', {
        prompt: aiPrompt,
        datasetId: selectedDataset?._id
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAiReply(res.data.reply);
      setAiRecommendations(res.data.recommendations || []);
      setAiChart(res.data.chartSuggestion || null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('AI request timed out.');
      setLoading(false);
    }
  };

  // Share report
  const createShareLink = async () => {
    if (!selectedDashboard) return;
    try {
      const res = await axios.post('/api/analytics/share', {
        dashboardId: selectedDashboard._id,
        shareType,
        password: sharePassword,
        expiryDays: shareExpiry
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setGeneratedShareUrl(res.data.shareUrl);
      setSuccess('Share URL published.');
    } catch (err) {
      console.error(err);
      setError('Failed to publish link.');
    }
  };

  // Schedule report
  const handleScheduleSubmit = async () => {
    if (!selectedDashboard) return;
    try {
      await axios.post('/api/analytics/schedule', {
        name: scheduleName,
        dashboardId: selectedDashboard._id,
        frequency: scheduleFreq,
        deliveryChannels: [{ type: scheduleChannel, config: { target: scheduleConfig } }]
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess('Job scheduled.');
      setScheduleName('');
      setScheduleConfig('');
    } catch (err) {
      console.error(err);
      setError('Schedule failed.');
    }
  };

  // Add Widget
  const addWidgetToDashboard = async () => {
    if (!selectedDashboard) return;
    const newWidget = {
      id: Math.random().toString(36).substring(7),
      type: widgetType,
      title: widgetTitle || `Widget ${widgetType}`,
      datasetId: selectedDataset?._id,
      config: { column: widgetCol },
      layout: { x: 0, y: 0, w: 4, h: 3 }
    };
    try {
      const updatedWidgets = [...(selectedDashboard.widgets || []), newWidget];
      const res = await axios.put(`/api/analytics/dashboards/${selectedDashboard._id}/widgets`, {
        widgets: updatedWidgets
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSelectedDashboard(res.data);
      setWidgetTitle('');
      setWidgetCol('');
      setSuccess('Widget added to dashboard layout.');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to add widget.');
    }
  };

  // Create Dashboard
  const handleCreateDashboard = async () => {
    if (!newDashTitle) return;
    try {
      const res = await axios.post('/api/analytics/dashboards', {
        title: newDashTitle
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess(`Dashboard "${newDashTitle}" created.`);
      setNewDashTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to create dashboard.');
    }
  };

  return (
    <Box sx={{ p: '2px', backgroundColor: '#FFFFFF', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#517891', fontWeight: 'bold' }}>
          ENTERPRISE DATA ANALYTICS CENTER
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Role Level: {role}
        </Typography>
      </Box>

      {/* Tabs list */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid #E5E7EB',
          minHeight: '34px',
          '& .MuiTab-root': {
            minHeight: '34px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'none',
            color: '#333333',
            '&.Mui-selected': { color: '#57B9FF' }
          },
          '& .MuiTabs-indicator': { backgroundColor: '#57B9FF' }
        }}
      >
        <Tab label="1. Datasets Catalog" />
        <Tab label="2. Upload Center" />
        <Tab label="3. Data Preparation Studio" />
        <Tab label="4. Descriptive Analytics" />
        <Tab label="5. Advanced Analytics" />
        <Tab label="6. Dashboard Builder" />
        <Tab label="7. AI Assistant" />
        <Tab label="8. Scheduled Sharing" />
      </Tabs>

      {/* Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ py: 0.25, fontSize: '11px' }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ py: 0.25, fontSize: '11px' }}>{success}</Alert>}

      {/* Content wrapper */}
      <Box sx={{ flexGrow: 1, mt: 0.5 }}>
        
        {/* TAB 0: Datasets Catalog */}
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Paper sx={{ p: 1, border: '1px solid #E5E7EB', minHeight: 400 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Datasets Registry</Typography>
                <List dense>
                  {datasets.map(d => (
                    <ListItem
                      button
                      key={d._id}
                      selected={selectedDataset?._id === d._id}
                      onClick={() => setSelectedDataset(d)}
                      sx={{
                        borderRadius: '4px',
                        '&.Mui-selected': { backgroundColor: '#57B9FF', color: '#FFFFFF', '&:hover': { backgroundColor: '#0090C8' } }
                      }}
                    >
                      <ListItemText
                        primary={d.name}
                        secondary={`${d.sourceType} | ${d.rowCount} Rows | ${(d.sizeBytes / 1024).toFixed(1)} KB`}
                        primaryTypographyProps={{ fontSize: '12px', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ fontSize: '9px', color: selectedDataset?._id === d._id ? '#FFFFFF' : '#6B7280' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={9}>
              {selectedDataset ? (
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ color: '#517891', fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
                    Dataset: {selectedDataset.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 1.5 }}>
                    Source: {selectedDataset.sourceType} | Path: {selectedDataset.filePath} | Version: v{selectedDataset.version}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891', mb: 1 }}>Column Metadata Schema</Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {selectedDataset.columns?.map(c => (
                      <Grid item xs={3} key={c.name}>
                        <Box sx={{ background: '#F3F4F6', p: 0.5, borderRadius: '4px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', fontSize: '10px' }}>{c.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#57B9FF', fontSize: '9px' }}>{c.type}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891', mb: 1 }}>Data Lineage History</Typography>
                  <Box sx={{ p: 1, backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                    {selectedDataset.lineage?.steps?.map((step, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#57B9FF' }}>Step {idx + 1}:</Typography>
                        <Typography variant="caption" sx={{ color: '#333333' }}>{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                  <Typography color="textSecondary">Select a dataset from the registry to view metadata.</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}

        {/* TAB 1: Upload Center */}
        {activeTab === 1 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Dataset Upload Center</Typography>
            <Box
              sx={{
                border: '2px dashed #57B9FF',
                borderRadius: '8px',
                p: 4,
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                mb: 2,
                '&:hover': { backgroundColor: '#F0F9FF' }
              }}
            >
              <input
                accept=".csv,.json,.xml,.txt"
                id="dataset-upload-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="dataset-upload-input" style={{ cursor: 'pointer' }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: '#57B9FF', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#517891' }}>
                  Drag & Drop Files Here
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                  Supports CSV, Excel (converted to CSV), JSON, XML, TXT (Max size 10MB)
                </Typography>
              </label>
            </Box>

            {isUploading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                <CircularProgress color="secondary" size={24} />
                <Typography variant="caption" sx={{ ml: 1 }}>Running auto-schema scanner & column type detector...</Typography>
              </Box>
            )}

            {uploadPreview.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Dataset Preview Grid (First 5 Rows)</Typography>
                <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#517891' }}>
                      <TableRow>
                        {Object.keys(uploadPreview[0] || {}).map(key => (
                          <TableCell key={key} sx={{ color: '#FFFFFF', fontSize: '10px', fontWeight: 'bold' }}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uploadPreview.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((val, cellIdx) => (
                            <TableCell key={cellIdx} sx={{ fontSize: '9px' }}>{String(val)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        )}

        {/* TAB 2: Data Preparation Studio */}
        {activeTab === 2 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Data Preparation Studio</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ p: 1, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#517891' }}>1. Column Rename Operation</Typography>
                  <TextField size="small" label="Old Column Name" value={renameOldName} onChange={(e) => setRenameOldName(e.target.value)} fullWidth />
                  <TextField size="small" label="New Column Name" value={renameNewName} onChange={(e) => setRenameNewName(e.target.value)} fullWidth />
                  <Button size="small" variant="outlined" onClick={() => { addPrepOp('rename', { oldName: renameOldName, newName: renameNewName }); setRenameOldName(''); setRenameNewName(''); }}>
                    Add Rename
                  </Button>

                  <Divider sx={{ my: 0.5 }} />

                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#517891' }}>2. Data Type Conversion</Typography>
                  <TextField size="small" label="Column Name" value={typecastCol} onChange={(e) => setTypecastCol(e.target.value)} fullWidth />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Target Type</InputLabel>
                    <Select value={typecastTarget} label="Target Type" onChange={(e) => setTypecastTarget(e.target.value)}>
                      <MenuItem value="Number">Number</MenuItem>
                      <MenuItem value="String">String</MenuItem>
                      <MenuItem value="Date">Date</MenuItem>
                      <MenuItem value="Boolean">Boolean</MenuItem>
                    </Select>
                  </FormControl>
                  <Button size="small" variant="outlined" onClick={() => { addPrepOp('typecast', { columnName: typecastCol, targetType: typecastTarget }); setTypecastCol(''); }}>
                    Add Typecast
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={8}>
                <Paper sx={{ p: 1, border: '1px solid #E5E7EB', minHeight: 300, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#517891', mb: 1, display: 'block' }}>
                      Operations Pipeline Queue
                    </Typography>
                    {prepOps.length === 0 ? (
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>No operations enqueued.</Typography>
                    ) : (
                      <List dense>
                        {prepOps.map((op, idx) => (
                          <ListItem key={idx} secondaryAction={
                            <IconButton edge="end" size="small" onClick={() => setPrepOps(prepOps.filter((_, oIdx) => oIdx !== idx))}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          }>
                            <ListItemText primary={`[${op.type.toUpperCase()}] parameters: ${JSON.stringify(op.params)}`} primaryTypographyProps={{ fontSize: '10px' }} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button size="small" variant="outlined" color="error" onClick={() => setPrepOps([])}>Clear All</Button>
                    <Button size="small" variant="contained" onClick={applyPrep}>Run Prep Pipeline</Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 3: Descriptive Analytics */}
        {activeTab === 3 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Descriptive Analytics Panel</Typography>
            {statsData ? (
              <Box>
                <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#517891' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Field Name</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Count</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Mean / Top Value</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Median / Unique</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Min</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Max</TableCell>
                        <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '10px' }}>Std Dev</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(statsData.statistics || {}).map(([key, stat]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontSize: '10px', fontWeight: 'bold' }}>{key}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.count}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.mean || stat.topValue || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.median || stat.uniqueCount || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.min !== undefined ? stat.min : 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.max !== undefined ? stat.max : 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '10px' }}>{stat.stdDev !== undefined ? stat.stdDev.toFixed(2) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#517891', mb: 1, display: 'block' }}>Correlation Matrix Index</Typography>
                <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>Variable</TableCell>
                        {Object.keys(statsData.correlationMatrix || {}).map(key => (
                          <TableCell key={key} sx={{ fontSize: '9px', fontWeight: 'bold' }}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(statsData.correlationMatrix || {}).map(([rowKey, rowVal]) => (
                        <TableRow key={rowKey}>
                          <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>{rowKey}</TableCell>
                          {Object.values(rowVal).map((val, cellIdx) => (
                            <TableCell key={cellIdx} sx={{ fontSize: '9px', color: val < 0 ? '#E53E3E' : val > 0.5 ? '#57B9FF' : '#333333', fontWeight: val > 0.5 ? 'bold' : 'normal' }}>
                              {val}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="textSecondary">Upload a dataset first to generate automated calculations.</Typography>
            )}
          </Paper>
        )}

        {/* TAB 4: Advanced Analytics */}
        {activeTab === 4 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Advanced Analytics Pipeline</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Analytics Model</InputLabel>
                    <Select value={advancedType} label="Analytics Model" onChange={(e) => setAdvancedType(e.target.value)}>
                      <MenuItem value="forecast">Trend & ARIMA Time Series Forecasting</MenuItem>
                      <MenuItem value="regression">Linear Regression Modeling</MenuItem>
                      <MenuItem value="cohort">Cohort Retention Analysis</MenuItem>
                      <MenuItem value="segmentation">K-Means Customer Segmentation</MenuItem>
                      <MenuItem value="anomaly">Isolation Forest Anomaly Detection</MenuItem>
                    </Select>
                  </FormControl>

                  {advancedType === 'forecast' && (
                    <TextField size="small" label="Forecast Period Horizon" value={advancedHorizon} onChange={(e) => setAdvancedHorizon(e.target.value)} fullWidth />
                  )}

                  {advancedType === 'regression' && (
                    <>
                      <TextField size="small" label="Dependent Variable Y" value={advancedY} onChange={(e) => setAdvancedY(e.target.value)} fullWidth />
                      <TextField size="small" label="Predictor Variable X" value={advancedX} onChange={(e) => setAdvancedX(e.target.value)} fullWidth />
                    </>
                  )}

                  <Button size="small" variant="contained" onClick={executeAdvanced} fullWidth>
                    Execute Analytics Run
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={8}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 300 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#517891', display: 'block', mb: 1 }}>
                    Calculation Outputs
                  </Typography>
                  
                  {advancedResult ? (
                    <Box sx={{ p: 1, backgroundColor: '#0F172A', color: '#38BDF8', fontFamily: 'monospace', fontSize: '11px', borderRadius: '4px' }}>
                      <pre>{JSON.stringify(advancedResult, null, 2)}</pre>
                    </Box>
                  ) : (
                    <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>Trigger an analytics calculation run to view model details.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 5: Dashboard Builder */}
        {activeTab === 5 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Custom Dashboard Builder</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Paper sx={{ p: 1, border: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 1 }}>
                    1. Create New Dashboard Layout
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" placeholder="Dashboard Title" value={newDashTitle} onChange={(e) => setNewDashTitle(e.target.value)} />
                    <Button size="small" variant="contained" onClick={handleCreateDashboard}>Create</Button>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 1 }}>
                    2. Select Active Dashboard
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Active Dashboard</InputLabel>
                    <Select value={selectedDashboard?._id || ''} label="Active Dashboard" onChange={(e) => setSelectedDashboard(dashboards.find(d => d._id === e.target.value))}>
                      {dashboards.map(d => (
                        <MenuItem key={d._id} value={d._id}>{d.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedDashboard && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 1 }}>
                        3. Add Widget Component
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Widget Type</InputLabel>
                          <Select value={widgetType} label="Widget Type" onChange={(e) => setWidgetType(e.target.value)}>
                            <MenuItem value="KPI Card">KPI Card</MenuItem>
                            <MenuItem value="Line Chart">Line Chart</MenuItem>
                            <MenuItem value="Bar Chart">Bar Chart</MenuItem>
                            <MenuItem value="Pie Chart">Pie Chart</MenuItem>
                            <MenuItem value="Gauge">Gauge Meter</MenuItem>
                            <MenuItem value="Pivot Table">Pivot Table</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField size="small" label="Widget Title" value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} />
                        <TextField size="small" label="Target Field Key" value={widgetCol} onChange={(e) => setWidgetCol(e.target.value)} />
                        <Button size="small" variant="outlined" onClick={addWidgetToDashboard}>Add Widget</Button>
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={8}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 400, backgroundColor: '#FAFAFA' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#517891' }}>
                    Dashboard Grid Layout: {selectedDashboard?.title || 'None Selected'}
                  </Typography>

                  {selectedDashboard?.widgets?.length === 0 ? (
                    <Typography color="textSecondary" sx={{ py: 6, textAlign: 'center' }}>Dashboard is empty. Use the builder on the left to add widget cards.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {selectedDashboard?.widgets?.map(widget => (
                        <Grid item xs={6} key={widget.id}>
                          <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 120 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#517891' }}>{widget.title}</Typography>
                              <Typography variant="caption" sx={{ color: '#57B9FF', fontSize: '9px', fontWeight: 'bold' }}>{widget.type}</Typography>
                            </Box>
                            <Divider sx={{ my: 0.5 }} />
                            {widget.type === 'KPI Card' ? (
                              <Box sx={{ textAlign: 'center', py: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#517891' }}>436.5</Typography>
                                <Typography variant="caption" color="textSecondary">Aggregation target: {widget.config?.column || 'value'}</Typography>
                              </Box>
                            ) : (
                              <Box sx={{ py: 1, textAlign: 'center', background: '#F3F4F6', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChartIcon sx={{ color: '#57B9FF', mr: 0.5 }} />
                                <Typography variant="caption" color="textSecondary">Renders visual: {widget.type}</Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 6: AI Assistant */}
        {activeTab === 6 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>AI Analytics conversational Assistant</Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 350 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block', color: '#517891' }}>Ask Questions About Dataset</Typography>
                  <TextField
                    multiline
                    rows={4}
                    placeholder='Type your question (e.g. "Why did revenue drop last month?" or "Which sales reps are underperforming?")'
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button size="small" variant="contained" onClick={runAiQuery} startIcon={<AutoAwesomeIcon />} fullWidth>
                    Consult AI Intelligence Engine
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={7}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 350, backgroundColor: '#F8FAFC' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: '#517891' }}>AI Responses & Recommendations</Typography>
                  {aiReply ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ p: 1, background: '#E0F2FE', borderRadius: '4px', borderLeft: '4px solid #57B9FF' }}>
                        <Typography variant="body2" sx={{ color: '#0369A1', fontSize: '12px' }}>{aiReply}</Typography>
                      </Box>
                      
                      {aiRecommendations.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 0.5 }}>Suggested Actions:</Typography>
                          <List dense sx={{ py: 0 }}>
                            {aiRecommendations.map((rec, idx) => (
                              <ListItem key={idx} sx={{ px: 0, py: 0.25 }}>
                                <ArrowForwardIcon sx={{ fontSize: 12, mr: 1, color: '#57B9FF' }} />
                                <ListItemText primary={rec} primaryTypographyProps={{ fontSize: '11px' }} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {aiChart && (
                        <Box sx={{ mt: 1, p: 1, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 0.5 }}>Recommended Visualization: {aiChart.type}</Typography>
                          <Box sx={{ py: 1, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                            <QueryStatsIcon sx={{ color: '#57B9FF', mr: 1 }} />
                            <Typography variant="caption" color="textSecondary">Grounded analytics chart suggestion rendered successfully.</Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography color="textSecondary" sx={{ py: 6, textAlign: 'center' }}>Consult the AI agent above to identify anomalies, risk flags, and forecasts.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 7: Sharing & Scheduling */}
        {activeTab === 7 && (
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', minHeight: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#517891' }}>Scheduled Reports & Secure Sharing</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 300 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 1 }}>
                    1. Secure Dashboard Link Sharing
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Sharing Strategy</InputLabel>
                      <Select value={shareType} label="Sharing Strategy" onChange={(e) => setShareType(e.target.value)}>
                        <MenuItem value="Public">Public Link (URL Access)</MenuItem>
                        <MenuItem value="Private">Private Link (Role restricted)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField size="small" type="password" label="Access Password Hash (Optional)" value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} fullWidth />
                    <TextField size="small" label="Expiration Horizon (Days)" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} fullWidth />
                    <Button size="small" variant="contained" onClick={createShareLink} startIcon={<ShareIcon />}>Publish Secure Share URL</Button>

                    {generatedShareUrl && (
                      <Box sx={{ mt: 1, p: 1, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '4px', wordBreak: 'break-all' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#57B9FF' }}>Generated Link:</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#333' }}>{generatedShareUrl}</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 300 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#517891', mb: 1 }}>
                    2. Automated Report Scheduling
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField size="small" label="Schedule Task Name" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} fullWidth />
                    
                    <FormControl size="small" fullWidth>
                      <InputLabel>Execution Frequency</InputLabel>
                      <Select value={scheduleFreq} label="Execution Frequency" onChange={(e) => setScheduleFreq(e.target.value)}>
                        <MenuItem value="Daily">Daily Run</MenuItem>
                        <MenuItem value="Weekly">Weekly Run</MenuItem>
                        <MenuItem value="Monthly">Monthly Run</MenuItem>
                        <MenuItem value="Quarterly">Quarterly Run</MenuItem>
                        <MenuItem value="Yearly">Yearly Run</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Delivery Channel</InputLabel>
                      <Select value={scheduleChannel} label="Delivery Channel" onChange={(e) => setScheduleChannel(e.target.value)}>
                        <MenuItem value="Email">Email Dispatcher</MenuItem>
                        <MenuItem value="Slack">Slack Notification Channel</MenuItem>
                        <MenuItem value="Teams">Microsoft Teams Channels</MenuItem>
                        <MenuItem value="Google Drive">Google Drive Cloud Ingestion</MenuItem>
                        <MenuItem value="SharePoint">SharePoint Directory Ingestion</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField size="small" label="Channel Configuration (Email/Webhook/Folder)" value={scheduleConfig} onChange={(e) => setScheduleConfig(e.target.value)} fullWidth />
                    <Button size="small" variant="contained" onClick={handleScheduleSubmit} startIcon={<ScheduleSendIcon />}>Schedule Automation Delivery</Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

      </Box>
    </Box>
  );
};

export default Analytics;
