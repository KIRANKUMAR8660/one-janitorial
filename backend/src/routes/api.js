import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  enableMFA,
  getEmployees,
  updateEmployee,
  getTasks,
  createTask,
  updateTask,
  getChannels,
  createChannel,
  getMessages,
  getMeetings,
  scheduleMeeting,
  getDeals,
  createDeal,
  updateDealStage,
  getLeads,
  createLead,
  runCRMHygiene,
  getTickets,
  createTicket,
  logTicketCommunication,
  getBcoProjects,
  createBcoProject,
  getJobPostings,
  createJobPosting,
  addApplicant,
  getPerformanceRecords,
  logCoachingSession,
  getAIAgents,
  triggerAgentQuery,
  getSopDocuments,
  uploadSopDocument,
  queryKnowledgeBase,
  getDashboardMetrics,
  getAuditLogs,
  
  // Password Recovery & Security Management
  forgotPassword,
  resetPassword,
  changePassword,
  getAdminUsers,
  adminForcePasswordReset,
  adminUnlockUser,
  adminToggleUserStatus,
  adminGetUserLogs,

  // New CRUD, Voice & Roles
  updateMeeting,
  deleteMeeting,
  uploadVoiceMessage,
  searchVoiceTranscripts,
  getCustomRoles,
  createCustomRole,
  deleteCustomRole
} from '../controllers/apiController.js';
import {
  getCustomAPIs,
  createCustomAPI,
  updateCustomAPI,
  deleteCustomAPI,
  getCustomAPILogs,
  handleCustomAPIExecution
} from '../controllers/customApiController.js';
import {
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  validateWorkflow,
  executeWorkflow,
  getExecutions,
  getLogs,
  parseVariables,
  createAIAgent,
  updateAIAgent,
  uploadWorkflowFile
} from '../controllers/workflowController.js';
import multer from 'multer';

