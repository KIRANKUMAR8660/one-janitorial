import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, TextField, Divider, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceRecords, fetchEmployees } from '../store/index.js';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';

const Performance = () => {
  const dispatch = useDispatch();
  const { performanceRecords, employees } = useSelector(state => state.app);

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [topic, setTopic] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [actionItems, setActionItems] = useState('');

  useEffect(() => {
    dispatch(fetchPerformanceRecords());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Keep selected employee reference fresh when records update
  useEffect(() => {
    if (selectedEmp && employees.length > 0) {
      const updated = employees.find(e => e._id === selectedEmp._id);
      if (updated) {
        setSelectedEmp(updated);
      }
    }
  }, [employees]);

  const handleLogCoaching = async () => {
    if (!selectedEmp || !topic || !discussionNotes) return;
    try {
      await axios.post(`/api/performance/coaching/${selectedEmp._id}`, {
        topic,
        discussionNotes,
        actionItems,
        expectations: [
          { metricName: 'Clean Rate Accuracy', targetValue: '95%', actualValue: '92%', status: 'Met' },
          { metricName: 'Shift Timeliness', targetValue: '100%', actualValue: '100%', status: 'Met' }
        ]
      });
      setTopic('');
      setDiscussionNotes('');
      setActionItems('');
      dispatch(fetchPerformanceRecords());
      alert('Coaching session logged successfully and expectations scorecard updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving coaching log');
    }
  };

  const getRecordForEmployee = (empId) => {
    return performanceRecords.find(r => r.employee?._id === empId);
  };

  // Performance Table Configuration
  const employeesColumns = [
    { 
      id: 'fullName', 
      label: 'Employee Name', 
      sortable: true,
      render: (row) => `${row.firstName} ${row.lastName}` 
    },
    { id: 'department', label: 'Department', sortable: true },
    { 
      id: 'rating', 
      label: 'Clean Rating', 
      sortable: true, 
      render: (row) => `${row.performanceScorecard?.rating || 5} / 10`
    },
    { 
      id: 'coachingLogsCount', 
      label: 'Coaching Logs', 
      sortable: true, 
      render: (row) => {
        const record = getRecordForEmployee(row._id);
        return `${record?.coachingLogs?.length || 0} reviews`;
      }
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (row) => (
        <Chip 
          label={row.status} 
          size="small" 
          color={row.status === 'Active' ? 'success' : 'default'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '11px' }} 
        />
      )
    }
  ];

  // Coaching sessions columns
  const coachingColumns = [
    { id: 'topic', label: 'Topic', sortable: true },
    { id: 'discussionNotes', label: 'Notes', sortable: false },
    { id: 'actionItems', label: 'Action Items', sortable: false },
    { 
      id: 'createdAt', 
      label: 'Logged Date', 
      sortable: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          STAFF PERFORMANCE SCORECARDS
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          File expectations checklists, track coaching notes, and review operations scorecards
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {/* Left Side: Employees Scorecard list */}
        <Grid item xs={12} md={selectedEmp ? 7 : 12}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                EMPLOYEE KPI SCORECARDS
              </Typography>
              <EnterpriseTable
                data={employees}
                columns={employeesColumns}
                searchPlaceholder="Search employees..."
                exportFilename="performance_employees_export"
                onRowClick={(row) => setSelectedEmp(row)}
                rowKey="_id"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Coaching Review details and logs */}
        {selectedEmp && (
          <Grid item xs={12} md={5}>
            <Card sx={{ border: '1px solid #517891' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>
                    COACHING JOURNAL: {selectedEmp.firstName.toUpperCase()}
                  </Typography>
                  <Button size="small" variant="text" color="error" onClick={() => setSelectedEmp(null)}>
                    Close
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1 }} />

                {/* Expectations Checklist */}
                <Box sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 1 }}>
                    EXPECTATIONS CHECKLIST
                  </Typography>
                  <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 500 }}>Clean Rate Accuracy</TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>95% Target</TableCell>
                          <TableCell sx={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>MET (92% Actual)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 500 }}>Shift Timeliness</TableCell>
                          <TableCell sx={{ fontSize: '12px' }}>100%</TableCell>
                          <TableCell sx={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>MET (100% Actual)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
                <Divider sx={{ my: 1.5 }} />

                {/* Logs lists */}
                <Box sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 1 }}>
                    LOGGED REVIEW SESSIONS
                  </Typography>
                  <EnterpriseTable
                    data={getRecordForEmployee(selectedEmp._id)?.coachingLogs || []}
                    columns={coachingColumns}
                    searchPlaceholder="Search logs..."
                    exportFilename={`coaching_logs_${selectedEmp.firstName}`}
                    rowKey="_id"
                  />
                </Box>
                
                <Divider sx={{ my: 1.5 }} />

                {/* Log form */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                  LOG NEW ALIGNMENT SESSION
                </Typography>
                <TextField
                  label="Coaching Topic"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <TextField
                  label="Discussion Notes"
                  fullWidth
                  size="small"
                  margin="dense"
                  multiline
                  rows={2}
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                />
                <TextField
                  label="Action Items / Next Steps"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                />
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleLogCoaching}
                  sx={{ mt: 1.5, height: '36px' }}
                >
                  Log Session
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Performance;
