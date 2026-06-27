import Dataset from '../models/Dataset.js';
import AnalyticsDashboard from '../models/AnalyticsDashboard.js';
import SharedReport from '../models/SharedReport.js';
import ScheduledJob from '../models/ScheduledJob.js';
import AnalyticsLog from '../models/AnalyticsLog.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Ticket from '../models/Ticket.js';
import Employee from '../models/Employee.js';
import Workflow from '../models/Workflow.js';
import AIAgent from '../models/AIAgent.js';
import WorkflowLog from '../models/WorkflowLog.js';
import AgentEvaluation from '../models/AgentEvaluation.js';
import fs from 'fs';
import path from 'path';

// Helper to log analytics events
const logEvent = async (type, status, details = {}, datasetId = null, dashboardId = null, userId = null) => {
  try {
    const log = new AnalyticsLog({
      type,
      status,
      datasetId,
      dashboardId,
      user: userId,
      details
    });
    await log.save();
    
    // Broadcast real-time KPI metrics via Socket.io
    if (global.io) {
      global.io.emit('realtime_analytics_metric', {
        type,
        status,
        datasetId,
        dashboardId,
        timestamp: new Date(),
        details
      });
    }
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

/* =========================================================
   1. DATASET UPLOAD AND SCHEMA DETECTION
   ========================================================= */
export const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { originalname, path: filePath, size } = req.file;
    const fileExt = path.extname(originalname).toLowerCase();
    
    let textContent = '';
    try {
      textContent = fs.readFileSync(filePath, 'utf-8');
    } catch (readErr) {
      return res.status(500).json({ message: 'Failed to read uploaded file.' });
    }

    let rows = [];
    let columns = [];

    // Parse according to type
    if (fileExt === '.csv') {
      const lines = textContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        headers.forEach(header => {
          columns.push({ name: header, type: 'String' }); // Default type
        });
        
        for (let i = 1; i < Math.min(lines.length, 1000); i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });
          rows.push(row);
        }
        
        // Auto-detect column types based on first few records
        if (rows.length > 0) {
          columns = columns.map(col => {
            let type = 'Number';
            for (const r of rows) {
              const val = r[col.name];
              if (val === undefined || val === '') continue;
              if (isNaN(Number(val))) {
                if (!isNaN(Date.parse(val)) && val.includes('-')) {
                  type = 'Date';
                } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
                  type = 'Boolean';
                } else {
                  type = 'String';
                  break;
                }
              }
            }
            return { name: col.name, type };
          });
        }
      }
    } else if (fileExt === '.json') {
      try {
        const parsed = JSON.parse(textContent);
        rows = Array.isArray(parsed) ? parsed : [parsed];
        if (rows.length > 0) {
          Object.keys(rows[0]).forEach(key => {
            const val = rows[0][key];
            let type = 'String';
            if (typeof val === 'number') type = 'Number';
            else if (typeof val === 'boolean') type = 'Boolean';
            else if (typeof val === 'string') {
              if (!isNaN(Date.parse(val)) && val.includes('-')) type = 'Date';
            }
            columns.push({ name: key, type });
          });
        }
      } catch (parseErr) {
        return res.status(400).json({ message: 'Invalid JSON file content.' });
      }
    } else {
      // General txt/xml mock parser
      columns = [{ name: 'content', type: 'String' }];
      rows = [{ content: textContent.substring(0, 1000) }];
    }

    const dataset = new Dataset({
      name: originalname.replace(fileExt, ''),
      owner: req.user._id,
      sourceType: fileExt.substring(1).toUpperCase(),
      columns,
      rowCount: rows.length,
      sizeBytes: size,
      filePath: `/uploads/${path.basename(filePath)}`,
      metadata: { originalName: originalname, columnsDetected: columns.length },
      lineage: {
        source: 'User Upload',
        steps: ['Uploaded raw data file', 'Executed schema auto-detection']
      },
      roleAccess: ['Super Admin', 'Admin', 'Manager']
    });

    await dataset.save();
    await logEvent('Upload', 'Success', { fileSize: size, rowCount: rows.length }, dataset._id, null, req.user._id);

    res.status(201).json({
      message: 'Dataset uploaded and processed successfully.',
      dataset,
      preview: rows.slice(0, 10)
    });
  } catch (error) {
    await logEvent('Upload', 'Failed', { error: error.message }, null, null, req.user?._id);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   2. DATA PREPARATION / CLEANING STUDIO
   ========================================================= */
export const prepareDataset = async (req, res) => {
  const { datasetId, operations } = req.body; // operations: [{ type: 'rename'/'typecast'/'replace_null', params: {...} }]
  try {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) return res.status(404).json({ message: 'Dataset not found.' });
    
    // Simulate applying cleaning instructions
    operations.forEach(op => {
      if (op.type === 'rename') {
        const { oldName, newName } = op.params;
        dataset.columns = dataset.columns.map(c => c.name === oldName ? { name: newName, type: c.type } : c);
        dataset.lineage.steps.push(`Renamed column ${oldName} to ${newName}`);
      } else if (op.type === 'typecast') {
        const { columnName, targetType } = op.params;
        dataset.columns = dataset.columns.map(c => c.name === columnName ? { name: c.name, type: targetType } : c);
        dataset.lineage.steps.push(`Converted column ${columnName} to type ${targetType}`);
      } else if (op.type === 'replace_null') {
        const { columnName, value } = op.params;
        dataset.lineage.steps.push(`Replaced nulls in ${columnName} with value "${value}"`);
      } else if (op.type === 'drop_column') {
        const { columnName } = op.params;
        dataset.columns = dataset.columns.filter(c => c.name !== columnName);
        dataset.lineage.steps.push(`Dropped column ${columnName}`);
      }
    });

    dataset.version += 1;
    await dataset.save();
    
    await logEvent('Query', 'Success', { action: 'Data Cleaning', operationsCount: operations.length }, datasetId, null, req.user._id);
    res.status(200).json({ message: 'Data cleaning pipeline applied.', dataset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   3. DESCRIPTIVE STATISTICS
   ========================================================= */
export const getDatasetStats = async (req, res) => {
  const { id } = req.params;
  try {
    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: 'Dataset not found.' });

    // Calculate mock but structured statistics based on columns
    const statistics = {};
    dataset.columns.forEach(col => {
      if (col.type === 'Number') {
        statistics[col.name] = {
          count: dataset.rowCount || 150,
          sum: 45200,
          mean: 301.33,
          median: 285.5,
          mode: 250,
          min: 10,
          max: 850,
          variance: 14500.22,
          stdDev: 120.42,
          range: 840,
          quartiles: { q1: 180, q2: 285.5, q3: 420 },
          percentiles: { 90: 550, 95: 710 }
        };
      } else {
        statistics[col.name] = {
          count: dataset.rowCount || 150,
          uniqueCount: 12,
          topValue: 'HQ Office',
          frequencyDistribution: {
            'HQ Office': 45,
            'West Branch': 32,
            'South Plaza': 28,
            'Other': 45
          }
        };
      }
    });

    // Correlation Matrix (mock if columns count > 1)
    const correlationMatrix = {};
    const numCols = dataset.columns.filter(c => c.type === 'Number').map(c => c.name);
    numCols.forEach(c1 => {
      correlationMatrix[c1] = {};
      numCols.forEach(c2 => {
        correlationMatrix[c1][c2] = c1 === c2 ? 1.0 : parseFloat((Math.random() * 2 - 1).toFixed(2));
      });
    });

    res.status(200).json({
      datasetId: dataset._id,
      name: dataset.name,
      rowCount: dataset.rowCount,
      columnsCount: dataset.columns.length,
      statistics,
      correlationMatrix
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   4. ADVANCED ANALYTICS (TRENDS, FORECAST, REGRESSION)
   ========================================================= */
export const runAdvancedAnalytics = async (req, res) => {
  const { datasetId, type, params } = req.body; // type: 'forecast'/'regression'/'cohort'/'segmentation'
  try {
    const dataset = await Dataset.findById(datasetId);
    
    // Simulate mathematical analytics runs
    let result = {};
    if (type === 'forecast') {
      result = {
        modelName: 'Time Series ARIMA',
        horizon: params.horizon || 6,
        metrics: { MAPE: '4.2%', RMSE: 12.5 },
        forecast: [
          { period: '2026-07', value: 12500, bounds: [11800, 13200] },
          { period: '2026-08', value: 13100, bounds: [12200, 14000] },
          { period: '2026-09', value: 13900, bounds: [12900, 14900] },
          { period: '2026-10', value: 14200, bounds: [13100, 15300] },
          { period: '2026-11', value: 14800, bounds: [13600, 16000] },
          { period: '2026-12', value: 15500, bounds: [14200, 16800] }
        ]
      };
    } else if (type === 'regression') {
      result = {
        equation: 'y = 4.25x + 120.5',
        r2: 0.88,
        adjustedR2: 0.86,
        pValue: 0.001,
        coefficients: { intercept: 120.5, slope: 4.25 }
      };
    } else if (type === 'cohort') {
      result = {
        cohorts: [
          { name: 'Jan 2026', size: 120, retention: [100, 92, 85, 80, 78, 75] },
          { name: 'Feb 2026', size: 140, retention: [100, 88, 80, 76, 70] },
          { name: 'Mar 2026', size: 155, retention: [100, 90, 84, 79] }
        ]
      };
    } else if (type === 'segmentation') {
      result = {
        clustersCount: 3,
        silhouetteScore: 0.65,
        clusters: [
          { name: 'High Volume Enterprise', size: 45, characteristics: 'Avg Value > $5000/mo, High ticket retention' },
          { name: 'Medium SMB', size: 85, characteristics: 'Avg Value $1000-$5000/mo, Occasional service request' },
          { name: 'Small/Ad-hoc accounts', size: 120, characteristics: 'Avg Value < $1000/mo, High churn rate' }
        ]
      };
    } else if (type === 'anomaly') {
      result = {
        anomaliesCount: 2,
        anomalies: [
          { index: 42, date: '2026-05-12', actualValue: 8500, expectedValue: 3200, deviation: '2.6x', reason: 'Abrupt invoice volume spikes' },
          { index: 89, date: '2026-06-02', actualValue: 45, expectedValue: 120, deviation: '0.3x', reason: 'Extreme decline in ticketing communications activity' }
        ]
      };
    }

    res.status(200).json({ datasetId, type, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   5. BUSINESS MODULES ANALYTICS DATA PIPELINE
   ========================================================= */
export const getBusinessAnalytics = async (req, res) => {
  try {
    // Collect stats from live Mongoose collections
    const leadsCount = await Lead.countDocuments({});
    const dealsCount = await Deal.countDocuments({});
    const ticketsCount = await Ticket.countDocuments({});
    const employeesCount = await Employee.countDocuments({});
    const workflowsCount = await Workflow.countDocuments({});
    const agentsCount = await AIAgent.countDocuments({});
    
    // Average ratings
    const evaluations = await AgentEvaluation.find({});
    let avgAgentSuccess = 95.5;
    if (evaluations.length > 0) {
      avgAgentSuccess = evaluations.reduce((acc, curr) => acc + curr.successRate, 0) / evaluations.length;
    }

    res.status(200).json({
      sales: {
        totalLeads: leadsCount || 24,
        totalDeals: dealsCount || 15,
        conversionRate: '35.5%',
        pipelineValue: '$184,500'
      },
      customerService: {
        totalTickets: ticketsCount || 42,
        slaPassRate: '96.2%',
        avgResolutionTimeHrs: 8.4,
        backlogRate: '4.8%'
      },
      operations: {
        activeWorkflows: workflowsCount || 10,
        completedExecutionsCount: 845,
        failedExecutionsCount: 22,
        activeAgents: agentsCount || 6,
        avgAgentAccuracy: `${avgAgentSuccess.toFixed(1)}%`
      },
      hr: {
        totalEmployees: employeesCount || 12,
        retentionRate: '98.5%',
        openPositions: 4,
        trainingScoreAverage: '90.2%'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   6. AI ANALYTICS ASSISTANT
   ========================================================= */
export const queryAIAnalytics = async (req, res) => {
  const { prompt, datasetId } = req.body;
  try {
    const dataset = datasetId ? await Dataset.findById(datasetId) : null;
    
    // Simulate AI semantic matching
    let reply = `Based on current operations metrics:`;
    let recommendations = [];
    let chartSuggestion = null;

    const lower = prompt.toLowerCase();
    if (lower.includes('revenue') || lower.includes('drop') || lower.includes('decline')) {
      reply = `AI Analysis: The revenue query indicates a $15,400 drop in projected pipelines. This matches a stagnant HubSpot deal titled "Metro Plaza Janitorial" which has sat in 'Proposal' stage for 10 days.`;
      recommendations = [
        'Trigger the CRM hygiene agent to automatically notify the account lead rep.',
        'Review contract split margins to verify if pricing targets match competitive ratios.'
      ];
      chartSuggestion = {
        type: 'Bar Chart',
        data: {
          labels: ['March', 'April', 'May', 'June (Proj)'],
          datasets: [{ label: 'Pipeline Revenue', data: [45000, 48000, 52000, 36600] }]
        }
      };
    } else if (lower.includes('sales') || lower.includes('rep') || lower.includes('underperforming')) {
      reply = `AI Analysis: Evaluated salesperson scores. Sales Coordinator 'Jessica Rios' shows a 15% lower talk time average (42 min/day vs 50 min/day target) and has 2 deal follow-ups overdue.`;
      recommendations = [
        'Run the Coaching Report Gen Node for Sales department targeting Jessica Rios.',
        'Redistribute uncontacted leads using round-robin assignment overrides.'
      ];
      chartSuggestion = {
        type: 'Leaderboard',
        data: [
          { name: 'John Doe', dealsClosed: 14, score: 98 },
          { name: 'Marcus Vance', dealsClosed: 10, score: 92 },
          { name: 'Jessica Rios', dealsClosed: 4, score: 78 }
        ]
      };
    } else if (lower.includes('churn') || lower.includes('client') || lower.includes('cancel')) {
      reply = `AI Analysis: Churn propensity model flags 2 clients at risk due to recent service ticket failures. 'Suite 402 buffing delay' triggered a low CSAT rating (Thumbs Down).`;
      recommendations = [
        'Contact Metro Plaza suite coordinator immediately to arrange manual verification inspection.',
        'Offer a 5% promotional discount on next month invoice processing.'
      ];
      chartSuggestion = {
        type: 'Pie Chart',
        data: [
          { segment: 'Low Risk (Loyal)', percentage: 85 },
          { segment: 'Medium Risk (Warning)', percentage: 10 },
          { segment: 'High Risk (Flagged Churn)', percentage: 5 }
        ]
      };
    } else if (lower.includes('workflow') || lower.includes('fail') || lower.includes('crash')) {
      reply = `AI Analysis: Workflow 'SOP Contract Parser' failed 3 times in the last 48 hours. The failure occurred inside 'PDFReaderNode' during extraction loops on non-standard PDF formats.`;
      recommendations = [
        'Insert an OCRExtractionNode prior to the PDF Reader node in the DAG canvas to handle scanned documents.',
        'Ensure the self-healing circuit breaker is active (set max retries to 3).'
      ];
      chartSuggestion = {
        type: 'Line Chart',
        data: {
          labels: ['June 18', 'June 19', 'June 20', 'June 21', 'June 22'],
          datasets: [
            { label: 'SOP Parser Fails', data: [0, 1, 0, 2, 1] }
          ]
        }
      };
    } else {
      reply = `Query processed. Visualized details show consistent operation levels. System status is completely stable.`;
      recommendations = [
        'Inspect operational database tables to run custom queries.',
        'Build visual charts using the Drag-and-Drop Dashboard builder.'
      ];
    }

    res.status(200).json({
      reply,
      recommendations,
      chartSuggestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   7. DASHBOARD CRUD
   ========================================================= */
export const getDashboards = async (req, res) => {
  try {
    const list = await AnalyticsDashboard.find({}).populate('widgets.datasetId', 'name sourceType rowCount');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDashboard = async (req, res) => {
  const { title, roleAccess, widgets } = req.body;
  try {
    const dashboard = new AnalyticsDashboard({
      title,
      owner: req.user._id,
      roleAccess: roleAccess || ['Super Admin', 'Admin', 'Manager'],
      widgets: widgets || []
    });
    await dashboard.save();
    
    await logEvent('Share', 'Success', { action: 'Created Dashboard' }, null, dashboard._id, req.user._id);
    res.status(201).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDashboardWidgets = async (req, res) => {
  const { id } = req.params;
  const { widgets } = req.body;
  try {
    const dashboard = await AnalyticsDashboard.findById(id);
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found.' });

    dashboard.widgets = widgets;
    await dashboard.save();
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   8. SECURE REPORT SHARING ENGINE
   ========================================================= */
export const shareDashboardReport = async (req, res) => {
  const { dashboardId, shareType, password, expiryDays } = req.body;
  try {
    const dashboard = await AnalyticsDashboard.findById(dashboardId);
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found.' });

    const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;
    const shareKey = Math.random().toString(36).substring(2, 15);
    const shareUrl = `http://localhost:3000/shared/report/${shareKey}`;

    const shared = new SharedReport({
      dashboardId,
      shareType: shareType || 'Public',
      passwordHash: password || null, // Mock simple check, or bcrypt
      expiryDate,
      shareUrl,
      roleAccess: shareType === 'Private' ? ['Super Admin', 'Admin'] : []
    });

    await shared.save();
    await logEvent('Share', 'Success', { shareType, expiryDate }, null, dashboardId, req.user._id);

    res.status(201).json({
      message: 'Share URL generated successfully.',
      shareUrl,
      shared
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSharedReportByKey = async (req, res) => {
  const { key } = req.params;
  const { password } = req.query;
  try {
    // Find the shared log matching url
    const shared = await SharedReport.findOne({ shareUrl: new RegExp(key, 'i') }).populate('dashboardId');
    if (!shared) return res.status(404).json({ message: 'Shared report link not found or expired.' });

    if (shared.expiryDate && new Date() > shared.expiryDate) {
      return res.status(410).json({ message: 'This shared report link has expired.' });
    }

    if (shared.passwordHash && shared.passwordHash !== password) {
      return res.status(403).json({ message: 'Password required or incorrect password.', passwordProtected: true });
    }

    shared.views += 1;
    await shared.save();

    await logEvent('Download', 'Success', { action: 'View Shared Link' }, null, shared.dashboardId._id, null);
    res.status(200).json(shared.dashboardId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   9. SCHEDULED REPORTING ENGINE
   ========================================================= */
export const createScheduledReport = async (req, res) => {
  const { name, dashboardId, frequency, deliveryChannels } = req.body;
  try {
    const job = new ScheduledJob({
      name,
      dashboardId,
      frequency,
      deliveryChannels,
      status: 'Active',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to tomorrow
    });
    await job.save();

    await logEvent('Job', 'Success', { frequency, channelsCount: deliveryChannels.length }, null, dashboardId, req.user._id);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   10. DATA CATALOG AND METADATA
   ========================================================= */
export const getDatasetsCatalog = async (req, res) => {
  try {
    const list = await Dataset.find({}).populate('owner', 'email');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   11. SYSTEM PERFORMANCE MONITORING & USAGE AUDIT
   ========================================================= */
export const getMonitoringMetrics = async (req, res) => {
  try {
    const totalSizeRes = await Dataset.aggregate([{ $group: { _id: null, totalSize: { $sum: '$sizeBytes' } } }]);
    const totalSizeBytes = totalSizeRes[0]?.totalSize || 424000;

    const queriesCount = await AnalyticsLog.countDocuments({ type: 'Query' });
    const errorsCount = await AnalyticsLog.countDocuments({ status: 'Failed' });
    const downloadsCount = await AnalyticsLog.countDocuments({ type: 'Download' });

    // Recent system logs
    const logs = await AnalyticsLog.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('user', 'email');

    res.status(200).json({
      metrics: {
        totalSizeBytes,
        queriesCount,
        errorsCount,
        downloadsCount,
        systemHealth: errorsCount === 0 ? 'Healthy' : errorsCount < 5 ? 'Warning' : 'Degraded'
      },
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
