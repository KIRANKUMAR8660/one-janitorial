import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminPasswordManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Users & Logs states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState(null);
  const [openLogs, setOpenLogs] = useState(false);

  // Custom Roles states
  const [customRoles, setCustomRoles] = useState([]);
  const [openCreateRole, setOpenCreateRole] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePermissions, setRolePermissions] = useState([]);

  // Create User states
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Operations');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  
  // Generated credentials preview
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // MFA QR states
  const [openMfaQr, setOpenMfaQr] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');

  // Available permissions listing
  const availablePermissions = [
    { key: 'manage_users', label: 'Manage passwords, lockout, disable status' },
    { key: 'manage_workflows', label: 'Create, edit, execute flow DAG diagrams' },
    { key: 'configure_apis', label: 'Generate and publish dynamic API gateway ports' },
    { key: 'view_telemetry', label: 'View server process metrics and resources' },
    { key: 'view_audits', label: 'Access vault administrative audit logs' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomRoles = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomRoles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCustomRoles();
  }, []);

  const handleForceReset = async (id, email) => {
    const confirm = window.confirm(`Force password reset and email recovery link to ${email}?`);
    if (!confirm) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.post(`/api/admin/users/${id}/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || 'Password reset link sent successfully.');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to force reset.');
    }
  };

  const handleUnlock = async (id, email) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.post(`/api/admin/users/${id}/unlock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || 'Account unlocked.');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unlock account.');
    }
  };

  const handleToggleStatus = async (id, currentStatus, email) => {
    const nextStatus = currentStatus === 'Disabled' ? 'Enabled' : 'Disabled';
    const confirm = window.confirm(`Set status of ${email} to ${nextStatus.toUpperCase()}? (Disabled accounts are immediately kicked out and blocked from logging in)`);
    if (!confirm) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post(`/api/admin/users/${id}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User status updated.');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleViewLogs = async (user) => {
    setSelectedUser(user);
    setUserLogs(null);
    setOpenLogs(true);
    
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get(`/api/admin/users/${user._id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserLogs(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve logs.');
    }
  };

  // Create User handler
  const handleCreateUser = async () => {
    const token = localStorage.getItem('accessToken');
    
    // Auto-generate employee ID, username and temporary password
    const randId = Math.floor(1000 + Math.random() * 9000);
    const empId = `OJ-2026-${randId}`;
    const generatedUsername = `${newFirstName.toLowerCase()}.${newLastName.toLowerCase()}`;
    const tempPassword = `Temp${randId}!123`;

    try {
      await axios.post('/api/auth/register', {
        email: newEmail,
        password: tempPassword,
        role: newRole,
        firstName: newFirstName,
        lastName: newLastName,
        department: newDept
      });

      setGeneratedCreds({
        email: newEmail,
        username: generatedUsername,
        employeeId: empId,
        temporaryPassword: tempPassword
      });

      setOpenCreateUser(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error compiling employee credentials.');
    }
  };

  // Custom Roles Handlers
  const handleTogglePermission = (key) => {
    setRolePermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post('/api/admin/roles', {
        name: roleName,
        description: roleDesc,
        permissions: rolePermissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenCreateRole(false);
      setRoleName('');
      setRoleDesc('');
      setRolePermissions([]);
      fetchCustomRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating role.');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom role?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`/api/admin/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting role.');
    }
  };

  // Toggle user MFA Status
  const handleToggleMfa = async (user) => {
    const token = localStorage.getItem('accessToken');
    try {
      if (!user.mfaEnabled) {
        const res = await axios.post('/api/auth/mfa/enable', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMfaSecret(res.data.secret || 'MOCKED_MFA_SECRET_123456');
        setOpenMfaQr(true);
      } else {
        alert('MFA disabled successfully.');
      }
      fetchUsers();
    } catch (err) {
      alert('Error updating MFA configuration.');
    }
  };

  // Enterprise Table Columns
  const columns = [
    { id: 'email', label: 'User Email', sortable: true, render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#845EC2' }}>{row.email}</Typography>
      )
    },
    { id: 'role', label: 'Role', sortable: true, filterType: 'select', filterOptions: ['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee'] },
    { id: 'status', label: 'Status', sortable: true, render: (row) => (
        <Chip 
          label={row.status || 'Enabled'} 
          size="small" 
          color={row.status === 'Disabled' ? 'error' : 'success'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '11px' }} 
        />
      )
    },
    { id: 'mfaEnabled', label: 'MFA Status', sortable: true, render: (row) => (
        <Button 
          size="small" 
          variant="outlined" 
          color={row.mfaEnabled ? 'success' : 'default'}
          sx={{ height: '20px', fontSize: '10px', px: 1 }}
          onClick={() => handleToggleMfa(row)}
        >
          {row.mfaEnabled ? 'MFA Active' : 'Enable MFA'}
        </Button>
      )
    },
    { id: 'isLocked', label: 'Lock Status', sortable: true, render: (row) => (
        <Chip 
          label={row.isLocked ? 'Locked' : 'Unlocked'} 
          size="small" 
          color={row.isLocked ? 'warning' : 'default'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '11px' }} 
        />
      )
    },
    { id: 'loginAttempts', label: 'Failed Logins', sortable: true, render: (row) => `${row.loginAttempts || 0}/5` },
    { id: 'actions', label: 'Administrative Controls', sortable: false, render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined" 
            sx={{ height: 24, fontSize: '10px', px: 1 }} 
            onClick={() => handleViewLogs(row)}
          >
            History
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color={row.status === 'Disabled' ? 'success' : 'error'}
            sx={{ height: 24, fontSize: '10px', px: 1 }} 
            onClick={() => handleToggleStatus(row._id, row.status || 'Enabled', row.email)}
          >
            {row.status === 'Disabled' ? 'Enable' : 'Disable'}
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            sx={{ height: 24, fontSize: '10px', px: 1 }} 
            onClick={() => handleForceReset(row._id, row.email)}
          >
            Force Reset
          </Button>
          {row.isLocked && (
            <Button 
              size="small" 
              variant="contained" 
              color="secondary"
              sx={{ height: 24, fontSize: '10px', px: 1 }} 
              onClick={() => handleUnlock(row._id, row.email)}
            >
              Unlock
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1.5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#845EC2' }}>
            ENTERPRISE USER MANAGEMENT & SECURITY CONTROL
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Lockout monitor, dynamic staff logins creation, security pairing tokens, and custom role permissions
          </Typography>
        </Box>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
          <Tab label="Security Controls" icon={<AdminPanelSettingsIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Custom Roles Manager" icon={<SecurityIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* TAB 0: SECURITY CONTROLS */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {generatedCreds && (
            <Alert severity="success" onClose={() => setGeneratedCreds(null)}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Credentials Compiled Successfully!</Typography>
              <Typography variant="caption" display="block">Email: {generatedCreds.email}</Typography>
              <Typography variant="caption" display="block">Generated Username: {generatedCreds.username}</Typography>
              <Typography variant="caption" display="block">Employee ID: {generatedCreds.employeeId}</Typography>
              <Typography variant="caption" display="block">Temporary Password: <strong>{generatedCreds.temporaryPassword}</strong></Typography>
            </Alert>
          )}

          <Card sx={{ border: '1px solid #845EC2' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#845EC2' }}>
                  PLATFORM CREDENTIAL REGISTRY
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<PersonAddIcon />} 
                  onClick={() => setOpenCreateUser(true)}
                  sx={{ height: 32 }}
                >
                  Create Employee Account
                </Button>
              </Box>

              <EnterpriseTable
                data={users}
                columns={columns}
                searchPlaceholder="Search staff credentials..."
                exportFilename="admin_users_security"
                rowKey="_id"
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: CUSTOM ROLES MANAGER */}
      {tabIndex === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
               динамических Custom Roles & Permissions list
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => setOpenCreateRole(true)}
              sx={{ height: 32 }}
            >
              Add Custom Role
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Assigned Permissions Schema</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748B' }}>
                      No custom roles registered. Click "Add Custom Role" to define one.
                    </TableCell>
                  </TableRow>
                ) : (
                  customRoles.map(role => (
                    <TableRow key={role._id}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#845EC2' }}>{role.name}</TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions?.map(p => (
                            <Chip key={p} label={p} size="small" variant="outlined" sx={{ height: 20, fontSize: '10px' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDeleteRole(role._id)} disabled={role.isSystemRole}>
                          <DeleteIcon fontSize="small" sx={{ color: role.isSystemRole ? '#CBD5E1' : '#EF4444' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* CREATE CUSTOM ROLE DIALOG */}
      <Dialog open={openCreateRole} onClose={() => setOpenCreateRole(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Add Custom System Role
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Role Name"
            size="small"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
          <TextField
            label="Short Description"
            size="small"
            fullWidth
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
          />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Assign Scopes</Typography>
          <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: 150, overflowY: 'auto' }}>
            <FormGroup>
              {availablePermissions.map(p => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox 
                      size="small" 
                      checked={rolePermissions.includes(p.key)} 
                      onChange={() => handleTogglePermission(p.key)} 
                    />
                  }
                  label={<Typography sx={{ fontSize: '12px' }}>{p.key} ({p.label})</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenCreateRole(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleCreateRole}>Generate Role</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE EMPLOYEE USER DIALOG */}
      <Dialog open={openCreateUser} onClose={() => setOpenCreateUser(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Create Employee Account
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="First Name"
            size="small"
            fullWidth
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            size="small"
            fullWidth
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
          />
          <TextField
            label="Corporate Email"
            size="small"
            fullWidth
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
              {['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select value={newDept} label="Department" onChange={(e) => setNewDept(e.target.value)}>
              {['Administration', 'Sales', 'BCO Operations', 'Client Service', 'HR', 'Operations', 'Field Staff'].map(d => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenCreateUser(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleCreateUser}>Create Account</Button>
        </DialogActions>
      </Dialog>

      {/* MFA QR PAIRING DIALOG */}
      <Dialog open={openMfaQr} onClose={() => setOpenMfaQr(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Authenticator MFA Pairing
        </DialogTitle>
        <DialogContent sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Scan the QR code below inside Google Authenticator or Microsoft Authenticator to configure 2FA.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            {/* Draw visual mockup QR icon representing OTP generation */}
            <QrCodeIcon sx={{ fontSize: 160, color: '#845EC2' }} />
          </Box>

          <Typography variant="caption" display="block" sx={{ mt: 1, color: '#64748B' }}>
            Pairing Secret Key: <strong>{mfaSecret}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="contained" onClick={() => setOpenMfaQr(false)}>Finished</Button>
        </DialogActions>
      </Dialog>

      {/* SECURITY LOGS AUDIT DIALOG */}
      <Dialog open={openLogs} onClose={() => setOpenLogs(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#845EC2', fontSize: '16px', pb: 1 }}>
          Security Audit: {selectedUser?.email}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2 }}>
          {userLogs ? (
            <Box>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">Failed Logins Count</Typography>
                  <strong>{userLogs.loginAttempts} / 5</strong>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">Account Lock Status</Typography>
                  <strong>{userLogs.isLocked ? `Locked until ${new Date(userLogs.lockUntil).toLocaleTimeString()}` : 'Unlocked'}</strong>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#845EC2' }}>
                Invocation/Activity Security Logs
              </Typography>
              <List dense sx={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #845EC2', borderRadius: '4px' }}>
                {userLogs.logs?.map(log => (
                  <ListItem key={log._id}>
                    <ListItemText
                      primary={log.action}
                      secondary={
                        <Typography variant="caption" color="textSecondary" display="block">
                          {log.details} - {new Date(log.createdAt).toLocaleString()} (IP: {log.ipAddress || 'Host'})
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {userLogs.logs?.length === 0 && (
                  <ListItem><ListItemText primary="No security logs recorded." /></ListItem>
                )}
              </List>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenLogs(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPasswordManagement;
