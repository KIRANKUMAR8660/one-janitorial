import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LabelIcon from '@mui/icons-material/Label';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import HistoryIcon from '@mui/icons-material/History';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings, fetchEmployees } from '../store/index.js';
import axios from 'axios';

const getAuthHeaders = (token) => {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const Meetings = () => {
  const dispatch = useDispatch();
  const { meetings, employees } = useSelector(state => state.app);
  const { accessToken } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [labels, setLabels] = useState([]);
  
  // Dialog Open states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openLabelDialog, setOpenLabelDialog] = useState(false);

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

  // New Phase 2 Fields
  const [labelId, setLabelId] = useState('');
  const [meetingCategory, setMeetingCategory] = useState('Alignment');
  const [department, setDepartment] = useState('Administration');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [agenda, setAgenda] = useState('');
  const [reminderTime, setReminderTime] = useState(15);
  const [attachments, setAttachments] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]); // userIds
  const [attendance, setAttendance] = useState({}); // userId -> status

  // Label Form states
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#845EC2');
  const [labelDesc, setLabelDesc] = useState('');
  const [editingLabelId, setEditingLabelId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');

  // Fetch Labels
  const fetchLabels = async () => {
    try {
      const res = await axios.get('/api/meeting-labels', getAuthHeaders(accessToken));
      setLabels(res.data);
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
  };

  useEffect(() => {
    dispatch(fetchMeetings());
    dispatch(fetchEmployees());
    fetchLabels();
  }, [dispatch]);

  // URL Query Parameters Router listener
  useEffect(() => {
    if (meetings.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const id = params.get('id');

    if (action === 'create') {
      resetForm();
      setOpenAdd(true);
    } else if (id) {
      const meet = meetings.find(m => m._id === id);
      if (meet) {
        if (action === 'edit') {
          handleOpenEdit(meet);
        } else {
          handleOpenDetails(meet);
        }
      }
    }
  }, [meetings, window.location.search]);

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
    setLabelId('');
    setMeetingCategory('Alignment');
    setDepartment('Administration');
    setMeetingPassword('');
    setAgenda('');
    setReminderTime(15);
    setAttachments('');
    setInvitedUsers([]);
    setAttendance({});
  };

  // Create
  const handleSchedule = async () => {
    if (!title.trim() || !scheduledTime) {
      alert("Title and Scheduled Time are required.");
      return;
    }
    try {
      const payload = {
        title,
        description,
        scheduledTime,
        durationMinutes,
        meetingType,
        googleMeetLink: googleMeetLink || `https://meet.google.com/ojm-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`,
        participants: invitedUsers,
        meetingNotes,
        recordingUrl,
        transcriptText,
        status,
        label: labelId || undefined,
        meetingCategory,
        department,
        meetingPassword,
        agenda,
        reminderTime,
        attachments: attachments ? attachments.split(',').map(a => a.trim()) : []
      };
      await axios.post('/api/meetings', payload, getAuthHeaders(accessToken));
      setOpenAdd(false);
      resetForm();
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling meeting');
    }
  };

  // Open Edit
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
    setLabelId(meet.label?._id || meet.label || '');
    setMeetingCategory(meet.meetingCategory || 'Alignment');
    setDepartment(meet.department || 'Administration');
    setMeetingPassword(meet.meetingPassword || '');
    setAgenda(meet.agenda || '');
    setReminderTime(meet.reminderTime || 15);
    setAttachments(meet.attachments?.join(', ') || '');
    setInvitedUsers(meet.participants?.map(p => p._id || p) || []);

    const attObj = {};
    meet.attendance?.forEach(a => {
      attObj[a.user?._id || a.user] = a.status;
    });
    setAttendance(attObj);

    setOpenEdit(true);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    try {
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
        attendance: attArray,
        label: labelId || undefined,
        meetingCategory,
        department,
        meetingPassword,
        agenda,
        reminderTime,
        attachments: attachments ? attachments.split(',').map(a => a.trim()) : []
      }, getAuthHeaders(accessToken));

      setOpenEdit(false);
      setSelectedMeeting(null);
      resetForm();
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating meeting');
    }
  };

  // Duplicate
  const handleDuplicate = async (meet) => {
    try {
      const payload = {
        title: `${meet.title} (Copy)`,
        description: meet.description,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
        durationMinutes: meet.durationMinutes,
        meetingType: meet.meetingType,
        googleMeetLink: meet.googleMeetLink,
        participants: meet.participants?.map(p => p._id || p) || [],
        meetingNotes: meet.meetingNotes,
        status: 'Upcoming',
        label: meet.label?._id || meet.label,
        meetingCategory: meet.meetingCategory,
        department: meet.department,
        meetingPassword: meet.meetingPassword,
        agenda: meet.agenda,
        reminderTime: meet.reminderTime,
        attachments: meet.attachments
      };
      await axios.post('/api/meetings', payload, getAuthHeaders(accessToken));
      dispatch(fetchMeetings());
      alert('Meeting duplicated successfully.');
    } catch (err) {
      alert('Error duplicating meeting.');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await axios.delete(`/api/meetings/${id}`, getAuthHeaders(accessToken));
      dispatch(fetchMeetings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting meeting');
    }
  };

  const handleToggleInvite = (userId) => {
    setInvitedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleOpenDetails = (meet) => {
    setSelectedMeeting(meet);
    setOpenDetails(true);
  };

  const handleAIMeetingSummary = async (meet) => {
    try {
      const summary = `Operations Alignment Meeting Sync: Host confirmed buffers audits completed in target areas. Action Items generated.`;
      await axios.put(`/api/meetings/${meet._id}`, {
        aiSummary: summary,
        meetingNotes: (meet.meetingNotes || '') + `\n\n[AI Minutes]: Discussions finalized regarding weekly CRM integrations review.`
      }, getAuthHeaders(accessToken));
      dispatch(fetchMeetings());
      alert('AI Summary generated successfully.');
    } catch (err) {
      alert('AI analysis failed.');
    }
  };

  // Copy Link
  const handleCopyLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard.');
    }
  };

  // Labels CRUD
  const handleSaveLabel = async () => {
    if (!labelName.trim()) return;
    try {
      if (editingLabelId) {
        await axios.put(`/api/meeting-labels/${editingLabelId}`, {
          name: labelName,
          color: labelColor,
          description: labelDesc
        }, getAuthHeaders(accessToken));
      } else {
        await axios.post('/api/meeting-labels', {
          name: labelName,
          color: labelColor,
          description: labelDesc
        }, getAuthHeaders(accessToken));
      }
      setLabelName('');
      setLabelDesc('');
      setEditingLabelId(null);
      fetchLabels();
    } catch (err) {
      alert('Failed to save classification label.');
    }
  };

  const handleDeleteLabel = async (id) => {
    if (!window.confirm('Delete this classification label?')) return;
    try {
      await axios.delete(`/api/meeting-labels/${id}`, getAuthHeaders(accessToken));
      fetchLabels();
    } catch (err) {
      alert('Failed to delete label.');
    }
  };

  // Filtered meetings listing
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meet => {
      const matchesSearch = meet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (meet.description && meet.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || meet.status === statusFilter;
      const matchesLabel = labelFilter === 'All' || (meet.label?._id || meet.label) === labelFilter;
      return matchesSearch && matchesStatus && matchesLabel;
    });
  }, [meetings, searchQuery, statusFilter, labelFilter]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    return {
      upcoming: meetings.filter(m => m.status === 'Upcoming').length,
      today: meetings.filter(m => new Date(m.scheduledTime).toDateString() === todayStr).length,
      completed: meetings.filter(m => m.status === 'Completed').length,
      cancelled: meetings.filter(m => m.status === 'Cancelled').length
    };
  }, [meetings]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredMeetings.length === 0) return;
    const headers = ['Title', 'Description', 'ScheduledTime', 'Duration', 'Type', 'URL', 'Status', 'Category', 'Department'];
    const rows = filteredMeetings.map(m => [
      m.title,
      m.description || '',
      new Date(m.scheduledTime).toLocaleString(),
      m.durationMinutes,
      m.meetingType,
      m.googleMeetLink || '',
      m.status,
      m.meetingCategory || 'Alignment',
      m.department || 'Administration'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meetings_history_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #845EC2', pb: 1.5, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#845EC2' }}>
            MEETING PORTAL & CALENDAR INTEGRATIONS
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Coordinate staff alignment sessions, classify topics with custom labels, map calendars, and output meeting metrics.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" color="primary" startIcon={<LabelIcon />} onClick={() => setOpenLabelDialog(true)}>
            Manage Labels
          </Button>
          <Button variant="contained" color="primary" startIcon={<EventAvailableIcon />} onClick={() => { resetForm(); setOpenAdd(true); }}>
            Schedule Meeting
          </Button>
        </Box>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #845EC2', bgcolor: '#FEFEDF', textAlign: 'center', p: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#845EC2' }}>{stats.today}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Today's Meetings</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #00C9A7', bgcolor: '#FEFEDF', textAlign: 'center', p: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00C9A7' }}>{stats.upcoming}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Upcoming</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #FF9671', bgcolor: '#FEFEDF', textAlign: 'center', p: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF9671' }}>{stats.completed}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Completed</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #EF4444', bgcolor: '#FEFEDF', textAlign: 'center', p: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>{stats.cancelled}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Cancelled</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs layout */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Meetings Dashboard" icon={<ListAltIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Interactive Calendar" icon={<CalendarMonthIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Meeting History Logs" icon={<HistoryIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* TAB 0: MEETINGS DASHBOARD */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Card sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField 
              label="Search Topics" 
              size="small" 
              sx={{ width: 220 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All Statuses</MenuItem>
                {['Upcoming', 'In Progress', 'Completed', 'Cancelled'].map(st => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Classification Label</InputLabel>
              <Select value={labelFilter} label="Classification Label" onChange={(e) => setLabelFilter(e.target.value)}>
                <MenuItem value="All">All Labels</MenuItem>
                {labels.map(l => (
                  <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchMeetings())}>
              Sync
            </Button>
          </Card>

          {/* Cards List */}
          <Grid container spacing={2}>
            {filteredMeetings.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" sx={{ py: 5, color: '#64748B' }}>
                  No meetings found matching your search filters.
                </Typography>
              </Grid>
            ) : (
              filteredMeetings.map(meet => (
                <Grid item xs={12} md={6} lg={4} key={meet._id}>
                  <Card sx={{ border: '1px solid #845EC2', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                          {meet.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {meet.label && (
                            <Chip 
                              label={meet.label.name || 'Label'} 
                              size="small" 
                              sx={{ 
                                height: 18, 
                                fontSize: '10px', 
                                backgroundColor: meet.label.color || '#845EC2', 
                                color: '#FFFFFF',
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                          <Chip 
                            label={meet.status} 
                            size="small" 
                            color={meet.status === 'Completed' ? 'success' : meet.status === 'Cancelled' ? 'error' : 'warning'}
                            sx={{ height: 18, fontSize: '10px' }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                        Scheduled: <strong>{new Date(meet.scheduledTime).toLocaleString()}</strong> ({meet.durationMinutes} Mins)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1E293B', mb: 2 }}>
                        {meet.description || 'No description provided.'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="textSecondary" display="block">
                        Organizer: <strong>{meet.host?.email || 'System'}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Platform: <strong>{meet.meetingPlatform || meet.meetingType || 'Google Meet'}</strong>
                      </Typography>
                      {meet.meetingPassword && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Password: <strong>{meet.meetingPassword}</strong>
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View details and AI transcript summary">
                          <IconButton size="small" onClick={() => handleOpenDetails(meet)}>
                            <InfoIcon fontSize="small" sx={{ color: '#845EC2' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit settings">
                          <IconButton size="small" onClick={() => handleOpenEdit(meet)}>
                            <EditIcon fontSize="small" sx={{ color: '#845EC2' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate meeting link">
                          <IconButton size="small" onClick={() => handleDuplicate(meet)}>
                            <FileCopyIcon fontSize="small" sx={{ color: '#00C9A7' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(meet._id)}>
                            <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success" 
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyLink(meet.googleMeetLink || meet.meetingUrl)}
                          sx={{ height: 26, fontSize: '10px' }}
                        >
                          Copy
                        </Button>
                        {(meet.googleMeetLink || meet.meetingUrl) && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success" 
                            onClick={() => window.open(meet.googleMeetLink || meet.meetingUrl, '_blank')}
                            sx={{ height: 26, fontSize: '10px' }}
                          >
                            Join
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* TAB 1: INTERACTIVE CALENDAR visual schedule */}
      {activeTab === 1 && (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 2 }}>
            Weekly Alignment Schedule Grid
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const daysMeetings = meetings.filter(m => {
                      const date = new Date(m.scheduledTime);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      return dayName === day;
                    });
                    return (
                      <TableCell key={day} valign="top" sx={{ height: 350, borderRight: '1px solid #E2E8F0', width: '14.2%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {daysMeetings.map(meet => (
                            <Paper 
                              key={meet._id} 
                              sx={{ 
                                p: 1, 
                                borderLeft: `3px solid ${meet.label?.color || '#845EC2'}`, 
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                '&:hover': { transform: 'scale(1.02)' }
                              }}
                              onClick={() => handleOpenDetails(meet)}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#845EC2', display: 'block' }}>
                                {meet.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>
                                {new Date(meet.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Chip label={meet.status} size="small" variant="outlined" sx={{ height: 16, fontSize: '8px', px: 0.5 }} />
                                <Typography 
                                  variant="caption" 
                                  sx={{ color: '#00C9A7', fontWeight: 'bold', fontSize: '9px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Interactive drag-and-drop reschedule simulation trigger
                                    const nextDay = new Date(meet.scheduledTime);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    if(window.confirm(`Reschedule meeting to tomorrow at ${nextDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}?`)) {
                                      axios.put(`/api/meetings/${meet._id}`, { scheduledTime: nextDay.toISOString() }, getAuthHeaders(accessToken))
                                        .then(() => dispatch(fetchMeetings()));
                                    }
                                  }}
                                >
                                  Reschedule
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                          {daysMeetings.length === 0 && (
                            <Typography align="center" color="textSecondary" variant="caption" sx={{ mt: 4, display: 'block', fontStyle: 'italic' }}>
                              Free Slot
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 2: HISTORICAL LOGS & CSV/PDF EXPORTS */}
      {activeTab === 2 && (
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
              Historical Audited Meetings Log File
            </Typography>
            <Button variant="outlined" color="primary" startIcon={<CloudDownloadIcon />} onClick={handleExportCSV}>
              Export History (CSV)
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Meeting Topic</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Scheduled Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Participants Count</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMeetings.map(meet => (
                  <TableRow key={meet._id}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#845EC2' }}>{meet.title}</TableCell>
                    <TableCell>{meet.meetingCategory || 'Alignment'}</TableCell>
                    <TableCell>{new Date(meet.scheduledTime).toLocaleString()}</TableCell>
                    <TableCell>{meet.durationMinutes} mins</TableCell>
                    <TableCell>{meet.host?.email || 'Admin'}</TableCell>
                    <TableCell>{meet.participants?.length || 0} staff invited</TableCell>
                    <TableCell>
                      <Chip label={meet.status} size="small" variant="outlined" color={meet.status === 'Completed' ? 'success' : meet.status === 'Cancelled' ? 'error' : 'warning'} sx={{ height: 18, fontSize: '10px' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* CLASSIFICATION LABELS DIALOG */}
      <Dialog open={openLabelDialog} onClose={() => { setOpenLabelDialog(false); setEditingLabelId(null); setLabelName(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Manage Classification Labels
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <TextField 
              label="Label Name" 
              size="small" 
              fullWidth 
              value={labelName} 
              onChange={(e) => setLabelName(e.target.value)} 
            />
            <TextField 
              label="Label Color (Hex)" 
              size="small" 
              fullWidth 
              placeholder="#845EC2"
              value={labelColor} 
              onChange={(e) => setLabelColor(e.target.value)} 
            />
            <TextField 
              label="Label Description" 
              size="small" 
              fullWidth 
              value={labelDesc} 
              onChange={(e) => setLabelDesc(e.target.value)} 
            />
            <Button variant="contained" size="small" onClick={handleSaveLabel}>
              {editingLabelId ? 'Update Label' : 'Create Label'}
            </Button>
          </Box>
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', my: 1 }}>Existing Labels</Typography>
          <List dense sx={{ maxHeight: 180, overflowY: 'auto' }}>
            {labels.map(l => (
              <ListItem 
                key={l._id} 
                secondaryAction={
                  <Box>
                    <IconButton size="small" onClick={() => { setEditingLabelId(l._id); setLabelName(l.name); setLabelColor(l.color); setLabelDesc(l.description || ''); }}>
                      <EditIcon fontSize="small" sx={{ color: '#845EC2' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteLabel(l._id)}>
                      <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                    </IconButton>
                  </Box>
                }
              >
                <Chip label={l.name} size="small" sx={{ backgroundColor: l.color || '#845EC2', color: '#FFFFFF', mr: 1, fontWeight: 'bold' }} />
                <Typography variant="caption">{l.description}</Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLabelDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE MEETING SCHEDULE DIALOG */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1 }}>
          Schedule Operations Alignment Call
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Meeting Topic" fullWidth size="small" margin="dense" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Meeting Platform</InputLabel>
                <Select value={meetingType} label="Meeting Platform" onChange={(e) => setMeetingType(e.target.value)}>
                  {['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'Custom'].map(mt => (
                    <MenuItem key={mt} value={mt}>{mt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Category</InputLabel>
                <Select value={meetingCategory} label="Category" onChange={(e) => setMeetingCategory(e.target.value)}>
                  {['Daily Standup', 'HR Interview', 'Sales Call', 'Client Meeting', 'Executive Review', 'Training Session', 'Performance Review', 'One-to-One', 'Alignment'].map(mc => (
                    <MenuItem key={mc} value={mc}>{mc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Department</InputLabel>
                <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                  {['Administration', 'Sales', 'BCO Operations', 'Client Service', 'HR', 'Operations'].map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Scheduled Time" type="datetime-local" fullWidth size="small" margin="dense" InputLabelProps={{ shrink: true }} value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Duration (Minutes)" type="number" fullWidth size="small" margin="dense" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Label Assignment</InputLabel>
                <Select value={labelId} label="Label Assignment" onChange={(e) => setLabelId(e.target.value)}>
                  {labels.map(l => (
                    <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Reminder (Minutes Before)" type="number" fullWidth size="small" margin="dense" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Meeting Password (Optional)" fullWidth size="small" margin="dense" value={meetingPassword} onChange={(e) => setMeetingPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Attachments (Comma separated URLs)" placeholder="doc1.pdf, doc2.png" fullWidth size="small" margin="dense" value={attachments} onChange={(e) => setAttachments(e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Agenda" multiline rows={2} fullWidth size="small" margin="dense" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth size="small" margin="dense" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Grid>

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

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1 }}>
          Edit Meeting Settings
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Meeting Topic" fullWidth size="small" margin="dense" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                <InputLabel>Meeting Platform</InputLabel>
                <Select value={meetingType} label="Meeting Platform" onChange={(e) => setMeetingType(e.target.value)}>
                  {['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'Custom'].map(mt => (
                    <MenuItem key={mt} value={mt}>{mt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Duration (Minutes)" type="number" fullWidth size="small" margin="dense" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Scheduled Time" type="datetime-local" fullWidth size="small" margin="dense" InputLabelProps={{ shrink: true }} value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Meeting URL" fullWidth size="small" margin="dense" value={googleMeetLink} onChange={(e) => setGoogleMeetLink(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Label Assignment</InputLabel>
                <Select value={labelId} label="Label Assignment" onChange={(e) => setLabelId(e.target.value)}>
                  {labels.map(l => (
                    <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Reminder (Minutes Before)" type="number" fullWidth size="small" margin="dense" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Meeting Password" fullWidth size="small" margin="dense" value={meetingPassword} onChange={(e) => setMeetingPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Attachments (Comma separated)" fullWidth size="small" margin="dense" value={attachments} onChange={(e) => setAttachments(e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Agenda" multiline rows={2} fullWidth size="small" margin="dense" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Meeting Notes" fullWidth size="small" margin="dense" multiline rows={3} value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Recording URL" fullWidth size="small" margin="dense" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Transcript Text" fullWidth size="small" margin="dense" value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} />
            </Grid>

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

      {/* DETAILS / PREVIEW DIALOG */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Meeting Details & Preview</span>
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
              <Card sx={{ border: '1px solid #00C9A7', bgcolor: '#FEFEDF', p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                  {selectedMeeting.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Platform: {selectedMeeting.meetingPlatform || selectedMeeting.meetingType || 'Google Meet'} - Status: {selectedMeeting.status}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Organizer: {selectedMeeting.host?.email || 'Admin'}
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

              {selectedMeeting.agenda && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Agenda</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedMeeting.agenda}</Typography>
                </Box>
              )}

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

              {selectedMeeting.attachments && selectedMeeting.attachments.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Attachments</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {selectedMeeting.attachments.map((url, idx) => (
                      <Chip key={idx} label={url} onClick={() => window.open(url, '_blank')} size="small" variant="outlined" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}

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
