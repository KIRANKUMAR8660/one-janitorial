import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import axios from 'axios';
import { useSelector } from 'react-redux';

const APICommunication = () => {
  const { accessToken } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [error, setError] = useState(null);

  const fetchAPIStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [intRes, healthRes] = await Promise.all([
        axios.get('/api/integrations/', { headers }),
        axios.get('/api/integrations/health', { headers })
      ]);

      setIntegrations(intRes.data || []);
      setHealthMetrics(healthRes.data || null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch global API communication logs.');
    } finally {
      setLoading(false);
    }
  };

  const pingAllAPI = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };
      // Ping some primary API services
      await Promise.all([
        axios.post('/api/integrations/test', { name: 'OpenAI' }, { headers }),
        axios.post('/api/integrations/test', { name: 'HubSpot' }, { headers }),
        axios.post('/api/integrations/test', { name: 'Supabase' }, { headers })
      ]);
      await fetchAPIStatus();
    } catch (err) {
      console.error(err);
      setError('Ping tests timed out for several services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPIStatus();
  }, []);

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            API COMMUNICATION & CONNECTIONS STATUS
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Global connection score metrics, third-party error rates, retry attempts tracking, and latency diagnostics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAPIStatus} disabled={loading} sx={{ borderColor: '#845EC2', color: '#845EC2' }}>
            Refresh Status
          </Button>
          <Button size="small" variant="contained" startIcon={<SyncIcon />} onClick={pingAllAPI} disabled={loading} sx={{ backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}>
            Ping Core Channels
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {/* Connection Scorecard */}
          {healthMetrics && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'center', justifyContent: 'center', minHeight: 240 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                  GLOBAL CONNECTIONS SCORE
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: healthMetrics.healthScore >= 90 ? '#00C9A7' : '#845EC2' }}>
                  {healthMetrics.healthScore} / 100
                </Typography>
                <Box sx={{ px: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={healthMetrics.healthScore} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: '#F3C5FF',
                      '& .MuiLinearProgress-bar': { backgroundColor: healthMetrics.healthScore >= 90 ? '#00C9A7' : '#845EC2' }
                    }} 
                  />
                </Box>
                <Grid container spacing={1} sx={{ mt: 1, fontSize: '11px' }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">Connected Services</Typography>
                    <strong>{healthMetrics.activeIntegrationsCount} / {healthMetrics.totalIntegrationsCount}</strong>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">Average Latency</Typography>
                    <strong>{healthMetrics.avgLatency} ms</strong>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Connection Center Table */}
          <Grid item xs={12} md={healthMetrics ? 8 : 12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                Integration Port Routing & Health Status
              </Typography>
              <TableContainer component={Paper} sx={{ border: '1px solid #845EC2', maxHeight: 350 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Integration Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Latency Ping</TableCell>
                      <TableCell align="right">Error Rate</TableCell>
                      <TableCell align="right">Last Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {integrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No APIs currently catalogued.</TableCell>
                      </TableRow>
                    ) : (
                      integrations.map(int => (
                        <TableRow key={int._id}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{int.name}</TableCell>
                          <TableCell>{int.category}</TableCell>
                          <TableCell>
                            <Chip 
                              label={int.healthStatus} 
                              size="small" 
                              sx={{ 
                                backgroundColor: int.healthStatus === 'Connected' ? '#00C9A7' : int.healthStatus === 'Error' ? '#EF4444' : '#6B7280',
                                color: '#FFFFFF',
                                fontWeight: 'bold'
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">{int.status === 'Enabled' ? `${int.latency}ms` : 'N/A'}</TableCell>
                          <TableCell align="right" sx={{ color: int.errorRate > 0 ? '#EF4444' : 'inherit', fontWeight: 'bold' }}>
                            {int.errorRate}%
                          </TableCell>
                          <TableCell align="right">{int.lastSuccessfulRequest ? new Date(int.lastSuccessfulRequest).toLocaleTimeString() : 'Never'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default APICommunication;
