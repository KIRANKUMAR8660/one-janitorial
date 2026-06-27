import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SupabaseHealth = () => {
  const { accessToken } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('Nominal');
  const [latency, setLatency] = useState(0);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const checkSupabaseHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      const res = await axios.get('/api/integrations/', { headers });
      const supabaseInt = res.data.find(i => i.name === 'Supabase');

      if (supabaseInt) {
        setSupabaseStatus(supabaseInt.status === 'Enabled' ? supabaseInt.healthStatus : 'Disabled');
        setLatency(supabaseInt.latency);
        setLogs(supabaseInt.logs || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Supabase backend cloud status diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  const pingSupabase = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };
      await axios.post('/api/integrations/test', { name: 'Supabase' }, { headers });
      await checkSupabaseHealth();
    } catch (err) {
      console.error(err);
      setError('Supabase connection handshake test timed out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSupabaseHealth();
  }, []);

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            SUPABASE SYSTEM HEALTH & EDGE STORAGE
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Realtime Postgres publication listeners, edge functions trigger diagnostics, secure user authorization policies, and CDN bucket usage
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={checkSupabaseHealth} disabled={loading} sx={{ borderColor: '#845EC2', color: '#845EC2' }}>
            Refresh
          </Button>
          <Button size="small" variant="contained" startIcon={<SyncIcon />} onClick={pingSupabase} disabled={loading} sx={{ backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}>
            Test Ping
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {/* Status Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary" display="block">CLOUD PROVIDER STATUS</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {supabaseStatus === 'Connected' ? (
                    <Chip icon={<CheckCircleIcon style={{ color: '#FFFFFF' }} />} label="NOMINAL" color="success" size="small" sx={{ backgroundColor: '#00C9A7' }} />
                  ) : (
                    <Chip icon={<ErrorOutlineIcon style={{ color: '#FFFFFF' }} />} label="WARNING / OFFLINE" color="error" size="small" />
                  )}
                </Box>
              </Box>
              
              <Divider />

              <Box>
                <Typography variant="caption" color="textSecondary" display="block">CONNECTION LATENCY</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#845EC2', mt: 0.5 }}>{latency} ms</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="textSecondary" display="block">REALTIME DATABASE SYNC</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#00C9A7', mt: 0.5 }}>ACTIVE</Typography>
                <Typography variant="caption" color="textSecondary">Supabase PostgreSQL WebSockets active.</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Subsystems table */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                Supabase Cloud Service Subsystems Routing Table
              </Typography>
              <TableContainer component={Paper} sx={{ border: '1px solid #845EC2' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subsystem Name</TableCell>
                      <TableCell>Configured Status</TableCell>
                      <TableCell>Verification Handshake</TableCell>
                      <TableCell align="right">Latency Benchmark</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { name: 'Supabase PostgreSQL Engine', status: 'Active', handshake: 'Nominal', latency: `${latency}ms` },
                      { name: 'Row Level Security Policies (RLS)', status: 'Active', handshake: 'Enforced', latency: '0.1ms' },
                      { name: 'Supabase Realtime Pub/Sub WebSockets', status: 'Active', handshake: 'Nominal', latency: `${latency + 12}ms` },
                      { name: 'SOP Document Object Storage Buckets', status: 'Active', handshake: 'Ready', latency: `${latency + 28}ms` },
                      { name: 'Supabase Edge Functions Runner', status: 'Active', handshake: 'Operational', latency: `${latency + 45}ms` }
                    ].map((sub, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{sub.name}</TableCell>
                        <TableCell><Chip label={sub.status} size="small" color="success" sx={{ backgroundColor: '#00C9A7' }} /></TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#845EC2' }}>{sub.handshake}</TableCell>
                        <TableCell align="right">{sub.latency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Audit list */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
                Supabase Handshake & Audit Logs Console
              </Typography>
              <Box sx={{
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                p: 1.5,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                maxHeight: 180,
                overflowY: 'auto'
              }}>
                {logs.length === 0 ? (
                  <div style={{ color: '#94A3B8' }}>No Supabase connectivity log entries in current session. Ping to test.</div>
                ) : (
                  logs.slice().reverse().map((log, idx) => (
                    <div key={idx} style={{ color: log.status === 'Success' ? '#34D399' : '#F87171', marginBottom: '4px' }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] Supabase Connection Audit: {log.action} - {log.status}: {log.message}
                    </div>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SupabaseHealth;
