import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  uploadDataset,
  prepareDataset,
  getDatasetStats,
  runAdvancedAnalytics,
  getBusinessAnalytics,
  queryAIAnalytics,
  getDashboards,
  createDashboard,
  updateDashboardWidgets,
  shareDashboardReport,
  getSharedReportByKey,
  createScheduledReport,
  getDatasetsCatalog,
  getMonitoringMetrics
} from '../controllers/analyticsController.js';

// Setup file ingestion destination storage
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

const router = express.Router();

// Apply authentication middleware on all routes
router.use(protect);

// 1. Data Ingestion & Catalog API
router.post('/upload', authorize('Super Admin', 'Admin', 'Manager'), upload.single('file'), uploadDataset);
router.get('/datasets', getDatasetsCatalog);

// 2. Data Preparation Studio API
router.post('/prepare', authorize('Super Admin', 'Admin', 'Manager'), prepareDataset);

// 3. Descriptive & Advanced Analytics API
router.get('/stats/:id', getDatasetStats);
router.post('/advanced', authorize('Super Admin', 'Admin', 'Manager'), runAdvancedAnalytics);
router.get('/business', getBusinessAnalytics);

// 4. AI Analytics Assistant API
router.post('/ai-query', queryAIAnalytics);

// 5. Dashboard Configuration APIs
router.get('/dashboards', getDashboards);
router.post('/dashboards', authorize('Super Admin', 'Admin', 'Manager'), createDashboard);
router.put('/dashboards/:id/widgets', authorize('Super Admin', 'Admin', 'Manager'), updateDashboardWidgets);

// 6. Shareable & Export API
router.post('/share', authorize('Super Admin', 'Admin', 'Manager'), shareDashboardReport);
router.get('/share/:key', getSharedReportByKey);

// 7. Scheduled reporting scheduler
router.post('/schedule', authorize('Super Admin', 'Admin', 'Manager'), createScheduledReport);

// 8. Systems Usage Audit & Performance Monitoring API
router.get('/monitoring', authorize('Super Admin', 'Admin', 'Manager'), getMonitoringMetrics);

export default router;
