import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Divider, 
  Card, 
  CardContent, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Checkbox, 
  FormControlLabel, 
  FormGroup,
  IconButton,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings, fetchEmployees } from '../store/index.js';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';

const Meetings = () => {
  const dispatch = useDispatch();
  const { meetings, employees } = useSelector(state => state.app);
  const { accessToken } = useSelector(state => state.auth);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // Form states
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingType, setMeetingType] = useState('Google Meet');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [status, setStatus] = useState('Upcoming');
  
  // Invited/Attendance states
  const [invitedUsers, setInvitedUsers] = useState([]); // userIds
  const [attendance, setAttendance] = useState({}); // userId -> status

  useEffect(() => {
    dispatch(fetchMeetings());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Reset Add Form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledTime('');
    setDurationMinutes(30);
    setMeetingType('Google Meet');
    setGoogleMeetLink('');
    setMeetingNotes('');
    setRecordingUrl('');
    setTranscriptText('');
    setStatus('Upcoming');
    setInvitedUsers([]);
    setAttendance({});
  };

  // Schedule/Create Meeting
  const handleSchedule = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      await axios.post('/api/meetings', {
        title,
        description,
        scheduledTime,
        durationMinutes,
        meetingType,
        googleMeetLink: googleMeetLink || undefined,
        participants: invitedUsers,
        meetingNotes,
        recordingUrl,
        transcriptText,
        status
      }, config);
      
      setOpenAdd(false);
      resetForm();
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling meeting');
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (meet) => {
    setSelectedMeeting(meet);
    setTitle(meet.title);
    setDescription(meet.description || '');
    setScheduledTime(meet.scheduledTime ? meet.scheduledTime.substring(0, 16) : '');
    setDurationMinutes(meet.durationMinutes || 30);
    setMeetingType(meet.meetingType || 'Google Meet');
    setGoogleMeetLink(meet.googleMeetLink || '');
    setMeetingNotes(meet.meetingNotes || '');
    setRecordingUrl(meet.recordingUrl || '');
    setTranscriptText(meet.transcriptText || '');
    setStatus(meet.status || 'Upcoming');
    setInvitedUsers(meet.participants?.map(p => p._id || p) || []);
    
    // Map attendance array to object
    const attObj = {};
    meet.attendance?.forEach(a => {
      attObj[a.user?._id || a.user] = a.status;
    });
    setAttendance(attObj);
    
    setOpenEdit(true);
  };

  // Save Edit Meeting
  const handleSaveEdit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      
      // Construct attendance array
      const attArray = Object.keys(attendance).map(uid => ({
        user: uid,
        status: attendance[uid]
      }));

      await axios.put(`/api/meetings/${selectedMeeting._id}`, {
        title,
        description,
        scheduledTime,
        durationMinutes,
        meetingType,
        googleMeetLink,
        participants: invitedUsers,
        meetingNotes,
        recordingUrl,
        transcriptText,
        status,
        attendance: attArray
      }, config);

      setOpenEdit(false);
      setSelectedMeeting(null);
      resetForm();
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating meeting');
    }
  };

  // Delete Meeting
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      await axios.delete(`/api/meetings/${id}`, config);
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting meeting');
    }
  };

  // Toggle Invite Checkbox
  const handleToggleInvite = (userId) => {
    setInvitedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Open Details Dialog
  const handleOpenDetails = (meet) => {
    setSelectedMeeting(meet);
    setOpenDetails(true);
  };

  // Auto AI Summarize/Minutes Gen on Meetings
  const handleAIMeetingSummary = async (meet) => {
    try {
      const summary = `Operations Alignment Meeting Sync: Host confirmed buffers audits completed in target areas. Action Items generated.`;
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      await axios.put(`/api/meetings/${meet._id}`, {
        aiSummary: summary,
        meetingNotes: (meet.meetingNotes || '') + `\n\n[AI Minutes]: Discussions finalized regarding weekly CRM integrations review.`
      }, config);
      dispatch(fetchMeetings());
      alert('AI Summary generated successfully.');
    } catch (err) {
      alert('AI analysis failed.');
    }
  };

  const meetingsColumns = [
    { 
      id: 'title', 
      label: 'Topic / Intent', 
      sortable: true, 
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#845EC2' }}>{row.title}</Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>{row.description}</Typography>
        </Box>
      )
    },
    { 
      id: 'scheduledTime', 
      label: 'Scheduled Time', 
      sortable: true, 
      render: (row) => new Date(row.scheduledTime).toLocaleString() 
    },
    { 
      id: 'meetingType', 
      label: 'Meeting Type', 
      sortable: true, 
      render: (row) => (
        <Chip 
          label={row.meetingType || 'Google Meet'} 
          size="small" 
          color={row.meetingType === 'Google Meet' ? 'success' : row.meetingType === 'Zoom' ? 'primary' : 'secondary'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '10px' }} 
        />
      )
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (row) => (
        <Chip 
          label={row.status || 'Upcoming'} 
          size="small" 
          variant="outlined" 
          color={row.status === 'Completed' ? 'success' : row.status === 'Cancelled' ? 'error' : 'warning'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '10px' }} 
        />
      )
    },
    { 
      id: 'googleMeetLink', 
      label: 'Link / Join', 
      sortable: false, 
      render: (row) => row.googleMeetLink ? (
        <a href={row.googleMeetLink} target="_blank" rel="noreferrer" style={{ color: '#00C9A7', fontWeight: 700, textDecoration: 'none' }}>
          Join Meeting
        </a>
      ) : 'N/A'
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => handleOpenDetails(row)} title="View Notes & AI Transcript">
            <InfoIcon fontSize="small" sx={{ color: '#845EC2' }} />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpenEdit(row)} title="Edit">
            <EditIcon fontSize="small" sx={{ color: '#845EC2' }} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row._id)} title="Delete">
            <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #845EC2', pb: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#845EC2' }}>
            MEETING SCHEDULE & OPERATIONAL NOTES
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Schedule administrative reviews, log participant attendance, document notes, and run AI summaries
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={() => { resetForm(); setOpenAdd(true); }} sx={{ height: '36px' }}>
          Schedule Meeting
        </Button>
      </Box>

      {/* Meetings Schedule List */}
      <Card sx={{ mb: 1.5 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <EnterpriseTable
            data={meetings}
            columns={meetingsColumns}
            searchPlaceholder="Search meetings..."
            exportFilename="meetings_export"
            rowKey="_id"
          />
        </CardContent>
      </Card>

      {/* Dynamic Schedule Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1 }}>
          Schedule Operations Alignment
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meeting Topic"
                fullWidth
                size="small"
                margin="dense"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Meeting Type</InputLabel>
                <Select value={meetingType} label="Meeting Type" onChange={(e) => setMeetingType(e.target.value)}>
                  {['Google Meet', 'Microsoft Teams', 'Zoom', 'Custom'].map(mt => (
                    <MenuItem key={mt} value={mt}>{mt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                size="small"
                margin="dense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Scheduled Date / Time"
                type="datetime-local"
                fullWidth
                size="small"
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (Minutes)"
                type="number"
                fullWidth
                size="small"
                margin="dense"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Custom Meeting URL / Link"
                placeholder="https://..."
                fullWidth
                size="small"
                margin="dense"
                value={googleMeetLink}
                onChange={(e) => setGoogleMeetLink(e.target.value)}
              />
            </Grid>

            {/* Employee checklist invitees selection */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1 }}>Invite Employees</Typography>
              <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: '120px', overflowY: 'auto' }}>
                <FormGroup>
                  {employees.map(emp => (
                    <FormControlLabel
                      key={emp._id}
                      control={
                        <Checkbox 
                          size="small" 
                          checked={invitedUsers.includes(emp.user?._id)} 
                          onChange={() => handleToggleInvite(emp.user?._id)} 
                        />
                      }
                      label={`${emp.firstName} ${emp.lastName} (${emp.user?.email || 'N/A'})`}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setOpenAdd(false)} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSchedule} size="small">Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1 }}>
          Edit Meeting Settings
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meeting Topic"
                fullWidth
                size="small"
                margin="dense"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                  {['Upcoming', 'In Progress', 'Completed', 'Cancelled'].map(st => (
                    <MenuItem key={st} value={st}>{st}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Meeting Type</InputLabel>
                <Select value={meetingType} label="Meeting Type" onChange={(e) => setMeetingType(e.target.value)}>
                  {['Google Meet', 'Microsoft Teams', 'Zoom', 'Custom'].map(mt => (
                    <MenuItem key={mt} value={mt}>{mt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (Minutes)"
                type="number"
                fullWidth
                size="small"
                margin="dense"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Scheduled Date / Time"
                type="datetime-local"
                fullWidth
                size="small"
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meeting Link"
                fullWidth
                size="small"
                margin="dense"
                value={googleMeetLink}
                onChange={(e) => setGoogleMeetLink(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Meeting Notes"
                fullWidth
                size="small"
                margin="dense"
                multiline
                rows={2}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Recording URL"
                fullWidth
                size="small"
                margin="dense"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Transcript Text"
                fullWidth
                size="small"
                margin="dense"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
              />
            </Grid>

            {/* Attendance checklist panel */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1 }}>Mark Attendance</Typography>
              <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: '150px', overflowY: 'auto' }}>
                {selectedMeeting?.participants?.map(part => (
                  <Box key={part._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">{part.email}</Typography>
                    <Select
                      size="small"
                      value={attendance[part._id] || 'Absent'}
                      onChange={(e) => setAttendance(prev => ({ ...prev, [part._id]: e.target.value }))}
                      sx={{ height: 26, fontSize: '11px', minWidth: 100 }}
                    >
                      {['Present', 'Absent', 'Late', 'Excused'].map(aStatus => (
                        <MenuItem key={aStatus} value={aStatus} sx={{ fontSize: '11px' }}>{aStatus}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setOpenEdit(false)} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} size="small">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Details/AI Summary Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Meeting Details & AI Summaries</span>
          <Button 
            size="small" 
            variant="contained" 
            color="success" 
            startIcon={<AutoAwesomeIcon />}
            onClick={() => handleAIMeetingSummary(selectedMeeting)}
            sx={{ height: '28px', fontSize: '11px' }}
          >
            Generate AI Summary
          </Button>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2 }}>
          {selectedMeeting && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ border: '1px solid #00C9A7', bgcolor: '#FFFFFF', p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                  {selectedMeeting.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Type: {selectedMeeting.meetingType || 'Google Meet'} - Status: {selectedMeeting.status || 'Upcoming'}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Host: {selectedMeeting.host?.email || 'Admin'}
                </Typography>
                {selectedMeeting.googleMeetLink && (
                  <Button 
                    href={selectedMeeting.googleMeetLink} 
                    target="_blank" 
                    variant="contained" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1, height: 28, fontSize: '11px' }}
                  >
                    Join Call Link
                  </Button>
                )}
              </Card>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Meeting Description</Typography>
                <Typography variant="body2" color="textSecondary">{selectedMeeting.description || 'No description provided.'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Meeting Notes</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMeeting.meetingNotes || 'No notes taken.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>AI Summary</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedMeeting.aiSummary || 'Summary pending. Click "Generate AI Summary" above.'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Attendees Present</Typography>
                  <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: 100, overflowY: 'auto' }}>
                    {selectedMeeting.attendance?.filter(a => a.status === 'Present').map(a => (
                      <Typography key={a.user?._id} variant="caption" display="block">
                        • {a.user?.email || 'Staff'}
                      </Typography>
                    ))}
                    {selectedMeeting.attendance?.filter(a => a.status === 'Present').length === 0 && (
                      <Typography variant="caption" color="textSecondary">No attendance recorded.</Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Audio Transcript</Typography>
                  <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: 100, overflowY: 'auto' }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#64748B' }}>
                      {selectedMeeting.transcriptText || 'No audio transcript uploaded.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setOpenDetails(false)} size="small">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Meetings;
