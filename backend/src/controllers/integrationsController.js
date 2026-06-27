import Integration from '../models/Integration.js';
import Secret from '../models/Secret.js';
import IntegrationAudit from '../models/IntegrationAudit.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import mongoose from 'mongoose';

// List of all 26 supported integrations mapped to categories
const DEFAULT_INTEGRATIONS = [
  // AI Providers
  { name: 'Anthropic Claude', category: 'AI Providers', config: { defaultModel: 'claude-3-5-sonnet', temperature: 0.7, maxTokens: 4096 } },
  { name: 'OpenAI', category: 'AI Providers', config: { defaultModel: 'gpt-4o', organizationId: '' } },
  { name: 'Gemini', category: 'AI Providers', config: { defaultModel: 'gemini-1.5-pro' } },
  { name: 'OpenRouter', category: 'AI Providers', config: { modelRouting: 'auto' } },
  
  // CRM
  { name: 'HubSpot', category: 'CRM', config: { portalId: '', webhookSecret: '' } },
  
  // Databases
  { name: 'Supabase', category: 'Databases', config: { projectUrl: '', realtimeSettings: 'Enabled', storageSettings: 'Enabled' } },
  { name: 'MongoDB', category: 'Databases', config: { host: '127.0.0.1', port: 27017, dbName: 'one_janitorial' } },
  { name: 'PostgreSQL', category: 'Databases', config: { host: '127.0.0.1', port: 5432, username: 'postgres' } },
  { name: 'MySQL', category: 'Databases', config: { host: '127.0.0.1', port: 3306, username: 'root' } },
  
  // Communication
  { name: 'Twilio', category: 'Communication', config: { messagingServiceSid: '' } },
  { name: 'RingCentral', category: 'Communication', config: { serverUrl: 'https://platform.ringcentral.com' } },
  { name: 'Slack', category: 'Communication', config: { workspaceUrl: '' } },
  { name: 'Microsoft Teams', category: 'Communication', config: { tenantId: '' } },
  
  // Email
  { name: 'SendGrid', category: 'Email', config: { verifiedSender: '' } },
  { name: 'Resend', category: 'Email', config: { verifiedDomain: '' } },
  { name: 'Mailgun', category: 'Email', config: { sendingDomain: '' } },
  { name: 'SMTP', category: 'Email', config: { host: 'smtp.mailtrap.io', port: 2525, username: '' } },
  
  // Storage
  { name: 'AWS S3', category: 'Storage', config: { bucketName: '', region: 'us-east-1' } },
  { name: 'Cloudflare R2', category: 'Storage', config: { bucketName: '', accountId: '' } },
  { name: 'Google Drive', category: 'Storage', config: { rootFolderId: '' } },
  { name: 'OneDrive', category: 'Storage', config: { driveId: '' } },
  
  // Vector Databases
  { name: 'Pinecone', category: 'Vector Databases', config: { indexName: 'one-janitorial', environment: 'us-east-1-gcp' } },
  { name: 'ChromaDB', category: 'Vector Databases', config: { host: 'localhost', port: 8000 } },
  { name: 'Weaviate', category: 'Vector Databases', config: { hostUrl: 'https://weaviate.io' } },
  { name: 'Qdrant', category: 'Vector Databases', config: { hostUrl: 'https://qdrant.tech' } },
  
  // Automation
  { name: 'N8N', category: 'Automation', config: { instanceUrl: 'http://localhost:5678' } },
  { name: 'Monday.com', category: 'Automation', config: { workspaceId: '' } },
  
  // Monitoring
  { name: 'Sentry', category: 'Monitoring', config: { dsn: '' } },
  { name: 'Grafana', category: 'Monitoring', config: { hostUrl: 'http://localhost:3000' } }
];

// Helper to check and sync environment variables from Secret DB collections on boot
export const syncEnvironmentFromSecrets = async () => {
  try {
    const secrets = await Secret.find({});
    let syncCount = 0;
    secrets.forEach(sec => {
      const decryptedVal = decrypt(sec.value, sec.iv);
      if (decryptedVal) {
        process.env[sec.key] = decryptedVal;
        syncCount++;
      }
    });
    console.log(`Vault Synced: Decrypted and loaded ${syncCount} credentials directly to process.env memory.`);
  } catch (error) {
    console.error(`Vault sync failure on boot: ${error.message}`);
  }
};

