import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Reports = () => {
  const [reports, setReports] = useState([
    { id: '1', title: 'Q2 Operations Performance Summary', type: 'Performance', format: 'PDF', generated: '2026-06-24', size: '2.4 MB', schedule: 'Monthly' },
    { id: '2', title: 'HubSpot Deals & Pipeline Sync Logs', type: 'Sales CRM', format: 'CSV', generated: '2026-06-23', size: '150 KB', schedule: 'Weekly' },
    { id: '3', title: 'SOP RAG Library Vector Accuracy Scorecard', type: 'AI Control', format: 'Excel', generated: '2026-06-20', size: '890 KB', schedule: 'Ad-hoc' },
    { id: '4', title: 'Cleaners Directory Payroll Verification Report', type: 'HR Recruitment', format: 'PDF', generated: '2026-06-18', size: '1.8 MB', schedule: 'Monthly' }
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Performance');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newSchedule, setNewSchedule] = useState('Monthly');
  const [success, setSuccess] = useState(null);

  const handleCreateReport = () => {
    if (!newTitle) return;
    const newRep = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      format: newFormat,
      generated: new Date().toISOString().split('T')[0],
      size: '0.1 MB',
      schedule: newSchedule
    };
    setReports([newRep, ...reports]);
    setNewTitle('');
    setCreateOpen(false);
    setSuccess(`Successfully generated and scheduled report: ${newTitle}`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleDownload = (rep) => {
    // Simulated file download
    alert(`Downloading ${rep.title}.${rep.format.toLowerCase()} (${rep.size})`);
  };

  const handleEmailDelivery = (rep) => {
    // Simulated email dispatch
    alert(`Report ${rep.title} scheduled for delivery to admin@onejanitorial.com`);
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ENTERPRISE REPORTING ENGINE & EXPORTS
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Generate audit compilations, schedule CRM and HR email reports delivery, and export structured PDF, CSV, Excel, or HTML
          </Typography>
        </Box>
        <Button 
          size="small" 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setCreateOpen(true)}
          sx={{ backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}
        >
          Create Report
        </Button>
      </Box>

      {success && <Alert severity="success">{success}</Alert>}

      {/* Reports Table List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
          Generated Reports Catalog
        </Typography>
        <TableContainer component={Paper} sx={{ border: '1px solid #845EC2' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Report Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Generated Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{rep.title}</TableCell>
                  <TableCell>{rep.type}</TableCell>
                  <TableCell><Chip label={rep.format} size="small" sx={{ backgroundColor: '#F3C5FF' }} /></TableCell>
                  <TableCell sx={{ color: '#845EC2', fontWeight: 600 }}>{rep.schedule}</TableCell>
                  <TableCell>{rep.generated}</TableCell>
                  <TableCell>{rep.size}</TableCell>
                  <TableCell align="center" sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<DownloadIcon />} 
                      onClick={() => handleDownload(rep)}
                      sx={{ height: 24, fontSize: '10px', borderColor: '#845EC2', color: '#845EC2' }}
                    >
                      Export
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<SendIcon />} 
                      onClick={() => handleEmailDelivery(rep)}
                      sx={{ height: 24, fontSize: '10px', backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}
                    >
                      Email Sync
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Scheduling Card */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1 }}>
          Scheduled Email Deliveries Status
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
          Active recurring jobs automated inside backend queues to compile and email spreadsheets.
        </Typography>
        <Grid container spacing={2}>
          {[
            { subject: 'Weekly HubSpot Sales pipeline Deals Sync', run: 'Every Monday 08:00 AM', active: true },
            { subject: 'Monthly Operations BCO Project Evaluations Summary', run: '1st of every month', active: true }
          ].map((sched, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card sx={{ border: '1px solid #F3C5FF', p: '2px', boxShadow: 'none' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sched.subject}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CalendarMonthIcon fontSize="inherit" /> Scheduled: {sched.run}
                    </Typography>
                  </Box>
                  <Chip label="ACTIVE" color="success" size="small" sx={{ backgroundColor: '#00C9A7' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold', px: 2, py: 1.5 }}>
          Create Scheduled Report
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            size="small"
            label="Report Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            size="small"
            select
            label="Category"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            fullWidth
          >
            {['Performance', 'Sales CRM', 'AI Control', 'HR Recruitment', 'Audit Log'].map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Format"
            value={newFormat}
            onChange={(e) => setNewFormat(e.target.value)}
            fullWidth
          >
            {['PDF', 'CSV', 'Excel', 'HTML', 'JSON'].map(f => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Frequency Schedule"
            value={newSchedule}
            onChange={(e) => setNewSchedule(e.target.value)}
            fullWidth
          >
            {['Ad-hoc', 'Daily', 'Weekly', 'Monthly'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleCreateReport} sx={{ backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
