import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Select, MenuItem, TextField, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals, fetchLeads } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import axios from 'axios';

const CRM = () => {
  const dispatch = useDispatch();
  const { deals, leads } = useSelector(state => state.app);

  const [leadFirstName, setLeadFirstName] = useState('');
  const [leadLastName, setLeadLastName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleCreateLead = async () => {
    try {
      await axios.post('/api/crm/leads', {
        firstName: leadFirstName,
        lastName: leadLastName,
        email: leadEmail,
        phone: leadPhone
      });
      setLeadFirstName('');
      setLeadLastName('');
      setLeadEmail('');
      setLeadPhone('');
      dispatch(fetchLeads());
      alert('Lead registered and automation sequence triggered.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating lead');
    }
  };

  const handleUpdateDealStage = async (dealId, stage) => {
    try {
      await axios.put(`/api/crm/deals/${dealId}/stage`, { stage });
      dispatch(fetchDeals());
      alert(`Deal stage updated to ${stage}. Automated follow-ups checked.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating deal stage');
    }
  };

  const handleBulkUpdateDealStage = async (ids, stage) => {
    try {
      await Promise.all(ids.map(id => axios.put(`/api/crm/deals/${id}/stage`, { stage })));
      dispatch(fetchDeals());
      alert(`Bulk updated ${ids.length} deal(s) stage to ${stage}.`);
    } catch (err) {
      alert('Error bulk updating deals: ' + err.message);
    }
  };

  const handleRunHygiene = async () => {
    try {
      const res = await axios.post('/api/crm/hygiene');
      dispatch(fetchLeads());
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error running hygiene');
    }
  };

  // Deals table columns
  const dealColumns = [
    { id: 'title', label: 'Deal Name', sortable: true },
    { id: 'amount', label: 'Value', sortable: true, render: (row) => `$${row.amount || 0}` },
    { 
      id: 'stage', 
      label: 'Pipeline Stage', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Appointment Scheduled', 'Qualified to Buy', 'Proposal Sent', 'Closed Won', 'Closed Lost'],
      render: (row) => (
        <Select
          size="small"
          value={row.stage}
          onChange={(e) => handleUpdateDealStage(row._id, e.target.value)}
          sx={{ fontSize: '0.75rem', height: 26, borderRadius: '4px', minWidth: 140 }}
        >
          {['Appointment Scheduled', 'Qualified to Buy', 'Proposal Sent', 'Closed Won', 'Closed Lost'].map(st => (
            <MenuItem key={st} value={st} sx={{ fontSize: '0.75rem' }}>{st}</MenuItem>
          ))}
        </Select>
      )
    },
    { 
      id: 'followUpStatus', 
      label: 'Follow-Up Status', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Pending', 'Completed', 'Failed', 'None'],
      render: (row) => {
        const color = row.followUpStatus === 'Completed' ? 'success' : row.followUpStatus === 'Pending' ? 'warning' : 'secondary';
        return <Chip label={row.followUpStatus || 'None'} size="small" color={color} sx={{ borderRadius: '4px', fontSize: '0.7rem' }} />;
      }
    }
  ];

  // Leads table columns
  const leadColumns = [
    { 
      id: 'firstName', 
      label: 'Contact', 
      sortable: true, 
      render: (row) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {row.firstName} {row.lastName}
        </Typography>
      )
    },
    { id: 'email', label: 'Email / Phone', render: (row) => `${row.email} / ${row.phone || 'N/A'}` },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Inactive'],
      render: (row) => <Chip label={row.status} size="small" sx={{ borderRadius: '4px', fontSize: '0.7rem' }} />
    },
    { id: 'assignedTo', label: 'Rep Assigned', render: (row) => row.assignedTo?.email || 'UNASSIGNED' },
    { 
      id: 'hygieneStatus', 
      label: 'Hygiene Status', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Good', 'Flagged for Reassignment'],
      render: (row) => {
        const isFlagged = row.inactiveFlagged || row.hygieneStatus === 'Flagged for Reassignment';
        return (
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isFlagged ? '#ef4444' : '#10b981' }}>
            {row.hygieneStatus}
          </Typography>
        );
      }
    }
  ];

  const bulkDealActions = [
    { label: 'Set Closed Won', action: (ids) => handleBulkUpdateDealStage(ids, 'Closed Won') },
    { label: 'Set Proposal Sent', action: (ids) => handleBulkUpdateDealStage(ids, 'Proposal Sent') }
  ];

  return (
    <Box sx={{ p: '2px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '32px', fontWeight: 600, color: '#517891', lineHeight: 1.2 }}>
            CRM AUTOMATION CENTER
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#4B5563', mt: 0.5 }}>
            HubSpot Pipeline controls, Closed Won triggers, and round-robin lead allocation
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={handleRunHygiene} sx={{ height: 36, backgroundColor: '#57B9FF' }}>
          Run Lead Hygiene Check
        </Button>
      </Box>

      <Grid container spacing={1.5}>
        {/* Deal Pipeline & Leads Tables */}
        <Grid item xs={12} md={8}>
          {/* HubSpot Deals */}
          <Card sx={{ mb: 2, p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891', mb: 1 }}>
                HUBSPOT DEALS & CLOSED-WON AUTOMATIONS
              </Typography>
              <EnterpriseTable
                data={deals}
                columns={dealColumns}
                searchPlaceholder="Search deal name..."
                bulkActions={bulkDealActions}
                exportFilename="hubspot_deals"
                rowKey="_id"
              />
            </CardContent>
          </Card>

          {/* CRM Leads */}
          <Card sx={{ p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891', mb: 1 }}>
                LEADS INDEX & DISTRIBUTION HEALTH
              </Typography>
              <EnterpriseTable
                data={leads}
                columns={leadColumns}
                searchPlaceholder="Search lead name, email..."
                exportFilename="crm_leads"
                rowKey="_id"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Create Lead and appointment callback definitions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '4px', mb: 2, p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891', mb: 1.5 }}>
                INBOUND LEAD REGISTER
              </Typography>
              <TextField
                label="First Name"
                fullWidth
                size="small"
                margin="dense"
                value={leadFirstName}
                onChange={(e) => setLeadFirstName(e.target.value)}
              />
              <TextField
                label="Last Name"
                fullWidth
                size="small"
                margin="dense"
                value={leadLastName}
                onChange={(e) => setLeadLastName(e.target.value)}
              />
              <TextField
                label="Email Address"
                fullWidth
                size="small"
                margin="dense"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
              />
              <TextField
                label="Phone Number"
                fullWidth
                size="small"
                margin="dense"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
              />
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth 
                sx={{ mt: 2, height: 36, backgroundColor: '#57B9FF', color: '#FFFFFF', '&:hover': { backgroundColor: '#0090C8' } }}
                onClick={handleCreateLead}
              >
                Save & Assign Lead
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: 'rgba(0, 31, 63, 0.02)', border: '1px solid #E5E7EB', p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#517891', mb: 1, display: 'block' }}>
                CRM AUTOMATIONS ACTIVE:
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>
                - <strong>Closed Won Follow-Up:</strong> Updates deal state, triggers a scheduled async email, and logs final outputs.
                <br />
                - <strong>Lead Hygiene:</strong> Flags inactive records (&gt;7 days) and re-allocates reps using round-robin.
                <br />
                - <strong>Appointment Automation:</strong> Creates callback items and schedules reminders.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CRM;