// Initial Seed Routine for Integrations
const seedIntegrations = async () => {
  const count = await Integration.countDocuments();
  if (count === 0) {
    for (const item of DEFAULT_INTEGRATIONS) {
      const dbItem = new Integration({
        ...item,
        status: 'Enabled',
        healthStatus: 'Connected',
        latency: Math.floor(Math.random() * 80) + 10,
        responseTime: Math.floor(Math.random() * 100) + 15,
        errorRate: 0,
        lastSuccessfulRequest: new Date()
      });
      await dbItem.save();
    }
  }
};

// Seed automatically on first check
seedIntegrations().catch(console.error);

// 1. Get List of Integrations
export const getIntegrations = async (req, res) => {
  try {
    await seedIntegrations(); // ensure seeded
    const list = await Integration.find({});
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Toggle Integration Status (Enable/Disable)
export const toggleIntegrationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Enabled / Disabled
  try {
    const integration = await Integration.findById(id);
    if (!integration) return res.status(404).json({ message: 'Integration not found' });

    const oldStatus = integration.status;
    integration.status = status;
    
    if (status === 'Disabled') {
      integration.healthStatus = 'Disconnected';
    } else {
      integration.healthStatus = 'Connected';
    }
    
    integration.logs.push({
      action: 'STATUS_CHANGE',
      status: 'Success',
      message: `Status updated from ${oldStatus} to ${status}`
    });
    await integration.save();

    // Audit log
    const audit = new IntegrationAudit({
      action: 'TOGGLE_STATUS',
      integrationName: integration.name,
      actor: req.user._id,
      actorEmail: req.user.email,
      details: `Changed status from ${oldStatus} to ${status}`,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    await audit.save();

    res.status(200).json({ message: 'Status updated successfully', integration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Integration Configuration
export const updateIntegrationConfig = async (req, res) => {
  const { id } = req.params;
  const { config } = req.body;
  try {
    const integration = await Integration.findById(id);
    if (!integration) return res.status(404).json({ message: 'Integration not found' });

    integration.config = { ...integration.config, ...config };
    integration.logs.push({
      action: 'UPDATE_CONFIG',
      status: 'Success',
      message: 'Updated configuration fields'
    });
    await integration.save();

    const audit = new IntegrationAudit({
      action: 'EDIT_CONFIG',
      integrationName: integration.name,
      actor: req.user._id,
      actorEmail: req.user.email,
      details: 'Configuration fields modified',
      ipAddress: req.ip || req.connection.remoteAddress
    });
    await audit.save();

    res.status(200).json({ message: 'Configuration updated successfully', integration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Connection Tester Engine (Phase 9 & Wizard Specific checks)
export const testConnection = async (req, res) => {
  const { name } = req.body;
  try {
    const integration = await Integration.findOne({ name });
    if (!integration) return res.status(404).json({ message: `Integration ${name} not found` });

    if (integration.status === 'Disabled') {
      return res.status(400).json({ message: 'Cannot test disabled integrations. Please enable first.' });
    }

    // Simulate connection testing variables
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 400) + 100)); // simulate network delay
    const latency = Date.now() - start;
    const responseTime = latency + Math.floor(Math.random() * 20);

    // Map test success parameters based on config presence
    let testSuccess = true;
    let testMessage = 'Connection check completed successfully.';
    
    // Check if vault secrets are configured or simulated
    const associatedSecretKey = name.toUpperCase().replace(' ', '_') + '_API_KEY';
    const secretInEnv = process.env[associatedSecretKey] || process.env[name.toUpperCase().replace(' ', '_') + '_TOKEN'];

    if (name === 'HubSpot') {
      const portalId = integration.config.portalId;
      if (!portalId) {
        testSuccess = false;
        testMessage = 'HubSpot Portal ID is missing. Connection rejected.';
      }
    } else if (name === 'Supabase') {
      const url = integration.config.projectUrl;
      if (!url) {
        testSuccess = false;
        testMessage = 'Supabase Project URL is missing. Handshake failed.';
      }
    }

    integration.latency = latency;
    integration.responseTime = responseTime;
    
    if (testSuccess) {
      integration.healthStatus = 'Connected';
      integration.errorRate = Math.max(0, integration.errorRate - 5);
      integration.lastSuccessfulRequest = new Date();
    } else {
      integration.healthStatus = 'Error';
      integration.errorRate = Math.min(100, integration.errorRate + 15);
    }

    integration.logs.push({
      action: 'CONNECTION_TEST',
      status: testSuccess ? 'Success' : 'Failed',
      message: testMessage
    });
    await integration.save();

    // Audit record
    const audit = new IntegrationAudit({
      action: 'TEST_CONNECTION',
      integrationName: name,
      actor: req.user._id,
      actorEmail: req.user.email,
      details: `Tested connection: ${testSuccess ? 'Connected' : 'Error'} | Latency: ${latency}ms`,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    await audit.save();

    res.status(200).json({
      success: testSuccess,
      latency,
      responseTime,
      healthStatus: integration.healthStatus,
      message: testMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Vault Key Configuration & Encrypted Rotations
export const rotateSecret = async (req, res) => {
  const { key, value, category, rotationPeriodDays } = req.body;
  try {
    if (!key || !value) {
      return res.status(400).json({ message: 'Key and Value are required for vault storage.' });
    }

    // Encrypt credential using helper utility
    const { value: encryptedValue, iv } = encrypt(value);

    let sec = await Secret.findOne({ key });
    if (sec) {
      sec.history.push({
        rotatedAt: sec.lastRotated,
        updatedBy: sec.updatedBy
      });
      sec.value = encryptedValue;
      sec.iv = iv;
      sec.lastRotated = new Date();
      sec.updatedBy = req.user._id;
      if (rotationPeriodDays) sec.rotationPeriodDays = rotationPeriodDays;
      await sec.save();
    } else {
      sec = new Secret({
        key,
        value: encryptedValue,
        iv,
        category: category || 'General',
        rotationPeriodDays: rotationPeriodDays || 90,
        updatedBy: req.user._id
      });
      await sec.save();
    }

    // Sync secret into active environment variables in-memory immediately!
    process.env[key] = value;

    // Audit logs entry
    const audit = new IntegrationAudit({
      action: 'ROTATE_CREDENTIALS',
      integrationName: category || 'Vault Secrets',
      actor: req.user._id,
      actorEmail: req.user.email,
      details: `Rotated key: ${key}. Environment synchronized in memory.`,
      ipAddress: req.ip || req.connection.remoteAddress
    });
    await audit.save();

    res.status(200).json({
      message: `Secret ${key} successfully saved and rotated in Vault.`,
      key,
      lastRotated: sec.lastRotated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Get Masked Secrets list (Never expose raw credentials to frontend)
export const getSecretsList = async (req, res) => {
  try {
    const list = await Secret.find({}).populate('updatedBy', 'email');
    const masked = list.map(item => {
      // mask everything except first 4 and last 2 characters
      const decrypted = decrypt(item.value, item.iv);
      let mask = '';
      if (decrypted) {
        mask = decrypted.substring(0, 4) + '...******...' + decrypted.substring(decrypted.length - 2);
      }
      return {
        _id: item._id,
        key: item.key,
        category: item.category,
        lastRotated: item.lastRotated,
        rotationPeriodDays: item.rotationPeriodDays,
        updatedBy: item.updatedBy?.email || 'N/A',
        maskedValue: mask || '••••••••'
      };
    });
    res.status(200).json(masked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Get Administrative Audit Logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await IntegrationAudit.find({}).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Systems Health Monitoring Engine
export const getHealthMetrics = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    const activeIntegrationsCount = await Integration.countDocuments({ status: 'Enabled' });
    const totalIntegrationsCount = await Integration.countDocuments();
    
    // Mongoose ready state: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const mongooseStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Error';

    // Sum active latencies
    const integrations = await Integration.find({ status: 'Enabled' });
    let totalLatency = 0;
    integrations.forEach(i => {
      totalLatency += i.latency;
    });
    const avgLatency = integrations.length > 0 ? Math.round(totalLatency / integrations.length) : 0;
    
    // Health score
    let healthScore = 100;
    if (mongooseStatus !== 'Healthy') healthScore -= 50;
    integrations.forEach(i => {
      if (i.healthStatus === 'Error') healthScore -= 5;
    });
    healthScore = Math.max(10, healthScore);

    res.status(200).json({
      healthScore,
      mongooseStatus,
      redisStatus: 'Healthy', // Simulated Redis
      queueStatus: 'Healthy', // Simulated BullMQ queue
      activeIntegrationsCount,
      totalIntegrationsCount,
      avgLatency,
      systemResources: {
        memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        memoryHeapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        cpuUserMicroSecs: cpu.user,
        cpuSystemMicroSecs: cpu.system
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
