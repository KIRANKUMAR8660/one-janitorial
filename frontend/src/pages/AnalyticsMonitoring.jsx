import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Button
} from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axios from 'axios';

const AnalyticsMonitoring = () => {
  const { accessToken, role } = useSelector(state => state.auth);

  // States
  const [metrics, setMetrics] = useState({
    totalSizeBytes: 1048576,
    queriesCount: 24,
    errorsCount: 0,
    downloadsCount: 15,
    systemHealth: 'Healthy'
  });
  const [logs, setLogs] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/monitoring', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setMetrics(res.data.metrics);
      setLogs(res.data.logs || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system performance logs.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();

    // Setup Socket.io real-time connection
    socketRef.current = io();
    socketRef.current.on('realtime_analytics_metric', (data) => {
      // Append to live logs
      setLiveLogs(prev => [data, ...prev].slice(0, 50));
      // Re-fetch aggregate metrics on new events
      fetchMonitoringData();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [accessToken]);

  // Restrict check
  if (!['Super Admin', 'Admin', 'Manager'].includes(role)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Unauthorized Access: Monitoring metrics restricted to system administrators.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: '2px', backgroundColor: '#FFFFFF', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#517891', fontWeight: 'bold' }}>
          SYSTEM PERFORMANCE MONITORING PANEL
        </Typography>
        <Button size="small" variant="outlined" onClick={fetchMonitoringData} startIcon={<SyncAltIcon />}>
          Refresh Metrics
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ py: 0.25, fontSize: '11px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* KPI Dashboard */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <CloudUploadIcon sx={{ color: '#57B9FF', fontSize: 24, mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#517891' }}>
                  {(metrics.totalSizeBytes / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="caption" color="textSecondary">Total Datasets Size</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <QueryStatsIcon sx={{ color: '#57B9FF', fontSize: 24, mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#517891' }}>
                  {metrics.queriesCount} Queries
                </Typography>
                <Typography variant="caption" color="textSecondary">Aggregate Queries Run</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <SyncAltIcon sx={{ color: '#57B9FF', fontSize: 24, mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#517891' }}>
                  {metrics.downloadsCount} Exports
                </Typography>
                <Typography variant="caption" color="textSecondary">Downloads & Shares</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <ErrorOutlineIcon sx={{ color: metrics.errorsCount > 0 ? '#E53E3E' : '#10B981', fontSize: 24, mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: metrics.errorsCount > 0 ? '#E53E3E' : '#10B981' }}>
                  {metrics.systemHealth?.toUpperCase()}
                </Typography>
                <Typography variant="caption" color="textSecondary">Infrastructure Status</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* Live Socket Feed */}
            <Grid item xs={6}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 350, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891', mb: 1 }}>
                  Real-time WebSocket Logging Console
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    backgroundColor: '#0F172A',
                    color: '#38BDF8',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    p: 1,
                    borderRadius: '4px',
                    overflowY: 'auto',
                    maxHeight: 280
                  }}
                >
                  {liveLogs.length === 0 ? (
                    <div style={{ color: '#64748B' }}>Awaiting socket broadcast logging events... (upload files or query AI to see logs)</div>
                  ) : (
                    liveLogs.map((ll, idx) => (
                      <div key={idx} style={{ color: ll.status === 'Failed' ? '#EF4444' : '#38BDF8', marginBottom: '2px' }}>
                        [{new Date(ll.timestamp).toLocaleTimeString()}] [{ll.type.toUpperCase()}] status: {ll.status} - {JSON.stringify(ll.details)}
                      </div>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Audit Logs Table */}
            <Grid item xs={6}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', minHeight: 350 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#517891', mb: 1 }}>
                  System Analytics Jobs Audit
                </Typography>
                <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>Time</TableCell>
                        <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>User</TableCell>
                        <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ fontSize: '10px' }}>No audit records found.</TableCell>
                        </TableRow>
                      ) : (
                        logs.map(log => (
                          <TableRow key={log._id}>
                            <TableCell sx={{ fontSize: '9px' }}>{new Date(log.createdAt).toLocaleTimeString()}</TableCell>
                            <TableCell sx={{ fontSize: '9px', fontWeight: 'bold' }}>{log.type}</TableCell>
                            <TableCell sx={{ fontSize: '9px' }}>{log.user?.email?.split('@')[0] || 'System'}</TableCell>
                            <TableCell sx={{ fontSize: '9px', color: log.status === 'Success' ? 'green' : 'red', fontWeight: 'bold' }}>
                              {log.status}
                            </TableCell>
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
    </Box>
  );
};

export default AnalyticsMonitoring;
