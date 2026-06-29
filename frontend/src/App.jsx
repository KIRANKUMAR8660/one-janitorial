import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from './store/index.js';
import { initSocket, disconnectSocket } from './socket.js';
import { Box, Toolbar, ThemeProvider, CssBaseline } from '@mui/material';

import theme from './theme.js';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Chat from './pages/Chat.jsx';
import Tickets from './pages/Tickets.jsx';
import Meetings from './pages/Meetings.jsx';
import CRM from './pages/CRM.jsx';
import BCO from './pages/BCO.jsx';
import HR from './pages/HR.jsx';
import Employees from './pages/Employees.jsx';
import Performance from './pages/Performance.jsx';
import AIControl from './pages/AIControl.jsx';
import RagKnowledge from './pages/RagKnowledge.jsx';
import AdminLogs from './pages/AdminLogs.jsx';
import AdvancedConsole from './pages/AdvancedConsole.jsx';
import Analytics from './pages/Analytics.jsx';
import AnalyticsMonitoring from './pages/AnalyticsMonitoring.jsx';
import Integrations from './pages/Integrations.jsx';
import DocumentationCenter from './pages/DocumentationCenter.jsx';

import WorkflowDashboard from './pages/workflows/WorkflowDashboard.jsx';
import WorkflowBuilder from './pages/WorkflowBuilder.jsx';
import WorkflowAgents from './pages/workflows/WorkflowAgents.jsx';
import WorkflowMarketplace from './pages/workflows/WorkflowMarketplace.jsx';

// Recovery & Security Pages
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import AdminPasswordManagement from './pages/AdminPasswordManagement.jsx';

// Custom Diagnostics, Reports & Scorecard Pages
import HubSpotDiagnostics from './pages/HubSpotDiagnostics.jsx';
import SupabaseHealth from './pages/SupabaseHealth.jsx';
import APICommunication from './pages/APICommunication.jsx';
import NodeLibrary from './pages/NodeLibrary.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import SystemReadiness from './pages/SystemReadiness.jsx';

// Route redirection helpers for Meetings
const MeetingCreateRedirect = () => <Navigate to="/meetings?action=create" replace />;
const MeetingDetailsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/meetings?id=${id}`} replace />;
};
const MeetingEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/meetings?id=${id}&action=edit`} replace />;
};

// Route redirection helpers for Password Management and Users
const PasswordManagementRedirect = () => <Navigate to="/admin-password-management" replace />;
const UserCreateRedirect = () => <Navigate to="/admin-password-management?action=create" replace />;
const UserDetailsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin-password-management?id=${id}`} replace />;
};
const UserEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin-password-management?id=${id}&action=edit`} replace />;
};

