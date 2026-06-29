import React, { useState, useMemo } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import PowerIcon from '@mui/icons-material/Power';
import BusinessIcon from '@mui/icons-material/Business';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk, clearNotifications } from '../store/index.js';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = useSelector(state => state.auth);
  const { notifications } = useSelector(state => state.app);

  const [anchorEl, setAnchorEl] = useState(null);
  const [quickActionEl, setQuickActionEl] = useState(null);
  const [profileEl, setProfileEl] = useState(null);
  const [docAnchorEl, setDocAnchorEl] = useState(null);
  const [modulesAnchorEl, setModulesAnchorEl] = useState(null);

  // Global Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnchor, setSearchAnchor] = useState(null);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenQuickActions = (e) => setQuickActionEl(e.currentTarget);
  const handleCloseQuickActions = () => setQuickActionEl(null);

  const handleOpenProfile = (e) => setProfileEl(e.currentTarget);
  const handleCloseProfile = () => setProfileEl(null);

  const handleToggleSidebar = () => {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    localStorage.setItem('sidebar_collapsed', String(!isCollapsed));
    window.dispatchEvent(new Event('sidebar_toggle'));
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/login');
  };

  // Search items list
  const searchItems = useMemo(() => [
    { label: 'Dashboard Metrics', path: '/', desc: 'Overview of RingCentral, CRM & tickets' },
    { label: 'Task Management', path: '/tasks', desc: 'Create operations workflows and assign tasks' },
    { label: 'Internal Chat / DMs', path: '/chat', desc: 'Realtime chat channels & team messages' },
    { label: 'Ticketing System', path: '/tickets', desc: 'View client operations issues' },
    { label: 'Meeting Schedule', path: '/meetings', desc: 'Calendar view of operations schedules' },
    { label: 'Workflow Dashboard', path: '/workflows', desc: 'Configure automation runs' },
    { label: 'Agents Builder', path: '/workflow/agents', desc: 'Build intelligent operations agents' },
    { label: 'CRM Automation', path: '/crm', desc: 'Lead tracking & HubSpot deals pipeline' },
    { label: 'BCO Operations', path: '/bco', desc: 'Manage local supervisor operations' },
    { label: 'HR Recruitment', path: '/hr', desc: 'Post job requests & view candidate reviews' },
    { label: 'Employee Directory', path: '/employees', desc: 'View complete list of field staff' },
    { label: 'Performance Scorecards', path: '/performance', desc: 'Track employee audit history' },
    { label: 'AI Control Center', path: '/ai', desc: 'Cost analysis & model parameters' },
    { label: 'SOP RAG Library', path: '/rag', desc: 'Search manual procedures & instructions' },
    { label: 'Advanced Operations', path: '/advanced', desc: 'Trigger manual test runs' },
    { label: 'Integration Portal', path: '/integrations', desc: 'Sync third-party API credentials' },
    { label: 'Documentation Portal', path: '/documentation', desc: 'Route explorer, API reference, developer guides, and PDF manuals' },
  ], []);

  // Filter searches based on role permissions
  const filteredSearchItems = useMemo(() => {
    return searchItems.filter(item => {
      if (['/workflows', '/workflow/agents', '/advanced'].includes(item.path)) {
        return ['Super Admin', 'Admin', 'Manager'].includes(role);
      }
      if (item.path === '/crm') {
        return ['Super Admin', 'Admin', 'Sales', 'Manager'].includes(role);
      }
      if (item.path === '/bco') {
        return ['Super Admin', 'Admin', 'BCO', 'Manager'].includes(role);
      }
      if (item.path === '/hr') {
        return ['Super Admin', 'Admin', 'HR'].includes(role);
      }
      if (item.path === '/employees' || item.path === '/performance') {
        return ['Super Admin', 'Admin', 'HR', 'Manager', 'Team Lead'].includes(role);
      }
      if (item.path === '/integrations') {
        return ['Super Admin', 'Admin'].includes(role);
      }
      return true;
    });
  }, [searchItems, role]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return filteredSearchItems.filter(item => 
      item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );
  }, [searchQuery, filteredSearchItems]);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: '#845EC2', // Primary Violet
        height: 56, 
        borderBottom: '1px solid #F3C5FF', // Pastel Pink Border Accent
        boxShadow: 'none',
        justifyContent: 'center'
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', height: 56, px: 2, display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Side: Collapse Toggle, Logo, Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleToggleSidebar} 
            sx={{ color: '#FFFFFF', mr: 0.5, p: 0.5 }}
            title="Toggle Sidebar"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          
          <Box component="img" src="/logo.jpeg" alt="One Janitorial Logo" sx={{ height: 32, marginRight: 1, borderRadius: '4px' }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#FEFEDF', fontSize: '0.9rem', display: { xs: 'none', sm: 'block' } }}>
            ONE JANITORIAL STAFF PLATFORM
          </Typography>
        </Box>

        {/* Center: Global Search Input */}
        <Box sx={{ position: 'relative', width: { xs: 160, sm: 280, md: 320 } }}>
          <TextField
            size="small"
            placeholder="Global search (e.g. CRM, RAG)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchAnchor(e.currentTarget);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#F3C5FF' }} />
                </InputAdornment>
              ),
              style: { 
                height: 32, 
                fontSize: '0.8rem', 
                backgroundColor: 'rgba(254, 254, 223, 0.15)',
                color: '#FEFEDF',
                borderRadius: '4px'
              }
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(254,254,223,0.3)' },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00C9A7' }
            }}
          />
          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <Paper 
              sx={{ 
                position: 'absolute', 
                top: 38, 
                left: 0, 
                right: 0, 
                maxHeight: 300, 
                overflowY: 'auto', 
                zIndex: 9999,
                border: '1px solid #845EC2',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                backgroundColor: '#FEFEDF'
              }}
            >
              <List dense sx={{ py: 0 }}>
                {searchResults.map((item, idx) => (
                  <ListItem 
                    button 
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setSearchQuery('');
                    }}
                    sx={{ 
                      borderBottom: idx < searchResults.length - 1 ? '1px solid #845EC2' : 'none',
                      py: 0.75,
                      '&:hover': { backgroundColor: 'rgba(243, 197, 255, 0.2)' }
                    }}
                  >
                    <ListItemText 
                      primary={item.label} 
                      secondary={item.desc}
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748B' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Right Side: Quick Actions, Notifications, User details, Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Quick Actions Dropdown */}
          <Button
            size="small"
            variant="contained"
            onClick={handleOpenQuickActions}
            startIcon={<AddIcon fontSize="small" />}
            endIcon={<ArrowDropDownIcon fontSize="small" />}
            sx={{ 
              height: 32, 
              borderRadius: '4px', 
              backgroundColor: '#00C9A7', // Primary Cyan Action Button
              color: '#FFFFFF', 
              '&:hover': { backgroundColor: '#00a88c' } 
            }}
          >
            Quick Create
          </Button>
          <Menu
            anchorEl={quickActionEl}
            open={Boolean(quickActionEl)}
            onClose={handleCloseQuickActions}
            PaperProps={{ sx: { width: 180, mt: 0.5, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
          >
            <MenuItem onClick={() => { handleCloseQuickActions(); navigate('/tasks'); }} sx={{ fontSize: '0.85rem' }}>Create Operations Task</MenuItem>
            <MenuItem onClick={() => { handleCloseQuickActions(); navigate('/tickets'); }} sx={{ fontSize: '0.85rem' }}>Log Client Ticket</MenuItem>
            <MenuItem onClick={() => { handleCloseQuickActions(); navigate('/crm'); }} sx={{ fontSize: '0.85rem' }}>Register HubSpot Lead</MenuItem>
            <MenuItem onClick={() => { handleCloseQuickActions(); navigate('/meetings'); }} sx={{ fontSize: '0.85rem' }}>Schedule Meeting</MenuItem>
          </Menu>

          {/* Documentation Dropdown */}
          <Button
            size="small"
            variant="contained"
            onClick={(e) => setDocAnchorEl(e.currentTarget)}
            startIcon={<AutoStoriesIcon fontSize="small" />}
            endIcon={<ArrowDropDownIcon fontSize="small" />}
            sx={{ 
              height: 32, 
              borderRadius: '4px', 
              backgroundColor: '#FF9671', // Salmon pink accent color
              color: '#FFFFFF', 
              '&:hover': { backgroundColor: '#e07f59' } 
            }}
          >
            Documentation
          </Button>
          <Menu
            anchorEl={docAnchorEl}
            open={Boolean(docAnchorEl)}
            onClose={() => setDocAnchorEl(null)}
            PaperProps={{ sx: { width: 220, mt: 0.5, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
          >
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=user'); }} sx={{ fontSize: '0.85rem' }}>User Guide</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=admin'); }} sx={{ fontSize: '0.85rem' }}>Admin Guide</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=dev'); }} sx={{ fontSize: '0.85rem' }}>Developer Guide</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=api'); }} sx={{ fontSize: '0.85rem' }}>API Reference</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=routes'); }} sx={{ fontSize: '0.85rem' }}>Route Explorer</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=components'); }} sx={{ fontSize: '0.85rem' }}>Component Library</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=database'); }} sx={{ fontSize: '0.85rem' }}>Database Schema</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=workflows'); }} sx={{ fontSize: '0.85rem' }}>Workflow Documentation</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=agents'); }} sx={{ fontSize: '0.85rem' }}>AI Agent Documentation</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=integrations'); }} sx={{ fontSize: '0.85rem' }}>Integration Guide</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=troubleshooting'); }} sx={{ fontSize: '0.85rem' }}>Troubleshooting</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=release'); }} sx={{ fontSize: '0.85rem' }}>Release Notes</MenuItem>
            <MenuItem onClick={() => { setDocAnchorEl(null); navigate('/documentation?tab=dashboard'); }} sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#845EC2' }}>PDF Export</MenuItem>
          </Menu>

          {/* Modules Menu Dropdown */}
          <Button
            size="small"
            variant="contained"
            onClick={(e) => setModulesAnchorEl(e.currentTarget)}
            startIcon={<MenuIcon fontSize="small" />}
            endIcon={<ArrowDropDownIcon fontSize="small" />}
            sx={{ 
              height: 32, 
              borderRadius: '4px', 
              backgroundColor: '#845EC2', // Primary Violet accent button
              color: '#FFFFFF', 
              '&:hover': { backgroundColor: '#6e4db3' } 
            }}
          >
            Modules Menu
          </Button>
          <Menu
            anchorEl={modulesAnchorEl}
            open={Boolean(modulesAnchorEl)}
            onClose={() => setModulesAnchorEl(null)}
            PaperProps={{ sx: { width: 220, mt: 0.5, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
          >
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/'); }} sx={{ fontSize: '0.85rem' }}>Dashboard</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/analytics'); }} sx={{ fontSize: '0.85rem' }}>Analytics</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/crm'); }} sx={{ fontSize: '0.85rem' }}>CRM</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/tickets'); }} sx={{ fontSize: '0.85rem' }}>Tickets</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/hr'); }} sx={{ fontSize: '0.85rem' }}>HR</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/workflows'); }} sx={{ fontSize: '0.85rem' }}>Workflow Builder</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/workflow/agents'); }} sx={{ fontSize: '0.85rem' }}>AI Agents</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/reports'); }} sx={{ fontSize: '0.85rem' }}>Reports</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/integrations'); }} sx={{ fontSize: '0.85rem' }}>Integrations</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/monitoring'); }} sx={{ fontSize: '0.85rem' }}>Monitoring</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/documentation'); }} sx={{ fontSize: '0.85rem' }}>Documentation</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/meetings'); }} sx={{ fontSize: '0.85rem' }}>Meetings</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/admin-password-management'); }} sx={{ fontSize: '0.85rem' }}>Password Management</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/settings'); }} sx={{ fontSize: '0.85rem' }}>Settings</MenuItem>
            <MenuItem onClick={() => { setModulesAnchorEl(null); navigate('/profile'); }} sx={{ fontSize: '0.85rem' }}>Profile</MenuItem>
          </Menu>

          {/* Notifications Icon and list */}
          <IconButton color="inherit" onClick={handleOpenMenu} sx={{ p: 0.5 }}>
            <Badge badgeContent={notifications.length} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#00C9A7' } }}>
              <NotificationsIcon fontSize="small" sx={{ color: '#FFFFFF' }} />
            </Badge>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: { width: 320, maxHeight: 400, borderRadius: '4px', border: '1px solid #845EC2', padding: 1, backgroundColor: '#FEFEDF' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>Notifications</Typography>
              <Button size="small" onClick={() => dispatch(clearNotifications())}>Clear</Button>
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: '0.85rem' }}>No new notifications</MenuItem>
            ) : (
              <List dense sx={{ py: 0 }}>
                {notifications.map((n, idx) => (
                  <ListItem key={idx} divider={idx < notifications.length - 1} sx={{ px: 1 }}>
                    <ListItemText 
                      primary={n.title} 
                      secondary={n.message} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold', color: '#1E293B' }}
                      secondaryTypographyProps={{ variant: 'caption', color: '#64748B' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Menu>

          {/* User Profile Dropdown Button */}
          <Box 
            onClick={handleOpenProfile}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
              p: '4px 8px',
              borderRadius: '4px',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
            }}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.85rem', bgcolor: '#00C9A7' }}>
              {email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ color: '#FEFEDF', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1 }}>
                {email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" sx={{ color: '#F3C5FF', fontSize: '0.65rem', fontWeight: 'bold', mt: 0.25 }}>
                {role}
              </Typography>
            </Box>
            <ArrowDropDownIcon fontSize="small" sx={{ color: '#F3C5FF' }} />
          </Box>

          <Menu
            anchorEl={profileEl}
            open={Boolean(profileEl)}
            onClose={handleCloseProfile}
            PaperProps={{ sx: { width: 200, mt: 0.5, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E293B' }}>{email}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>{role}</Typography>
            </Box>
            <Divider />
            <MenuItem 
              onClick={() => { handleCloseProfile(); navigate('/change-password'); }}
              sx={{ fontSize: '0.85rem', gap: 1 }}
            >
              <KeyIcon fontSize="inherit" sx={{ color: '#845EC2' }} />
              Security Settings
            </MenuItem>
            {['Super Admin', 'Admin'].includes(role) && (
              <MenuItem 
                onClick={() => { handleCloseProfile(); navigate('/integrations'); }}
                sx={{ fontSize: '0.85rem', gap: 1 }}
              >
                <PowerIcon fontSize="inherit" sx={{ color: '#845EC2' }} />
                Integrations Portal
              </MenuItem>
            )}
            <Divider />
            <MenuItem 
              onClick={() => { handleCloseProfile(); handleLogout(); }}
              sx={{ fontSize: '0.85rem', gap: 1, color: '#EF4444' }}
            >
              <LogoutIcon fontSize="inherit" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
