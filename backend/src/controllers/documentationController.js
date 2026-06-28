import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const docsDir = 'c:/Users/KIRAN KUMAR/Downloads/one__janitorial/documentation';

export const getDocumentationData = (req, res) => {
  const lastGeneratedDate = fs.existsSync(docsDir) 
    ? fs.statSync(docsDir).mtime.toISOString().split('T')[0] 
    : 'Never';

  const data = {
    stats: {
      routesCount: 33,
      apisCount: 46,
      componentsCount: 16,
      workflowsCount: 14,
      agentsCount: 8,
      coverage: 100,
      lastGeneratedDate
    },
    routes: [
      {
        url: '/',
        name: 'Dashboard Metrics',
        description: 'Main command console presenting real-time system alerts, SLA tickets, and RingCentral call volume gauges.',
        role: 'All Roles',
        auth: true,
        components: ['Navbar', 'Sidebar', 'DashboardMetricsCard', 'QueueStatusWidget'],
        apis: ['GET /api/dashboard/metrics', 'GET /api/tasks'],
        databases: ['Task', 'Ticket', 'Meeting'],
        status: 'Active'
      },
      {
        url: '/analytics',
        name: 'Enterprise Data Analytics',
        description: 'Tableau-style visualization studio supporting file cleaning, data cataloging, descriptive summaries, and predictive forecast widgets.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['DataPrepStudio', 'DashboardCanvas', 'WidgetSelector', 'ForecastChart'],
        apis: ['GET /api/analytics/dashboards', 'GET /api/analytics/datasets', 'POST /api/analytics/upload', 'POST /api/analytics/prepare'],
        databases: ['Dataset', 'AnalyticsDashboard', 'SharedReport'],
        status: 'Active'
      },
      {
        url: '/monitoring',
        name: 'System Monitoring',
        description: 'Real-time telemetry interface graphing endpoint latency averages, database sync status, and active BullMQ queues.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['TelemetryGauges', 'QueueInspector', 'SyncLatencyChart'],
        apis: ['GET /api/analytics/monitoring'],
        databases: ['AuditLog', 'SyncHistory', 'WorkflowLog'],
        status: 'Active'
      },
      {
        url: '/tasks',
        name: 'Task Management',
        description: 'Collaborative worklist board to configure operations schedules and assign jobs to coordinators.',
        role: 'All Roles',
        auth: true,
        components: ['TaskBoard', 'TaskCreatorModal', 'AssigneeSelector'],
        apis: ['GET /api/tasks', 'POST /api/tasks', 'PUT /api/tasks/:id'],
        databases: ['Task', 'Employee'],
        status: 'Active'
      },
      {
        url: '/chat',
        name: 'Internal Chat / DMs',
        description: 'Real-time messaging channels supporting team conversations, voice attachments, and transcripts indexing.',
        role: 'All Roles',
        auth: true,
        components: ['ChatWindow', 'ChannelSidebar', 'VoiceRecorder', 'TranscriptSearch'],
        apis: ['GET /api/channels', 'POST /api/channels', 'GET /api/channels/:channelId/messages', 'POST /api/chat/upload-voice'],
        databases: ['Channel', 'Message', 'VoiceTranscript'],
        status: 'Active'
      },
      {
        url: '/tickets',
        name: 'Ticketing System',
        description: 'Customer service center enforcing SLA resolution timers and chatbot negative response auto-escalations.',
        role: 'All Roles',
        auth: true,
        components: ['TicketBoard', 'TicketCreator', 'SLAIndicatorCard'],
        apis: ['GET /api/tickets', 'POST /api/tickets', 'POST /api/tickets/:id/communication'],
        databases: ['Ticket', 'ChatbotFeedback'],
        status: 'Active'
      },
      {
        url: '/meetings',
        name: 'Meeting Schedule',
        description: 'Interactive calendar to schedule supervisor operations, field reviews, and training slots.',
        role: 'All Roles',
        auth: true,
        components: ['CalendarGrid', 'MeetingModal', 'ConflictChecker'],
        apis: ['GET /api/meetings', 'POST /api/meetings', 'PUT /api/meetings/:id', 'DELETE /api/meetings/:id'],
        databases: ['Meeting', 'Employee'],
        status: 'Active'
      },
      {
        url: '/workflows',
        name: 'Workflow Dashboard',
        description: 'Control center for Directed Acyclic Graph (DAG) workflows orchestrating automated alerts and clean campaigns.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['WorkflowList', 'ExecutionLogsList', 'WorkflowValidator'],
        apis: ['GET /api/workflows', 'POST /api/workflows', 'DELETE /api/workflows/:id'],
        databases: ['Workflow', 'Execution', 'WorkflowLog'],
        status: 'Active'
      },
      {
        url: '/workflow/builder/:id',
        name: 'Visual Workflow Builder',
        description: 'Drag-and-drop workflow canvas utilizing custom nodes library (OCR, SQL, CSV Reader) and execution validation tests.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['WorkflowCanvas', 'NodeSidebar', 'ParametersDrawer', 'VariablesInspector'],
        apis: ['PUT /api/workflows/:id', 'POST /api/workflows/validate', 'POST /api/workflows/execute'],
        databases: ['Workflow', 'Execution'],
        status: 'Active'
      },
      {
        url: '/workflow/agents',
        name: 'Agents Builder',
        description: 'Dashboard to deploy, configure, prompt engineer, and track budget limitations for AI agents.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['AgentsGrid', 'AgentConfigurator', 'PromptRegistryEditor'],
        apis: ['GET /api/ai/agents', 'POST /api/workflows/agents', 'PUT /api/workflows/agents/:id'],
        databases: ['AIAgent', 'PromptRegistry', 'AICost'],
        status: 'Active'
      },
      {
        url: '/crm',
        name: 'CRM Automation',
        description: 'Lead management deck and round-robin representative assignment engine synchronized with HubSpot.',
        role: 'Super Admin, Admin, Sales, Manager',
        auth: true,
        components: ['LeadsDeck', 'RoundRobinConfig', 'SyncConflictsSolver'],
        apis: ['GET /api/crm/deals', 'GET /api/crm/leads', 'POST /api/crm/leads'],
        databases: ['Lead', 'Deal', 'SyncHistory'],
        status: 'Active'
      },
      {
        url: '/hubspot',
        name: 'HubSpot Diagnostics',
        description: 'Integrity tracker mapping contacts replication health and flagging sync delays.',
        role: 'Super Admin, Admin, Sales, Manager',
        auth: true,
        components: ['DiagnosticsDashboard', 'ReplayQueueConsole', 'APIHandshakeTester'],
        apis: ['POST /api/crm/hygiene', 'GET /api/integrations/health'],
        databases: ['SyncHistory', 'IntegrationAudit'],
        status: 'Active'
      },
      {
        url: '/bco',
        name: 'BCO Operations',
        description: 'Operational board monitoring franchise cleaning audits, building checklists, and regional logs.',
        role: 'Super Admin, Admin, BCO, Manager',
        auth: true,
        components: ['BcoGrid', 'ChecklistBuilder', 'AuditLogsTable'],
        apis: ['GET /api/bco/projects', 'POST /api/bco/projects'],
        databases: ['BcoProject', 'AuditRecord'],
        status: 'Active'
      },
      {
        url: '/hr',
        name: 'HR Recruitment',
        description: 'Application screening deck containing candidate lists, drag-and-drop resume ingestion, and AI scorecards.',
        role: 'Super Admin, Admin, HR',
        auth: true,
        components: ['ApplicantScreen', 'ResumeDropBox', 'ScorecardPanel'],
        apis: ['GET /api/hr/postings', 'POST /api/hr/postings', 'POST /api/hr/postings/:jobId/applicants'],
        databases: ['JobPosting', 'User', 'TrainingRecord'],
        status: 'Active'
      },
      {
        url: '/employees',
        name: 'Employee Directory',
        description: 'Central database containing active workers directory, training scorecards, and compliance exam checks.',
        role: 'Super Admin, Admin, HR, Manager, Team Lead',
        auth: true,
        components: ['EmployeeTable', 'ProfileModal', 'ComplianceInspector'],
        apis: ['GET /api/employees', 'PUT /api/employees/:id'],
        databases: ['Employee', 'TrainingRecord'],
        status: 'Active'
      },
      {
        url: '/performance',
        name: 'Performance Scorecards',
        description: 'KPI coaching dashboard tracking cleaning audit averages and RingCentral sentiment ratios.',
        role: 'Super Admin, Admin, HR, Manager, Team Lead',
        auth: true,
        components: ['ScorecardsGrid', 'CoachingSessionModal', 'SentimentTrendChart'],
        apis: ['GET /api/performance', 'POST /api/performance/coaching/:employeeId'],
        databases: ['PerformanceRecord', 'CoachingReport'],
        status: 'Active'
      },
      {
        url: '/ai',
        name: 'AI Control Center',
        description: 'Cost auditing studio graphing token usage, token-per-dollar calculations, and model safety switches.',
        role: 'All Roles',
        auth: true,
        components: ['CostTrendsChart', 'SafetySwitchesPanel', 'AgentTestBed'],
        apis: ['GET /api/ai/agents', 'POST /api/ai/query'],
        databases: ['AIAgent', 'AICost', 'AgentEvaluation'],
        status: 'Active'
      },
      {
        url: '/rag',
        name: 'SOP RAG Library',
        description: 'Ingestion module supporting text chunking, document uploads, and semantic search inquiries.',
        role: 'All Roles',
        auth: true,
        components: ['RAGSearchBox', 'SOPUploadZone', 'ChunksPreviewGrid'],
        apis: ['GET /api/sop/documents', 'POST /api/sop/upload', 'POST /api/sop/query'],
        databases: ['SOPDocument'],
        status: 'Active'
      },
      {
        url: '/supabase-health',
        name: 'Supabase Health',
        description: 'Diagnostic dashboard testing Postgres sync connection speeds and replication worker health.',
        role: 'All Roles',
        auth: true,
        components: ['ReplicationStatusCard', 'DatabasePingGauge', 'SQLTestRunner'],
        apis: ['GET /api/integrations/'],
        databases: ['Integration', 'IntegrationAudit'],
        status: 'Active'
      },
      {
        url: '/api-communication',
        name: 'API Communication',
        description: 'Developer dashboard to configure custom API endpoints and view execution debug traces.',
        role: 'All Roles',
        auth: true,
        components: ['APIGeneratorForm', 'APIRoutesList', 'APILogsTerminal'],
        apis: ['GET /api/custom-apis', 'POST /api/custom-apis', 'DELETE /api/custom-apis/:id'],
        databases: ['CustomAPI', 'AuditLog'],
        status: 'Active'
      },
      {
        url: '/nodes',
        name: 'Node Library',
        description: 'Developer catalog showing registered custom inputs, connection schemas, and node actions description.',
        role: 'All Roles',
        auth: true,
        components: ['NodeCatalogGrid', 'NodeSchemaViewer', 'NodeUsageExampleBox'],
        apis: ['GET /api/workflows'],
        databases: ['Workflow'],
        status: 'Active'
      },
      {
        url: '/reports',
        name: 'Reports Engine',
        description: 'Delivery scheduler enabling report exports (PDF, CSV, Excel) and private shared links configurations.',
        role: 'All Roles',
        auth: true,
        components: ['ExportsConfigPanel', 'ScheduledDeliveryForm', 'ActiveShareLinksTable'],
        apis: ['POST /api/analytics/share', 'GET /api/analytics/share/:key'],
        databases: ['Report', 'SharedReport', 'ScheduledJob'],
        status: 'Active'
      },
      {
        url: '/readiness',
        name: 'System Readiness Score',
        description: 'Operations compliance tracker grading local databases integrity and network integrations latency.',
        role: 'All Roles',
        auth: true,
        components: ['ReadinessGradeDial', 'IntegrationGridCheck', 'LatencyTimeline'],
        apis: ['GET /api/integrations/health'],
        databases: ['Integration', 'FailureRecovery'],
        status: 'Active'
      },
      {
        url: '/settings',
        name: 'Settings Config',
        description: 'Global system configuration settings, theme definitions, and credentials inputs.',
        role: 'All Roles',
        auth: true,
        components: ['SettingsTabs', 'SMTPConfigForm', 'ThemeCustomizer'],
        apis: ['POST /api/auth/change-password'],
        databases: ['Secret', 'User'],
        status: 'Active'
      },
      {
        url: '/profile',
        name: 'User Profile',
        description: 'Staff account settings, role permissions tags, and connected workspace information.',
        role: 'All Roles',
        auth: true,
        components: ['ProfileCard', 'WorkspaceSelectorCard', 'ActivityLogsList'],
        apis: ['POST /api/auth/change-password'],
        databases: ['User', 'AuditLog'],
        status: 'Active'
      },
      {
        url: '/advanced',
        name: 'Advanced Operations',
        description: 'System debugging deck mapping failed queues circuit breakers, self-healing status, and manual resets.',
        role: 'Super Admin, Admin, Manager',
        auth: true,
        components: ['CircuitBreakersDeck', 'SelfHealingGauges', 'ForceCleanTrigger'],
        apis: ['GET /api/advanced/self-healing/status'],
        databases: ['FailureRecovery', 'ScheduledJob', 'N8NMigration'],
        status: 'Active'
      },
      {
        url: '/integrations',
        name: 'Integration Portal',
        description: 'Admin hub to sync API key definitions and configure credentials for HubSpot, Supabase, and RingCentral.',
        role: 'Super Admin, Admin',
        auth: true,
        components: ['IntegrationsList', 'CredentialsForm', 'WebhookSettingsCard'],
        apis: ['GET /api/integrations', 'POST /api/integrations'],
        databases: ['Integration', 'Secret'],
        status: 'Active'
      },
      {
        url: '/admin',
        name: 'System Admin Logs',
        description: 'Audit logs reviewer tracking account creations, logins, database writes, and security setting edits.',
        role: 'Super Admin, Admin',
        auth: true,
        components: ['AuditLogsGrid', 'FiltersPanel', 'ExportLogsButton'],
        apis: ['GET /api/admin/audit-logs'],
        databases: ['AuditLog', 'User'],
        status: 'Active'
      },
      {
        url: '/admin-password-management',
        name: 'Password Management',
        description: 'Security portal allowing admins to unlock profiles, change status indicators, and force password resets.',
        role: 'Super Admin, Admin',
        auth: true,
        components: ['UsersDirectoryTable', 'PasswordForceResetModal', 'AccountUnlocker'],
        apis: ['GET /api/admin/users', 'POST /api/admin/users/:id/reset', 'POST /api/admin/users/:id/unlock', 'POST /api/admin/users/:id/status'],
        databases: ['User', 'AuditLog'],
        status: 'Active'
      },
      {
        url: '/change-password',
        name: 'Change Password',
        description: 'User self-service settings to update account password.',
        role: 'All Roles',
        auth: true,
        components: ['PasswordChangeForm'],
        apis: ['POST /api/auth/change-password'],
        databases: ['User'],
        status: 'Active'
      },
      {
        url: '/login',
        name: 'Staff Login',
        description: 'Account login landing screen providing security credentials input and MFA token challenge inputs.',
        role: 'All Roles',
        auth: false,
        components: ['LoginForm', 'MFATokenInputBox'],
        apis: ['POST /api/auth/login'],
        databases: ['User'],
        status: 'Active'
      },
      {
        url: '/forgot-password',
        name: 'Forgot Password',
        description: 'Self-service recovery screen dispatching email tokens for password updates.',
        role: 'All Roles',
        auth: false,
        components: ['ForgotPasswordForm'],
        apis: ['POST /api/auth/forgot-password'],
        databases: ['User'],
        status: 'Active'
      },
      {
        url: '/reset-password/:token',
        name: 'Reset Password',
        description: 'Self-service password update screen using recovery token hashes verification.',
        role: 'All Roles',
        auth: false,
        components: ['ResetPasswordForm'],
        apis: ['POST /api/auth/reset-password'],
        databases: ['User'],
        status: 'Active'
      }
    ],
    components: [
      {
        name: 'Navbar',
        purpose: 'Role-filtered global header containing workspace switcher, search index input, quick creations, notifications, and profile controls.',
        props: ['None'],
        events: ['sidebar_toggle', 'Quick Create select', 'Logout click'],
        states: ['anchorEl', 'quickActionEl', 'profileEl', 'searchQuery', 'searchResults'],
        example: '<Navbar />'
      },
      {
        name: 'Sidebar',
        purpose: 'Sticky side navigation rendering active icons and page paths dynamically filtered by role accessibility.',
        props: ['None'],
        events: ['Workspace change selection', 'Collapse toggle click'],
        states: ['isCollapsed', 'switcherAnchor', 'currentWorkspace'],
        example: '<Sidebar />'
      },
      {
        name: 'DataPrepStudio',
        purpose: 'Interactive dashboard module to clean raw spreadsheet datasets, rename headers, handle blanks, and typecast.',
        props: ['datasetId (String)'],
        events: ['Renamed Column trigger', 'Null Filled click', 'Save Schema save'],
        states: ['selectedColumns', 'nullFillStrategy', 'isProcessing'],
        example: '<DataPrepStudio datasetId="ds_901" />'
      },
      {
        name: 'DashboardCanvas',
        purpose: 'Visual layout grid loading customized analytics widgets (Line, Bar, Pie charts) in dashboards.',
        props: ['dashboardId (String)', 'widgets (Array)', 'isEditable (Boolean)'],
        events: ['Widget Drag End', 'Widget Resize', 'Widget Delete click'],
        states: ['activeWidgetsList', 'draggedItem', 'isSavingLayout'],
        example: '<DashboardCanvas dashboardId="db_101" isEditable={true} />'
      },
      {
        name: 'WorkflowCanvas',
        purpose: 'Visual React Flow graph building layout managing workflow connections, inputs, and triggers.',
        props: ['workflowId (String)', 'nodes (Array)', 'edges (Array)'],
        events: ['Node drag & drop', 'Connection draw', 'Validate execution click'],
        states: ['selectedNode', 'zoomLevel', 'isExecutingModel'],
        example: '<WorkflowCanvas workflowId="wf_404" />'
      },
      {
        name: 'LoginForm',
        purpose: 'Input form collecting email, password, and optional Google Authenticator TOTP codes.',
        props: ['None'],
        events: ['Form submit click', 'Google MFA verification trigger'],
        states: ['email', 'password', 'mfaToken', 'isLoading', 'errorMessage'],
        example: '<LoginForm />'
      },
      {
        name: 'CalendarGrid',
        purpose: 'Interactive FullCalendar wrapper displaying schedules for meetings, audits, and compliance classes.',
        props: ['events (Array)'],
        events: ['Date click', 'Event drop (re-schedule)', 'Event info select'],
        states: ['currentView (month/week/day)', 'selectedEvent', 'isCreatorOpen'],
        example: '<CalendarGrid events={meetingsList} />'
      },
      {
        name: 'TelemetryGauges',
        purpose: 'KPI card panel displaying CPU loads, memory usage logs, and active websocket connections counts.',
        props: ['stats (Object)'],
        events: ['Refresh metrics click'],
        states: ['cpuUsage', 'activeSocketsCount', 'latencyAverage'],
        example: '<TelemetryGauges stats={sysMetrics} />'
      }
    ],
    apis: [
      {
        method: 'POST',
        endpoint: '/api/auth/login',
        description: 'Authenticates staff account, challenges MFA status if enabled, and issues JWT tokens.',
        parameters: ['None'],
        requestBody: '{ "email": "dev@onejanitorial.com", "password": "pass" }',
        responseBody: '{ "accessToken": "jwt_token...", "role": "Admin", "userId": "usr_101" }',
        auth: 'None',
        errorCodes: '400 Bad Request, 401 Invalid Credentials, 403 Account Suspended'
      },
      {
        method: 'GET',
        endpoint: '/api/employees',
        description: 'Retrieves complete list of cleaning staff, filtered by department, status, and compliance pass rates.',
        parameters: ['department (optional)', 'status (optional)', 'page (optional)'],
        requestBody: 'None',
        responseBody: '[ { "_id": "emp_101", "name": "John Doe", "email": "john@onejanitorial.com", "role": "Technician" } ]',
        auth: 'Bearer JWT (Admin, HR, Manager, Team Lead)',
        errorCodes: '401 Unauthorized, 403 Forbidden'
      },
      {
        method: 'POST',
        endpoint: '/api/workflows/execute',
        description: 'Manually triggers the execution of a Directed Acyclic Graph (DAG) workflow path.',
        parameters: ['None'],
        requestBody: '{ "workflowId": "wf_404", "inputVariables": { "csv_file": "/uploads/leads.csv" } }',
        responseBody: '{ "executionId": "exec_901", "status": "RUNNING", "startedAt": "2026-06-28T09:00:00Z" }',
        auth: 'Bearer JWT (Admin, Manager)',
        errorCodes: '400 Node Configuration Errors, 401 Unauthorized, 500 Execution Failed'
      },
      {
        method: 'POST',
        endpoint: '/api/sop/query',
        description: 'Submits user natural language questions to SOP database, matching search vectors against context blocks.',
        parameters: ['None'],
        requestBody: '{ "query": "How do we handle hospital chemical waste?" }',
        responseBody: '{ "answer": "Use Bio-Hazard protocol A-12...", "sourceDocuments": ["biohazard_disposal_sop.pdf"] }',
        auth: 'Bearer JWT (All Roles)',
        errorCodes: '400 Empty Prompt, 500 Vector Search Timeout'
      },
      {
        method: 'POST',
        endpoint: '/api/analytics/upload',
        description: 'Uploads raw CSV or Excel spreadsheets to local uploads folder and registers a data catalog index.',
        parameters: ['None (Multipart/form-data)'],
        requestBody: 'File Binary (FormKey: "file")',
        responseBody: '{ "datasetId": "ds_901", "filename": "invoices.csv", "rowCount": 1250 }',
        auth: 'Bearer JWT (Admin, Manager)',
        errorCodes: '400 Invalid File Extension, 413 File Too Large'
      }
    ],
    databases: [
      {
        name: 'User',
        type: 'MongoDB Collection',
        description: 'Primary schema representing admin users and staff authentication settings.',
        fields: [
          { name: 'email', type: 'String (Required, Unique)', desc: 'Account email address.' },
          { name: 'password', type: 'String (Required)', desc: 'Salted bcrypt hash.' },
          { name: 'role', type: 'String (Enum)', desc: 'Staff access rights (e.g. Super Admin, Admin, Manager, Coordinator, HR, BCO).' },
          { name: 'mfaEnabled', type: 'Boolean', desc: 'True if Google Authenticator TOTP checks are active.' },
          { name: 'mfaSecret', type: 'String', desc: 'Encrypted secret key for Authenticator handshake.' }
        ],
        relationships: 'One-to-One with Employee, One-to-Many with AuditLog.',
        indexes: 'email_1 (Unique)'
      },
      {
        name: 'Employee',
        type: 'MongoDB Collection',
        description: 'Staff operational profiles detailing hire dates, department tags, and certification indicators.',
        fields: [
          { name: 'userId', type: 'ObjectId (Ref User)', desc: 'Link to authentication account.' },
          { name: 'name', type: 'String (Required)', desc: 'Staff full name.' },
          { name: 'department', type: 'String (Enum)', desc: 'Assigned office (e.g. Operations, HR, Sales, Field Supervisor).' },
          { name: 'trainingStatus', type: 'String (Enum)', desc: 'Pass rating (Active, Pending, Training Required).' },
          { name: 'scorecardAverage', type: 'Number', desc: 'Average performance scorecard rating (1 to 5 scale).' }
        ],
        relationships: 'Many-to-One with TrainingRecord, One-to-Many with PerformanceRecord.',
        indexes: 'userId_1, department_1'
      },
      {
        name: 'Workflow',
        type: 'MongoDB Collection',
        description: 'Logical Directed Acyclic Graph (DAG) structures defining automation dispatches and data prep pipelines.',
        fields: [
          { name: 'title', type: 'String (Required)', desc: 'Human-readable workflow label.' },
          { name: 'nodes', type: 'Array (JSON Schema)', desc: 'List of parsing blocks (triggers, conditions, actions).' },
          { name: 'edges', type: 'Array (JSON Schema)', desc: 'Lines connecting nodes.' },
          { name: 'isActive', type: 'Boolean', desc: 'True if automatically triggered by crons/webhooks.' }
        ],
        relationships: 'One-to-Many with Execution, One-to-Many with WorkflowLog.',
        indexes: 'title_1, isActive_1'
      }
    ],
    workflows: [
      {
        name: 'Autonomous Lead Sync & Validation',
        trigger: 'Webhook Event: HubSpot Deal Status Changed to Closed-Won',
        nodes: ['HubSpot Webhook Listener', 'Condition: Deal Value > $5,000', 'AI Quote Auditing Node', 'MongoDB Write: Create Client Account', 'Slack Notification dispatcher'],
        actions: ['Verify client credentials', 'Run local quote PDF analysis', 'Generate new account profiles', 'Send coordinator dispatches'],
        errorHandling: 'Redirect failures to Manual Validation Board, trigger self-healing circuit breaker resets.',
        executionFlow: 'HubSpot Webhook -> Check Condition -> Execute AI Audits -> Create Account -> Alert Team.'
      },
      {
        name: 'Daily Telemetry logs Analyzer',
        trigger: 'Time Event: Scheduled Daily Cron Run at 01:00 AM',
        nodes: ['Logs Directory Scanner', 'File Reader: Read temp_emails.log', 'Custom Node: Parse Error Patterns', 'circuit breaker test', 'Admin Alert Dispatcher'],
        actions: ['Search system audit records', 'Locate repeating exception templates', 'Log warning statistics', 'Notify administrative staff'],
        errorHandling: 'Suppress notification flags if connection drops, retry API query run after 10 minutes.',
        executionFlow: 'Cron Trigger -> Scan Directory -> Read Log -> Parse Exception -> Create Report -> Slack Alert.'
      }
    ],
    agents: [
      {
        name: 'Contract Intelligence Auditor',
        purpose: 'Analyzes cleaning contracts, verifies SLA hours clauses, and calculates invoice compliance grades.',
        prompt: 'You are an operations auditor. Parse contract text fields, locate weekly service hours, check pricing calculations, and return a confidence grade between 0 and 100.',
        inputs: 'Contract Text Documents (.txt, .pdf, .docx)',
        outputs: 'JSON Checklist: { SLA_verified: Boolean, weekly_hours: Number, pricing_match: Boolean, score: Number }',
        tools: 'PDF Parser, Mongoose Collection Reader, Email dispatch',
        connectedApis: '/api/sop/query, /api/tickets'
      },
      {
        name: 'SOP RAG Support Chatbot',
        purpose: 'Answers coordinators operational questions by executing vector database queries.',
        prompt: 'You are the One Janitorial Assistant. Answer customer queries by referencing the provided SOP text chunks. If context is missing, output: SOP document references not located.',
        inputs: 'Natural Language Questions',
        outputs: 'Grounded Answer Text + Document Citations Array',
        tools: 'Vector Cosine search, RAG text parser',
        connectedApis: '/api/sop/query'
      }
    ],
    userGuide: [
      {
        title: 'System Access & Authentication',
        description: 'Navigate to http://localhost:3000/login, enter email/password credentials, and solve Google MFA codes challenges to unlock your staff dashboard.'
      },
      {
        title: 'Managing Support Tickets',
        description: 'Open the Ticketing System panel from the navbar. Sort customer tickets by urgency level, review SLA timers, log replies, or mark items resolved.'
      },
      {
        title: 'Data Analytics Upload & Prep',
        description: 'Go to Analytics -> Data Prep. Click Ingest File to upload CSV/Excel files, rename columns, convert datatypes to Numbers, and calculate metrics.'
      }
    ],
    adminGuide: [
      {
        title: 'Managing User Access & Security',
        description: 'Access the Password Management page. Review employee account locks, force credentials resets, toggle roles access permissions, and check active MFA.'
      },
      {
        title: 'Auditing API Latency & Logs',
        description: 'Open System Monitoring. Track system thread load gauges, database synclists, custom API call counts, and background BullMQ queues backlog.'
      }
    ],
    developerGuide: [
      {
        title: 'Directory Layout',
        detail: 'The platform is split into a frontend folder (Vite SPA) and a backend folder (Express Server). Absolute folders store telemetry logs and uploads.'
      },
      {
        title: 'Building Custom Nodes',
        detail: 'Custom nodes are registered in the Node Factory. Each node extends base classes, defining input/output variables, parameter templates, and executors.'
      }
    ],
    integrations: [
      {
        name: 'HubSpot CRM Integration',
        purpose: 'Synchronizes client pipelines, closed deals, and contract values bi-directionally in real-time.',
        status: 'Connected',
        endpoints: ['POST /api/crm/deals', 'POST /api/crm/leads']
      },
      {
        name: 'Supabase Real-time Sync',
        purpose: 'Replicates primary MongoDB states to PostgreSQL database tables for SQL analytics dashboards.',
        status: 'Connected',
        endpoints: ['GET /api/integrations/health']
      }
    ],
    troubleshooting: [
      {
        issue: 'Vercel rewrite timeout errors',
        cause: 'Render backend takes too long to respond due to large mongo aggregations or cold starts.',
        solution: 'Inspect index configurations on target collections, limit dashboard query rows, or trigger manual cached data.'
      },
      {
        issue: 'CSV parsing error warning',
        cause: 'spreadsheet contains blank values in calculation columns or non-standard characters.',
        solution: 'Feed dataset to a Data Cleaner node, choose strategy (Fill with Averages, Drop Blank rows) and map types.'
      }
    ],
    releaseNotes: [
      {
        version: 'v4.0.0',
        date: 'June 2026',
        features: [
          'Enterprise Data Analytics Visual Center.',
          'Local automatic Route Explorer diagnostics dashboard.',
          'Integrated Sticky Global Navbar with role filtering dropdowns.',
          'Background child-process PDF manual compiler.'
        ]
      }
    ]
  };

  res.status(200).json(data);
};

export const generatePDFs = (req, res) => {
  console.log("Triggering PDF generation child process...");
  exec('node generate-docs.js', { cwd: 'c:/Users/KIRAN KUMAR/Downloads/one__janitorial/backend' }, (error, stdout, stderr) => {
    if (error) {
      console.error("PDF generation failed:", error, stderr);
      return res.status(500).json({ success: false, message: "PDF Compilation Failed", error: error.message });
    }
    console.log("PDF generation succeeded:", stdout);
    res.status(200).json({ success: true, message: "Master PDF manuals compiled successfully!" });
  });
};

export const getPDFFiles = (req, res) => {
  if (!fs.existsSync(docsDir)) {
    return res.status(200).json([]);
  }

  try {
    const files = fs.readdirSync(docsDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const stats = fs.statSync(path.join(docsDir, file));
        return {
          filename: file,
          sizeBytes: stats.size,
          mtime: stats.mtime
        };
      });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to read PDF directory", error: err.message });
  }
};
