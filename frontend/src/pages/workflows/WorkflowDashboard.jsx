import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const { accessToken } = useSelector(state => state.auth);
  
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executions, setExecutions] = useState([]);
  
  // Create New Dialog State
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch Workflows
  const fetchWorkflows = async () => {
    try {
      const res = await axios.get('/api/workflows', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setWorkflows(res.data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  };

  // Fetch Execution Runs
  const fetchExecutions = async () => {
    try {
      const res = await axios.get('/api/workflows/executions', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setExecutions(res.data);
    } catch (err) {
      console.error('Failed to load executions:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWorkflows(), fetchExecutions()]);
      setLoading(false);
    };
    loadData();
  }, [accessToken]);

  // Toggle active status
  const handleToggleActive = async (id, currentVal) => {
    try {
      await axios.put(`/api/workflows/${id}`, {
        isActive: !currentVal
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchWorkflows();
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  // Handle Create
  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await axios.post('/api/workflows', {
        name,
        description
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setOpenCreate(false);
      setName('');
      setDescription('');
      navigate(`/workflow/builder/${res.data._id}`);
    } catch (err) {
      console.error('Create workflow failed:', err);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await axios.delete(`/api/workflows/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchWorkflows();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Calculate high-level stats
  const totalRuns = executions.length;
  const completedRuns = executions.filter(e => e.status === 'Completed').length;
  const failedRuns = executions.filter(e => e.status === 'Failed').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;

  return (
    <Box>
      {/* Metrics Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #517891' }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Active Workflows</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                {workflows.filter(w => w.isActive).length} / {workflows.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #57B9FF' }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Total Executions</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 'bold' }}>{totalRuns}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #10B981' }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Success Rate</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 'bold', color: '#10B981' }}>{successRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #EF4444' }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Failed Runs</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 'bold', color: '#EF4444' }}>{failedRuns}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Header / Actions Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#517891' }}>Operational Workflow Automations</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ backgroundColor: '#57B9FF' }}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Workflows Table */}
      {loading ? (
        <LinearProgress color="secondary" />
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Nodes</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="center">Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">No workflows found. Click "Create Workflow" to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((flow) => (
                  <TableRow key={flow._id}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#517891' }}>{flow.name}</TableCell>
                    <TableCell>{flow.description || '-'}</TableCell>
                    <TableCell align="center">{flow.nodes?.length || 0}</TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={flow.isActive}
                        onChange={() => handleToggleActive(flow._id, flow.isActive)}
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">{new Date(flow.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/workflow/builder/${flow._id}`)} title="Edit Visual Builder">
                        <EditIcon fontSize="small" sx={{ color: '#517891' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(flow._id)} title="Delete">
                        <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#517891', color: '#fff', py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>Create New Workflow</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Workflow Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Short Description"
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button onClick={() => setOpenCreate(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" color="secondary" sx={{ backgroundColor: '#57B9FF' }} disabled={!name.trim()}>
            Create & Open Builder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowDashboard;
