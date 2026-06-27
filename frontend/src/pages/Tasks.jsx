import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import axios from 'axios';

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector(state => state.app);

  const [activeTab, setActiveTab] = useState(0); // 0 = Board, 1 = Table, 2 = Calendar
  const [openAdd, setOpenAdd] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      await axios.post('/api/tasks', { title, description, priority, dueDate: dueDate || undefined });
      setOpenAdd(false);
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      dispatch(fetchTasks());
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      dispatch(fetchTasks());
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleBulkUpdateStatus = async (ids, newStatus) => {
    try {
      await Promise.all(ids.map(id => axios.put(`/api/tasks/${id}`, { status: newStatus })));
      dispatch(fetchTasks());
      alert(`Bulk updated ${ids.length} task(s) status to ${newStatus}`);
    } catch (err) {
      alert('Error bulk updating tasks: ' + err.message);
    }
  };

  const boardColumns = ['Todo', 'In Progress', 'Review', 'Done'];

  // Table Columns Definition
  const columns = [
    { id: 'title', label: 'Task Name', sortable: true },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Todo', 'In Progress', 'Review', 'Done'],
      render: (row) => (
        <Select
          size="small"
          value={row.status}
          onChange={(e) => handleUpdateStatus(row._id, e.target.value)}
          sx={{ fontSize: '0.75rem', height: 26, borderRadius: '4px', minWidth: 110 }}
        >
          {boardColumns.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>{s}</MenuItem>)}
        </Select>
      )
    },
    { 
      id: 'priority', 
      label: 'Priority', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Low', 'Medium', 'High', 'Urgent'],
      render: (row) => {
        const color = row.priority === 'High' || row.priority === 'Urgent' ? 'error' : 'secondary';
        return <Chip label={row.priority} size="small" color={color} sx={{ borderRadius: '4px', fontSize: '0.7rem' }} />;
      }
    },
    { 
      id: 'dueDate', 
      label: 'Due Date', 
      sortable: true,
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A'
    },
    { 
      id: 'createdBy', 
      label: 'Created By', 
      render: (row) => row.createdBy?.email || 'N/A'
    }
  ];

  // Bulk Actions for Tasks
  const bulkActions = [
    { label: 'Set Done', action: (ids) => handleBulkUpdateStatus(ids, 'Done') },
    { label: 'Set In Progress', action: (ids) => handleBulkUpdateStatus(ids, 'In Progress') },
    { label: 'Set Review', action: (ids) => handleBulkUpdateStatus(ids, 'Review') }
  ];

  return (
    <Box sx={{ p: '2px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '32px', fontWeight: 600, color: '#517891', lineHeight: 1.2 }}>
            STAFF TASK OPERATIONS
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#4B5563', mt: 0.5 }}>
            Coordinate cleaning runs, inspections, and client follow-ups
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>
          Create New Task
        </Button>
      </Box>

      {/* Tabs selector */}
      <Tabs 
        value={activeTab} 
        onChange={(e, val) => setActiveTab(val)} 
        sx={{ mb: 2, borderBottom: '1px solid #E5E7EB' }}
      >
        <Tab label="Board View" />
        <Tab label="Table View" />
        <Tab label="Calendar View" />
      </Tabs>

      {/* 1. BOARD VIEW */}
      {activeTab === 0 && (
        <Grid container spacing={1.5}>
          {boardColumns.map((col) => (
            <Grid item xs={12} sm={6} md={3} key={col}>
              <Box sx={{ backgroundColor: '#FFFFFF', p: '2px', minHeight: 460, borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1, textAlign: 'center', backgroundColor: '#517891', color: '#FFFFFF', py: '6px', borderRadius: '4px 4px 0 0' }}>
                  {col.toUpperCase()}
                </Typography>
                <Box sx={{ p: '8px' }}>
                  {tasks.filter(t => t.status === col).map((task) => (
                    <Card key={task._id} sx={{ mb: 1, border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FFFFFF' }}>
                      <CardContent sx={{ p: '12px !important' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{task.title}</Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: '0.75rem', mt: 0.5, display: 'block', mb: 1.5 }}>{task.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={task.priority} size="small" color={task.priority === 'High' || task.priority === 'Urgent' ? 'error' : 'secondary'} sx={{ borderRadius: '4px', fontSize: '0.65rem' }} />
                          <Select
                            size="small"
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                            sx={{ fontSize: '0.65rem', height: 24, borderRadius: '4px' }}
                          >
                            {boardColumns.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.7rem' }}>{s}</MenuItem>)}
                          </Select>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 2. TABLE VIEW */}
      {activeTab === 1 && (
        <EnterpriseTable
          data={tasks}
          columns={columns}
          searchPlaceholder="Search task name, description..."
          bulkActions={bulkActions}
          exportFilename="tasks_list"
          rowKey="_id"
        />
      )}

      {/* 3. CALENDAR VIEW */}
      {activeTab === 2 && (
        <Card sx={{ p: '2px', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
          <CardContent sx={{ p: '12px !important' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#517891' }}>
              MONTHLY CALENDAR SCHEDULES
            </Typography>
            <TableContainer sx={{ width: '100%', maxWidth: 700, margin: 'auto', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scheduled Tasks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const date = new Date();
                    date.setDate(date.getDate() + idx);
                    const daysTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString());
                    return (
                      <TableRow key={idx} sx={{ height: 36 }}>
                        <TableCell sx={{ fontWeight: 600 }}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</TableCell>
                        <TableCell>
                          {daysTasks.length === 0 ? (
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>No tasks scheduled</Typography>
                          ) : daysTasks.map(t => (
                            <Chip key={t._id} label={t.title} size="small" sx={{ mr: 0.5, borderRadius: '4px', fontSize: '0.7rem' }} />
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle sx={{ fontWeight: 600, color: '#517891', fontSize: '20px' }}>Create Operations Task</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <TextField
            label="Task Title"
            fullWidth
            size="small"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            margin="normal"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth size="small" margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              {['Low', 'Medium', 'High', 'Urgent'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            size="small"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdd(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleCreate} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
