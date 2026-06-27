import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Profile = () => {
  const navigate = useNavigate();
  const { email, role, userId } = useSelector(state => state.auth);

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            MY USER PROFILE & OPERATIONS METADATA
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Review your session access tokens, RBAC permissions parameters, and security policies
          </Typography>
        </Box>
        <Button 
          size="small" 
          variant="contained" 
          startIcon={<LockResetIcon />} 
          onClick={() => navigate('/change-password')}
          sx={{ backgroundColor: '#845EC2', '&:hover': { backgroundColor: '#6c49a6' } }}
        >
          Change Password
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 280, justifyContent: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#00C9A7', fontSize: '24px' }}>
              {email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{email?.split('@')[0]}</Typography>
              <Typography variant="body2" color="textSecondary">{email}</Typography>
              <Chip label={role} size="small" sx={{ mt: 1, backgroundColor: '#F3C5FF', fontWeight: 'bold' }} />
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Typography variant="caption" color="textSecondary">
              Registered ID: {userId || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* RBAC matrix */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, minHeight: 280 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2', mb: 1.5 }}>
              Active RBAC Permissions Matrix
            </Typography>
            <TableContainer component={Paper} sx={{ border: '1px solid #845EC2' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Module Permission</TableCell>
                    <TableCell>Access Scope</TableCell>
                    <TableCell>Status State</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { module: 'Operations Dashboard Metrics', scope: 'Read/Write', state: 'Authorized' },
                    { module: 'Workflow & Automation Builder', scope: role === 'Super Admin' || role === 'Admin' ? 'Read/Write' : 'None', state: role === 'Super Admin' || role === 'Admin' ? 'Authorized' : 'Unauthorized' },
                    { module: 'API Integrations & Secrets Vault', scope: role === 'Super Admin' || role === 'Admin' ? 'Read/Write' : 'None', state: role === 'Super Admin' || role === 'Admin' ? 'Authorized' : 'Unauthorized' },
                    { module: 'CRM Deals & HubSpot Webhooks', scope: ['Super Admin', 'Admin', 'Sales', 'Manager'].includes(role) ? 'Read/Write' : 'None', state: ['Super Admin', 'Admin', 'Sales', 'Manager'].includes(role) ? 'Authorized' : 'Unauthorized' },
                    { module: 'Internal Team Chat Channels', scope: 'Read/Write', state: 'Authorized' }
                  ].map((perm, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{perm.module}</TableCell>
                      <TableCell>{perm.scope}</TableCell>
                      <TableCell>
                        <Chip 
                          label={perm.state} 
                          size="small" 
                          sx={{ 
                            backgroundColor: perm.state === 'Authorized' ? '#00C9A7' : '#EF4444',
                            color: '#FFFFFF',
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
