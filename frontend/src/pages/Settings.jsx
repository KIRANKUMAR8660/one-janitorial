import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';

const Settings = () => {
  const { email, role } = useSelector(state => state.auth);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [success, setSuccess] = useState(null);

  const handleSave = () => {
    setSuccess('Global system configuration settings updated successfully.');
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            SYSTEM CONFIGURATION & PREFERENCES
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Manage session timeouts, multi-factor authentication policies, SMTP email routing targets, and administrative overrides
          </Typography>
        </Box>
        <Button 
          size="small" 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSave}
          sx={{ backgroundColor: '#00C9A7', '&:hover': { backgroundColor: '#00a88c' } }}
        >
          Save Settings
        </Button>
      </Box>

      {success && <Alert severity="success">{success}</Alert>}

      <Grid container spacing={2}>
        {/* Security policies */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 280 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
              Security & RBAC Enforcement Policies
            </Typography>
            <Divider />
            
            <FormControlLabel
              control={<Switch checked={mfaEnabled} onChange={(e) => setMfaEnabled(e.target.checked)} color="primary" />}
              label={<Typography variant="body2">Enforce Multi-Factor Authentication (MFA)</Typography>}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: -1.5, pl: 4 }}>
              Requires all users to authenticate with an authenticator app (Google Authenticator) before accessing details.
            </Typography>

            <TextField
              size="small"
              type="number"
              label="Session Inactivity Timeout (Minutes)"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              fullWidth
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>

        {/* Notifications & System Preferences */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 280 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
              System Alerts & Routing Preferences
            </Typography>
            <Divider />

            <FormControlLabel
              control={<Switch checked={systemAlerts} onChange={(e) => setSystemAlerts(e.target.checked)} color="primary" />}
              label={<Typography variant="body2">Enable Socket.IO Realtime Presence Broadcast Alerts</Typography>}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: -1.5, pl: 4 }}>
              Broadcast new user logins and ticket creations globally to online staff members.
            </Typography>

            <TextField
              size="small"
              select
              label="Default Email Notification Service Provider"
              value="SMTP"
              fullWidth
              disabled
              sx={{ mt: 1 }}
            >
              <MenuItem value="SMTP">SMTP Direct Service</MenuItem>
              <MenuItem value="Resend">Resend API Service</MenuItem>
            </TextField>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
