import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ChatIcon from '@mui/icons-material/Chat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MemoryIcon from '@mui/icons-material/Memory';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TerminalIcon from '@mui/icons-material/Terminal';
import KeyIcon from '@mui/icons-material/Key';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PowerIcon from '@mui/icons-material/Power';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HubIcon from '@mui/icons-material/Hub';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useSelector(state => state.auth);

  // Collapsible navigation state synced with localStorage
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  // Switcher menu anchors
  const [switcherAnchor, setSwitcherAnchor] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('HQ Workspace');

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
    // Dispatch window custom event to inform PrivateLayout container in App.jsx
    window.dispatchEvent(new Event('sidebar_toggle'));
  };

  // Define sidebar links mapped to routing endpoints & custom icons
  const menuItems = [
    { text: 'Dashboard Metrics', path: '/', icon: <DashboardIcon fontSize="small" /> },
    { text: 'Analytics', path: '/analytics', icon: <AssessmentIcon fontSize="small" /> },
    { text: 'System Monitoring', path: '/monitoring', icon: <MonitorHeartIcon fontSize="small" /> },
    { text: 'Task Management', path: '/tasks', icon: <PlaylistAddCheckIcon fontSize="small" /> },
    { text: 'Internal Chat / DMs', path: '/chat', icon: <ChatIcon fontSize="small" /> },
    { text: 'Ticketing System', path: '/tickets', icon: <ConfirmationNumberIcon fontSize="small" /> },
    { text: 'Meeting Schedule', path: '/meetings', icon: <EventIcon fontSize="small" /> },
  ];

  // Role restricted links
  if (['Super Admin', 'Admin', 'Manager'].includes(role)) {
    menuItems.push({ text: 'Workflow Dashboard', path: '/workflows', icon: <AccountTreeIcon fontSize="small" /> });
    menuItems.push({ text: 'Agents Builder', path: '/workflow/agents', icon: <SmartToyIcon fontSize="small" /> });
    menuItems.push({ text: 'Marketplace Templates', path: '/workflow/marketplace', icon: <StorefrontIcon fontSize="small" /> });
  }

  if (['Super Admin', 'Admin', 'Sales', 'Manager'].includes(role)) {
    menuItems.push({ text: 'CRM Automation', path: '/crm', icon: <ContactPageIcon fontSize="small" /> });
    menuItems.push({ text: 'HubSpot Diagnostics', path: '/hubspot', icon: <HubIcon fontSize="small" /> });
  }

  if (['Super Admin', 'Admin', 'BCO', 'Manager'].includes(role)) {
    menuItems.push({ text: 'BCO Operations', path: '/bco', icon: <BusinessIcon fontSize="small" /> });
  }

  if (['Super Admin', 'Admin', 'HR'].includes(role)) {
    menuItems.push({ text: 'HR Recruitment', path: '/hr', icon: <AssignmentIndIcon fontSize="small" /> });
  }

  if (['Super Admin', 'Admin', 'HR', 'Manager', 'Team Lead'].includes(role)) {
    menuItems.push({ text: 'Employee Directory', path: '/employees', icon: <PeopleIcon fontSize="small" /> });
    menuItems.push({ text: 'Performance scorecards', path: '/performance', icon: <AssessmentIcon fontSize="small" /> });
  }

  // AI & RAG system
  menuItems.push({ text: 'AI Control Center', path: '/ai', icon: <MemoryIcon fontSize="small" /> });
  menuItems.push({ text: 'SOP RAG Library', path: '/rag', icon: <AutoStoriesIcon fontSize="small" /> });
  menuItems.push({ text: 'Documentation Portal', path: '/documentation', icon: <AutoStoriesIcon fontSize="small" /> });

  // Custom added diagnostics / reports / settings dashboards
  menuItems.push({ text: 'Supabase Health', path: '/supabase-health', icon: <CloudQueueIcon fontSize="small" /> });
  menuItems.push({ text: 'API Communication', path: '/api-communication', icon: <TroubleshootIcon fontSize="small" /> });
  menuItems.push({ text: 'Node Library', path: '/nodes', icon: <DynamicFormIcon fontSize="small" /> });
  menuItems.push({ text: 'Reports', path: '/reports', icon: <SummarizeIcon fontSize="small" /> });
  menuItems.push({ text: 'System Readiness Score', path: '/readiness', icon: <AssignmentTurnedInIcon fontSize="small" /> });
  menuItems.push({ text: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> });
  menuItems.push({ text: 'Profile', path: '/profile', icon: <PersonIcon fontSize="small" /> });

  // Advanced Console
  if (['Super Admin', 'Admin', 'Manager'].includes(role)) {
    menuItems.push({ text: 'Advanced Operations', path: '/advanced', icon: <TerminalIcon fontSize="small" /> });
  }

  // User self-service security
  menuItems.push({ text: 'Change Password', path: '/change-password', icon: <KeyIcon fontSize="small" /> });

  // System administration & Password Management
  if (['Super Admin', 'Admin'].includes(role)) {
    menuItems.push({ text: 'System Admin Logs', path: '/admin', icon: <ListAltIcon fontSize="small" /> });
    menuItems.push({ text: 'Password Management', path: '/admin-password-management', icon: <AdminPanelSettingsIcon fontSize="small" /> });
    menuItems.push({ text: 'Integration Portal', path: '/integrations', icon: <PowerIcon fontSize="small" /> });
  }

  const drawerWidth = isCollapsed ? 64 : 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.2s ease',
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          borderRadius: 0, 
          borderRight: '1px solid #845EC2',
          backgroundColor: '#845EC2', // Primary Violet Background
          color: '#FEFEDF', // Background Ivory text
          top: 56, // Push below Top Navigation
          height: 'calc(100vh - 56px)',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        },
      }}
    >
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
        {/* Workspace Switcher */}
        {!isCollapsed ? (
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column' }}>
            <Box 
              onClick={(e) => setSwitcherAnchor(e.currentTarget)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer',
                p: '6px 12px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#FEFEDF', fontSize: '0.85rem' }}>
                {currentWorkspace}
              </Typography>
              <UnfoldMoreIcon sx={{ fontSize: 16, color: '#F3C5FF' }} />
            </Box>
            <Menu
              anchorEl={switcherAnchor}
              open={Boolean(switcherAnchor)}
              onClose={() => setSwitcherAnchor(null)}
              PaperProps={{ sx: { width: 210, mt: 0.5, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
            >
              {['HQ Workspace', 'Sales Workspace', 'Operations Workspace', 'HR Workspace'].map(ws => (
                <MenuItem 
                  key={ws} 
                  selected={ws === currentWorkspace}
                  onClick={() => { setCurrentWorkspace(ws); setSwitcherAnchor(null); }}
                  sx={{ fontSize: '0.85rem' }}
                >
                  {ws}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Switch Workspace" placement="right">
              <IconButton size="small" onClick={(e) => setSwitcherAnchor(e.currentTarget)} sx={{ color: '#F3C5FF' }}>
                <BusinessIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={switcherAnchor}
              open={Boolean(switcherAnchor)}
              onClose={() => setSwitcherAnchor(null)}
              PaperProps={{ sx: { width: 210, border: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
            >
              {['HQ Workspace', 'Sales Workspace', 'Operations Workspace', 'HR Workspace'].map(ws => (
                <MenuItem 
                  key={ws} 
                  selected={ws === currentWorkspace}
                  onClick={() => { setCurrentWorkspace(ws); setSwitcherAnchor(null); }}
                  sx={{ fontSize: '0.85rem' }}
                >
                  {ws}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(254, 254, 223, 0.2)' }} />

        {/* Navigation title group */}
        {!isCollapsed && (
          <Typography variant="caption" sx={{ color: '#F3C5FF', fontWeight: 700, letterSpacing: '0.05em', px: 2, py: 1, display: 'block', mt: 1 }}>
            MAIN MENU
          </Typography>
        )}

        <List dense sx={{ padding: '0 8px', mt: isCollapsed ? 1 : 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            const buttonContent = (
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: '4px',
                  height: 36,
                  px: isCollapsed ? 0 : 1.5,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  transition: 'all 0.1s ease',
                  backgroundColor: isActive ? '#FEFEDF' : 'transparent', // Ivory active background
                  color: isActive ? '#845EC2' : '#FEFEDF', // Violet active text, Ivory inactive text
                  '&:hover': {
                    backgroundColor: isActive ? '#FEFEDF' : 'rgba(243, 197, 255, 0.25)', // Hover state Pastel Pink
                    color: isActive ? '#845EC2' : '#FFFFFF',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#FEFEDF !important',
                    color: '#845EC2',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isCollapsed ? 0 : 32, 
                  color: isActive ? '#845EC2' : '#F3C5FF', // Active Violet, Inactive Pink
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 400, fontSize: '0.85rem' }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                {isCollapsed ? (
                  <Tooltip title={item.text} placement="right" arrow>
                    <Box sx={{ width: '100%' }}>{buttonContent}</Box>
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Collapse/Expand Control Panel at bottom */}
      <Box sx={{ p: 1, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', borderTop: '1px solid rgba(254,254,223,0.2)' }}>
        <IconButton size="small" onClick={toggleSidebar} sx={{ color: '#F3C5FF' }}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
