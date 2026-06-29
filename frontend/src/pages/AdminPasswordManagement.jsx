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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const getAuthHeaders = (token) => {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

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
  const [newPhone, setNewPhone] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');

  // Edit User states
  const [openEditUser, setOpenEditUser] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editStatus, setEditStatus] = useState('Enabled');

  // Reset Password Dialog states
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [forceResetToggle, setForceResetToggle] = useState(false);
  const [resetMethod, setResetMethod] = useState('email'); // 'email', 'temp', 'force'
  
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
      const res = await axios.get('/api/admin/users', getAuthHeaders(token));
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
      const res = await axios.get('/api/admin/roles', getAuthHeaders(token));
      setCustomRoles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCustomRoles();
  }, []);

  // URL Query Parameters Router listener
  useEffect(() => {
    if (users.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const id = params.get('id');

    if (action === 'create') {
      setOpenCreateUser(true);
    } else if (id) {
      const user = users.find(u => u._id === id);
      if (user) {
        handleOpenEditUser(user);
      }
    }
  }, [users, window.location.search]);

  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setTempPassword('');
    setForceResetToggle(user.forcePasswordReset || false);
    setResetMethod('email');
    setOpenResetDialog(true);
  };

  // Submit Password Action (temp password, link, force reset toggle)
  const handleExecutePasswordReset = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      let payload = {};
      if (resetMethod === 'temp') {
        if (!tempPassword.trim()) {
          alert('Temporary password is required.');
          return;
        }
        payload.temporaryPassword = tempPassword;
      } else if (resetMethod === 'force') {
        payload.forcePasswordReset = forceResetToggle;
      }

      const res = await axios.post(`/api/admin/users/${selectedUser._id}/reset`, payload, getAuthHeaders(token));
      alert(res.data.message || 'Password security settings updated.');
      setOpenResetDialog(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password reset options.');
    }
  };

  const handleUnlock = async (id, email) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.post(`/api/admin/users/${id}/unlock`, {}, getAuthHeaders(token));
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
      await axios.post(`/api/admin/users/${id}/status`, { status: nextStatus }, getAuthHeaders(token));
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
      const res = await axios.get(`/api/admin/users/${user._id}/logs`, getAuthHeaders(token));
      setUserLogs(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve logs.');
    }
  };

  // Create User
  const handleCreateUser = async () => {
    const randId = Math.floor(1000 + Math.random() * 9000);
    const empId = newEmployeeId || `OJ-2026-${randId}`;
    const generatedUsername = `${newFirstName.toLowerCase()}.${newLastName.toLowerCase()}`;
    const generatedTempPassword = `Temp${randId}!123`;

    try {
      await axios.post('/api/auth/register', {
        email: newEmail,
        password: generatedTempPassword,
        role: newRole,
        firstName: newFirstName,
        lastName: newLastName,
        department: newDept,
        phone: newPhone,
        employeeId: empId
      });

      setGeneratedCreds({
        email: newEmail,
        username: generatedUsername,
        employeeId: empId,
        temporaryPassword: generatedTempPassword
      });

      setOpenCreateUser(false);
      fetchUsers();
      // Clear inputs
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      setNewEmployeeId('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error compiling employee credentials.');
    }
  };

  // Open Edit User Dialog
  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setEditEmail(user.email || '');
    setEditRole(user.role || 'Employee');
    setEditStatus(user.status || 'Enabled');
    setEditFirstName(user.employeeDetails?.firstName || '');
    setEditLastName(user.employeeDetails?.lastName || '');
    setEditPhone(user.employeeDetails?.phone || '');
    setEditDept(user.employeeDetails?.department || 'Operations');
    setEditEmployeeId(user.employeeDetails?.employeeId || '');
    setOpenEditUser(true);
  };

  // Save Edit User
  const handleSaveEditUser = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}`, {
        email: editEmail,
        role: editRole,
        status: editStatus,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        department: editDept,
        employeeId: editEmployeeId
      }, getAuthHeaders(token));

      setOpenEditUser(false);
      fetchUsers();
      alert('User details updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  // Delete User
  const handleDeleteUser = async (id, email) => {
    const confirm = window.confirm(`Permanently delete the user account for ${email}? This cannot be undone.`);
    if (!confirm) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`/api/admin/users/${id}`, getAuthHeaders(token));
      setOpenEditUser(false);
      fetchUsers();
      alert('User deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
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
      }, getAuthHeaders(token));
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
      await axios.delete(`/api/admin/roles/${id}`, getAuthHeaders(token));
      fetchCustomRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting role.');
    }
  };

  const handleToggleMfa = async (user) => {
    const token = localStorage.getItem('accessToken');
    try {
      if (!user.mfaEnabled) {
        const res = await axios.post('/api/auth/mfa/enable', {}, getAuthHeaders(token));
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
    { id: 'employeeId', label: 'Employee ID', sortable: true, render: (row) => row.employeeDetails?.employeeId || 'N/A' },
    { id: 'employeeName', label: 'Employee Name', sortable: true, render: (row) => row.employeeDetails ? `${row.employeeDetails.firstName} ${row.employeeDetails.lastName}` : 'N/A' },
    { id: 'username', label: 'Username', sortable: true, render: (row) => row.employeeDetails?.username || 'N/A' },
    { id: 'email', label: 'Email', sortable: true, render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#845EC2' }}>{row.email}</Typography>
      )
    },
    { id: 'role', label: 'Role', sortable: true, filterType: 'select', filterOptions: ['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee'] },
    { id: 'department', label: 'Department', sortable: true, render: (row) => row.employeeDetails?.department || 'Operations' },
    { id: 'status', label: 'Status', sortable: true, render: (row) => (
        <Chip 
          label={row.status || 'Enabled'} 
          size="small" 
          color={row.status === 'Disabled' ? 'error' : 'success'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '11px' }} 
        />
      )
    },
    { id: 'lastLogin', label: 'Last Login', sortable: true, render: (row) => row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never' },
    { id: 'passwordLastChanged', label: 'Password Changed', sortable: true, render: (row) => row.passwordLastChanged ? new Date(row.passwordLastChanged).toLocaleDateString() : 'N/A' },
    { id: 'actions', label: 'Administrative Controls', sortable: false, render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
            color="primary"
            sx={{ height: 24, fontSize: '10px', px: 1 }} 
            onClick={() => handleOpenEditUser(row)}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            sx={{ height: 24, fontSize: '10px', px: 1 }} 
            onClick={() => handleOpenReset(row)}
          >
            Reset Pwd
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
            Enforce role policies, lockouts, disable status, password resets, and audit historical security logs.
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
              Custom Roles & Permissions List
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

      {/* RESET PASSWORD / OPTIONS OVERLAY DIALOG */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold', fontSize: '16px' }}>
          Reset Password Options: {selectedUser?.email}
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Reset Method</InputLabel>
            <Select value={resetMethod} label="Reset Method" onChange={(e) => setResetMethod(e.target.value)}>
              <MenuItem value="email">Send Recovery Link Email</MenuItem>
              <MenuItem value="temp">Generate Temporary Password</MenuItem>
              <MenuItem value="force">Toggle Force Change on Next Login</MenuItem>
            </Select>
          </FormControl>

          {resetMethod === 'temp' && (
            <TextField 
              label="Temporary Password" 
              size="small" 
              fullWidth 
              placeholder="e.g. TempPass@12345"
              value={tempPassword} 
              onChange={(e) => setTempPassword(e.target.value)} 
            />
          )}

          {resetMethod === 'force' && (
            <FormControlLabel
              control={
                <Checkbox 
                  checked={forceResetToggle} 
                  onChange={(e) => setForceResetToggle(e.target.checked)} 
                />
              }
              label="Force Reset Password on Next Sign In"
            />
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 2, pb: 2, pt: 1.5 }}>
          <Button size="small" variant="outlined" onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleExecutePasswordReset}>Execute Reset</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE CUSTOM ROLE DIALOG */}
      <Dialog open={openCreateRole} onClose={() => setOpenCreateRole(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Add Custom System Role
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Role Name" size="small" fullWidth value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          <TextField label="Short Description" size="small" fullWidth value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Assign Scopes</Typography>
          <Box sx={{ border: '1px solid #845EC2', borderRadius: '4px', p: 1, maxHeight: 150, overflowY: 'auto' }}>
            <FormGroup>
              {availablePermissions.map(p => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox size="small" checked={rolePermissions.includes(p.key)} onChange={() => handleTogglePermission(p.key)} />
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
          <TextField label="Employee ID (Optional)" placeholder="e.g. OJ-2026-1122" size="small" fullWidth value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} />
          <TextField label="First Name" size="small" fullWidth value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
          <TextField label="Last Name" size="small" fullWidth value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
          <TextField label="Corporate Email" size="small" fullWidth value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <TextField label="Phone Number" size="small" fullWidth value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
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

      {/* EDIT EMPLOYEE USER DIALOG */}
      <Dialog open={openEditUser} onClose={() => setOpenEditUser(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#845EC2', color: '#FFFFFF', fontWeight: 'bold' }}>
          Edit Employee Account Details
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Employee ID" size="small" fullWidth value={editEmployeeId} onChange={(e) => setEditEmployeeId(e.target.value)} />
          <TextField label="First Name" size="small" fullWidth value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
          <TextField label="Last Name" size="small" fullWidth value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
          <TextField label="Email" size="small" fullWidth value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          <TextField label="Phone Number" size="small" fullWidth value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={editRole} label="Role" onChange={(e) => setEditRole(e.target.value)}>
              {['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select value={editDept} label="Department" onChange={(e) => setEditDept(e.target.value)}>
              {['Administration', 'Sales', 'BCO Operations', 'Client Service', 'HR', 'Operations', 'Field Staff'].map(d => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value)}>
              <MenuItem value="Enabled">Enabled</MenuItem>
              <MenuItem value="Disabled">Disabled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small" variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteUser(selectedUser._id, selectedUser.email)}>
            Delete User
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => setOpenEditUser(false)}>Cancel</Button>
            <Button size="small" variant="contained" onClick={handleSaveEditUser}>Save Changes</Button>
          </Box>
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
