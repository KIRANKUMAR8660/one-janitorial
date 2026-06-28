import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api.js';
import advancedRoutes from './routes/advanced.js';
import analyticsRoutes from './routes/analytics.js';
import integrationsRoutes from './routes/integrations.js';

const app = express();


// Secure headers
app.use(helmet());

// Cross Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (e.g. contracts, uploaded PDFs)
app.use('/uploads', express.static('uploads'));
app.use('/documentation-files', express.static('c:/Users/KIRAN KUMAR/Downloads/one__janitorial/documentation'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount consolidated API routes
app.use('/api', apiRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationsRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;
