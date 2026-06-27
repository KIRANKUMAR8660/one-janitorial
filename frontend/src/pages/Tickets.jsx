import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Divider, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import axios from 'axios';

const Tickets = () => {
  const dispatch = useDispatch();
  const { tickets } = useSelector(state => state.app);

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [ticketType, setTicketType] = useState('General Inquiry');

  // Communication Form
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      await axios.post('/api/tickets', { title, description, clientEmail, priority, ticketType });
      setOpenAdd(false);
      setTitle('');
      setDescription('');
      setClientEmail('');
      setPriority('Medium');
      setTicketType('General Inquiry');
      dispatch(fetchTickets());
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating ticket');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      await axios.post(`/api/tickets/${selectedTicket._id}/communication`, {
        message: replyText,
        recipient: selectedTicket.clientEmail
      });
      setReplyText('');
      // Reload tickets
      const res = await axios.get('/api/tickets');
      dispatch(fetchTickets());
      const updated = res.data.find(t => t._id === selectedTicket._id);
      setSelectedTicket(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending reply');
    }
  };

  const loadTemplate = (type) => {
    if (type === 'Billing') {
      setTitle('Billing Discrepancy Inquiry');
      setDescription('Customer reported inconsistency on invoices. Requesting accounting validation.');
    } else if (type === 'Service Complaint') {
      setTitle('Missed Clean Area Complaint');
      setDescription('Building manager flagged cleaning crew missed office sector floor polishing.');
    } else {
      setTitle('General Scheduling Query');
      setDescription('Client request timeline update of next janitorial routine sweep.');
    }
  };

  // SLA calculations helper
  const renderSLA = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    if (diff < 0) return <span style={{ color: 'red', fontWeight: 'bold' }}>EXPIRED</span>;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return <span style={{ color: '#10b981', fontWeight: 'bold' }}>{hours}h {mins}m remaining</span>;
  };

  // Table Columns Definition
  const columns = [
    { id: 'title', label: 'Subject', sortable: true },
    { id: 'clientEmail', label: 'Client Email', sortable: true },
    { 
      id: 'priority', 
      label: 'Priority', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Low', 'Medium', 'High', 'Urgent'],
      render: (row) => {
        const color = row.priority === 'Urgent' ? 'error' : 'secondary';
        return <Chip label={row.priority} size="small" color={color} sx={{ borderRadius: '4px', fontSize: '0.7rem' }} />;
      }
    },
    { 
      id: 'slaDueDate', 
      label: 'SLA Clock', 
      render: (row) => renderSLA(row.slaDueDate)
    },
    { 
      id: 'ticketType', 
      label: 'Type', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Billing', 'Service Complaint', 'Rescheduling', 'General Inquiry']
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => setSelectedTicket(row)}
          sx={{ height: 24, fontSize: '0.75rem', borderRadius: '4px' }}
        >
          Manage
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: '2px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '32px', fontWeight: 600, color: '#517891', lineHeight: 1.2 }}>
            CLIENT SERVICE TICKETING PLATFORM
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#4B5563', mt: 0.5 }}>
            Manage complaints, schedule change requests, and billing disputes
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={() => setOpenAdd(true)}>
          Create Ticket
        </Button>
      </Box>

      <Grid container spacing={1.5}>
        {/* Left Side: Tickets Table */}
        <Grid item xs={12} md={selectedTicket ? 7 : 12}>
          <Card sx={{ p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <EnterpriseTable
                data={tickets}
                columns={columns}
                searchPlaceholder="Search tickets by subject, email, type..."
                exportFilename="service_tickets"
                rowKey="_id"
                onRowClick={(row) => setSelectedTicket(row)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Communication Logs and Master Notes */}
        {selectedTicket && (
          <Grid item xs={12} md={5}>
            <Card sx={{ border: '1px solid #517891', p: '2px' }}>
              <CardContent sx={{ p: '12px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891' }}>
                    TICKET DETAIL LOGS
                  </Typography>
                  <Button size="small" variant="outlined" color="error" onClick={() => setSelectedTicket(null)} sx={{ height: 28, borderRadius: '4px' }}>
                    Close Panel
                  </Button>
                </Box>
                <Divider />

                <Box sx={{ mt: 1.5, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Title: {selectedTicket.title}</Typography>
                  <Typography sx={{ color: '#4B5563', fontSize: '0.8rem', mt: 0.5 }}>Description: {selectedTicket.description}</Typography>
                  <Typography sx={{ color: '#4B5563', fontSize: '0.8rem', mt: 0.5 }}>SLA Deadline: {new Date(selectedTicket.slaDueDate).toLocaleString()}</Typography>
                  {selectedTicket.escalationLevel > 0 && (
                    <Chip label={`ESCALATION LEVEL ${selectedTicket.escalationLevel}`} color="error" size="small" sx={{ borderRadius: '4px', mt: 1 }} />
                  )}
                </Box>
                <Divider />

                {/* Email Communication Log */}
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#517891', mt: 1.5, mb: 1 }}>CLIENT EMAIL LOGS</Typography>
                <Box sx={{ height: 180, overflow: 'auto', border: '1px solid #E5E7EB', borderRadius: '4px', p: 1, backgroundColor: '#F9FAFB', mb: 1.5 }}>
                  {selectedTicket.communicationLogs?.length === 0 ? (
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>No email transcripts registered.</Typography>
                  ) : (
                    <List dense sx={{ py: 0 }}>
                      {selectedTicket.communicationLogs.map((log, idx) => (
                        <ListItem key={idx} divider={idx < selectedTicket.communicationLogs.length - 1} sx={{ px: 0.5 }}>
                          <ListItemText 
                            primary={`${log.sender} -> ${log.recipient}`} 
                            secondary={log.message}
                            primaryTypographyProps={{ variant: 'caption', fontWeight: 600, color: '#111827' }}
                            secondaryTypographyProps={{ variant: 'body2', color: '#4B5563', mt: 0.25 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Send Reply Box */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Type email reply to client..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button variant="contained" size="small" color="primary" onClick={handleSendReply}>Send</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle sx={{ fontWeight: 600, color: '#517891', fontSize: '20px' }}>Create Client Support Ticket</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          {/* Templates */}
          <Box sx={{ mb: 1, mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>TEMPLATES:</Typography>
            {['Billing', 'Service Complaint'].map(tpl => (
              <Button key={tpl} variant="outlined" size="small" sx={{ py: '2px', px: 1, fontSize: '0.7rem', height: 24, borderRadius: '4px' }} onClick={() => loadTemplate(tpl)}>
                {tpl}
              </Button>
            ))}
          </Box>
          <TextField
            label="Client Contact Email"
            fullWidth
            size="small"
            margin="normal"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <TextField
            label="Subject"
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
            <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
              {['Low', 'Medium', 'High', 'Urgent'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" margin="normal">
            <InputLabel>Type</InputLabel>
            <Select value={ticketType} label="Type" onChange={(e) => setTicketType(e.target.value)}>
              {['Billing', 'Service Complaint', 'Rescheduling', 'General Inquiry'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdd(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleCreate} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tickets;