const PrivateLayout = ({ children }) => {
  const { accessToken } = useSelector(state => state.auth);
  const [isCollapsed, setIsCollapsed] = React.useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  React.useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem('sidebar_collapsed') === 'true');
    };
    window.addEventListener('sidebar_toggle', handleToggle);
    return () => window.removeEventListener('sidebar_toggle', handleToggle);
  }, []);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const drawerWidth = isCollapsed ? 64 : 240;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box 
        component="main" 
        className="page-fade-in"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: 'transparent', 
          minHeight: '100vh', 
          width: `calc(100% - ${drawerWidth}px)`,
          transition: 'width 0.2s ease',
        }}
      >
        <Toolbar variant="dense" />
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const dispatch = useDispatch();
  const { accessToken, userId } = useSelector(state => state.auth);

  // Restore credentials
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Connect socket.io client when authenticated
  useEffect(() => {
    if (accessToken && userId) {
      initSocket(userId, dispatch);
    } else {
      disconnectSocket();
    }
  }, [accessToken, userId, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public login & recovery */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Secure Routes */}
          <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/tasks" element={<PrivateLayout><Tasks /></PrivateLayout>} />
          <Route path="/chat" element={<PrivateLayout><Chat /></PrivateLayout>} />
          <Route path="/tickets" element={<PrivateLayout><Tickets /></PrivateLayout>} />
          <Route path="/meetings" element={<PrivateLayout><Meetings /></PrivateLayout>} />
          <Route path="/crm" element={<PrivateLayout><CRM /></PrivateLayout>} />
          <Route path="/bco" element={<PrivateLayout><BCO /></PrivateLayout>} />
          <Route path="/hr" element={<PrivateLayout><HR /></PrivateLayout>} />
          <Route path="/employees" element={<PrivateLayout><Employees /></PrivateLayout>} />
          <Route path="/performance" element={<PrivateLayout><Performance /></PrivateLayout>} />
          <Route path="/ai" element={<PrivateLayout><AIControl /></PrivateLayout>} />
          <Route path="/rag" element={<PrivateLayout><RagKnowledge /></PrivateLayout>} />
          <Route path="/admin" element={<PrivateLayout><AdminLogs /></PrivateLayout>} />
          <Route path="/advanced" element={<PrivateLayout><AdvancedConsole /></PrivateLayout>} />
          <Route path="/analytics" element={<PrivateLayout><Analytics /></PrivateLayout>} />
          <Route path="/monitoring" element={<PrivateLayout><AnalyticsMonitoring /></PrivateLayout>} />
          <Route path="/integrations" element={<PrivateLayout><Integrations /></PrivateLayout>} />
          <Route path="/documentation" element={<PrivateLayout><DocumentationCenter /></PrivateLayout>} />

          {/* Workflows routes */}
          <Route path="/workflows" element={<PrivateLayout><WorkflowDashboard /></PrivateLayout>} />
          <Route path="/workflow/builder/:id" element={<PrivateLayout><WorkflowBuilder /></PrivateLayout>} />
          <Route path="/workflow/agents" element={<PrivateLayout><WorkflowAgents /></PrivateLayout>} />
          <Route path="/workflow/marketplace" element={<PrivateLayout><WorkflowMarketplace /></PrivateLayout>} />
          
          {/* Password Security Profile & Admin controls */}
          <Route path="/change-password" element={<PrivateLayout><ChangePassword /></PrivateLayout>} />
          <Route path="/admin-password-management" element={<PrivateLayout><AdminPasswordManagement /></PrivateLayout>} />

          {/* Meeting Routes */}
          <Route path="/meetings" element={<PrivateLayout><Meetings /></PrivateLayout>} />
          <Route path="/meetings/create" element={<PrivateLayout><MeetingCreateRedirect /></PrivateLayout>} />
          <Route path="/meetings/:id" element={<PrivateLayout><MeetingDetailsRedirect /></PrivateLayout>} />
          <Route path="/meetings/edit/:id" element={<PrivateLayout><MeetingEditRedirect /></PrivateLayout>} />

          {/* Password Management & Users Redirect Routes */}
          <Route path="/password-management" element={<PrivateLayout><PasswordManagementRedirect /></PrivateLayout>} />
          <Route path="/users" element={<PrivateLayout><PasswordManagementRedirect /></PrivateLayout>} />
          <Route path="/users/create" element={<PrivateLayout><UserCreateRedirect /></PrivateLayout>} />
          <Route path="/users/:id" element={<PrivateLayout><UserDetailsRedirect /></PrivateLayout>} />
          <Route path="/users/edit/:id" element={<PrivateLayout><UserEditRedirect /></PrivateLayout>} />

          {/* Custom Diagnostics, Reports & Scorecard Routes */}
          <Route path="/hubspot" element={<PrivateLayout><HubSpotDiagnostics /></PrivateLayout>} />
          <Route path="/supabase-health" element={<PrivateLayout><SupabaseHealth /></PrivateLayout>} />
          <Route path="/api-communication" element={<PrivateLayout><APICommunication /></PrivateLayout>} />
          <Route path="/nodes" element={<PrivateLayout><NodeLibrary /></PrivateLayout>} />
          <Route path="/reports" element={<PrivateLayout><Reports /></PrivateLayout>} />
          <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />
          <Route path="/profile" element={<PrivateLayout><Profile /></PrivateLayout>} />
          <Route path="/readiness" element={<PrivateLayout><SystemReadiness /></PrivateLayout>} />

          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