import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { apiLimiter, recoveryLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting
router.use(apiLimiter);

// 1. Authentication
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', protect, logoutUser);
router.post('/auth/mfa/enable', protect, enableMFA);

// 2. Employee Management
router.get('/employees', protect, authorize('Super Admin', 'Admin', 'HR', 'Manager'), getEmployees);
router.put('/employees/:id', protect, authorize('Super Admin', 'Admin', 'HR'), updateEmployee);

// 3. Task Management
router.get('/tasks', protect, getTasks);
router.post('/tasks', protect, createTask);
router.put('/tasks/:id', protect, updateTask);

// 4. Channels and Messages
router.get('/channels', protect, getChannels);
router.post('/channels', protect, createChannel);
router.get('/channels/:channelId/messages', protect, getMessages);

// 5. Meetings
router.get('/meetings', protect, getMeetings);
router.post('/meetings', protect, scheduleMeeting);

// 6. CRM Automation
router.get('/crm/deals', protect, authorize('Super Admin', 'Admin', 'Sales', 'Manager'), getDeals);
router.post('/crm/deals', protect, authorize('Super Admin', 'Admin', 'Sales'), createDeal);
router.put('/crm/deals/:id/stage', protect, authorize('Super Admin', 'Admin', 'Sales'), updateDealStage);
router.get('/crm/leads', protect, authorize('Super Admin', 'Admin', 'Sales', 'Manager'), getLeads);
router.post('/crm/leads', protect, authorize('Super Admin', 'Admin', 'Sales'), createLead);
router.post('/crm/hygiene', protect, authorize('Super Admin', 'Admin', 'Manager'), runCRMHygiene);

// 7. Client Service Ticketing
router.get('/tickets', protect, getTickets);
router.post('/tickets', protect, createTicket);
router.post('/tickets/:id/communication', protect, logTicketCommunication);

// 8. BCO Operations
router.get('/bco/projects', protect, authorize('Super Admin', 'Admin', 'BCO', 'Manager'), getBcoProjects);
router.post('/bco/projects', protect, authorize('Super Admin', 'Admin', 'BCO'), createBcoProject);

// 9. HR Management
router.get('/hr/postings', protect, authorize('Super Admin', 'Admin', 'HR'), getJobPostings);
router.post('/hr/postings', protect, authorize('Super Admin', 'Admin', 'HR'), createJobPosting);
router.post('/hr/postings/:jobId/applicants', protect, authorize('Super Admin', 'Admin', 'HR'), addApplicant);

// 10. Performance Management
router.get('/performance', protect, authorize('Super Admin', 'Admin', 'HR', 'Manager', 'Team Lead'), getPerformanceRecords);
router.post('/performance/coaching/:employeeId', protect, authorize('Super Admin', 'Admin', 'Manager', 'Team Lead'), logCoachingSession);

// 11. AI Control Center
router.get('/ai/agents', protect, getAIAgents);
router.post('/ai/query', protect, triggerAgentQuery);

// 12. RAG Knowledge System
router.get('/sop/documents', protect, getSopDocuments);
router.post('/sop/upload', protect, uploadSopDocument);
router.post('/sop/query', protect, queryKnowledgeBase);

// 13. Dashboard metrics
router.get('/dashboard/metrics', protect, getDashboardMetrics);

// 14. System Administration (Audit logs)
router.get('/admin/audit-logs', protect, authorize('Super Admin', 'Admin'), getAuditLogs);

// 15. Password Reset & Security Management
router.post('/auth/forgot-password', recoveryLimiter, forgotPassword);
router.post('/auth/reset-password', recoveryLimiter, resetPassword);
router.post('/auth/change-password', protect, changePassword);

// Admin features
router.get('/admin/users', protect, authorize('Super Admin', 'Admin'), getAdminUsers);
router.post('/admin/users/:id/reset', protect, authorize('Super Admin', 'Admin'), adminForcePasswordReset);
router.post('/admin/users/:id/unlock', protect, authorize('Super Admin', 'Admin'), adminUnlockUser);
router.post('/admin/users/:id/status', protect, authorize('Super Admin', 'Admin'), adminToggleUserStatus);
router.get('/admin/users/:id/logs', protect, authorize('Super Admin', 'Admin'), adminGetUserLogs);

// 16. Workflow Automation Platform
router.post('/workflows', protect, createWorkflow);
router.get('/workflows', protect, getWorkflows);
router.put('/workflows/:id', protect, updateWorkflow);
router.delete('/workflows/:id', protect, deleteWorkflow);
router.post('/workflows/validate', protect, validateWorkflow);
router.post('/workflows/execute', protect, executeWorkflow);
router.get('/workflows/executions', protect, getExecutions);
router.get('/workflows/logs', protect, getLogs);
router.post('/workflows/parse', protect, parseVariables);
router.post('/workflows/agents', protect, createAIAgent);
router.put('/workflows/agents/:id', protect, updateAIAgent);
router.post('/workflows/upload', protect, upload.single('file'), uploadWorkflowFile);

// 17. Voice Notes & Transcription Messaging
router.post('/chat/upload-voice', protect, upload.single('voice'), uploadVoiceMessage);
router.get('/chat/transcripts', protect, searchVoiceTranscripts);

// 18. Additional Meeting CRUD Controls
router.put('/meetings/:id', protect, updateMeeting);
router.delete('/meetings/:id', protect, deleteMeeting);

// 19. Custom API Generator & Builder
router.get('/custom-apis', protect, authorize('Super Admin', 'Admin'), getCustomAPIs);
router.post('/custom-apis', protect, authorize('Super Admin', 'Admin'), createCustomAPI);
router.put('/custom-apis/:id', protect, authorize('Super Admin', 'Admin'), updateCustomAPI);
router.delete('/custom-apis/:id', protect, authorize('Super Admin', 'Admin'), deleteCustomAPI);
router.get('/custom-apis/:id/logs', protect, authorize('Super Admin', 'Admin'), getCustomAPILogs);
router.all('/custom-run/:version/:path(*)', handleCustomAPIExecution);

// 20. Custom Roles & Dynamic Permissions
router.get('/admin/roles', protect, authorize('Super Admin', 'Admin'), getCustomRoles);
router.post('/admin/roles', protect, authorize('Super Admin', 'Admin'), createCustomRole);
router.delete('/admin/roles/:id', protect, authorize('Super Admin', 'Admin'), deleteCustomRole);

export default router;
