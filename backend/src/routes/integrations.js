import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getIntegrations,
  toggleIntegrationStatus,
  updateIntegrationConfig,
  testConnection,
  rotateSecret,
  getSecretsList,
  getAuditLogs,
  getHealthMetrics
} from '../controllers/integrationsController.js';

const router = express.Router();

// Apply auth protection globally on all integrations routing
router.use(protect);
// Restrict integrations configurations and credentials rotations to Super Admin and Admin roles only
router.use(authorize('Super Admin', 'Admin'));

// 1. Core Integration Configs & Actions
router.get('/', getIntegrations);
router.put('/:id/status', toggleIntegrationStatus);
router.put('/:id/config', updateIntegrationConfig);
router.post('/test', testConnection);

// 2. Encrypted Secrets Vault Management
router.post('/secrets', rotateSecret);
router.get('/secrets', getSecretsList);

// 3. Systems logs, administrative audit trails & real-time resources
router.get('/audit', getAuditLogs);
router.get('/health', getHealthMetrics);

export default router;
