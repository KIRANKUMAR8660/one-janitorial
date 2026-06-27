import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

// Define directories
const docsDir = 'c:/Users/KIRAN KUMAR/Downloads/one__janitorial/documentation';

// Configuration
const VERSION = 'v4.0.0';
const RELEASE_DATE = 'June 23, 2026';
const COLOR_PRIMARY = '#001F3F'; // Navy
const COLOR_SECONDARY = '#00A8E8'; // Sky Blue
const COLOR_NEUTRAL = '#333333';
const COLOR_BG = '#FFFFFF';
const COLOR_LIGHT_BG = '#F3F4F6';

// Helper to draw clean vector flowcharts inside PDF
function drawDiagram(doc, type, startY) {
  doc.strokeColor(COLOR_SECONDARY).lineWidth(1.5);
  
  if (type === 'architecture') {
    // 3-Tier Enterprise Stack
    doc.fillColor(COLOR_PRIMARY).rect(150, startY, 200, 25).fill();
    doc.fillColor('#FFFFFF').text('React Frontend SPA (Vite)', 185, startY + 8);
    
    doc.moveTo(250, startY + 25).lineTo(250, startY + 50).stroke();
    // Arrowhead
    doc.moveTo(246, startY + 44).lineTo(250, startY + 50).lineTo(254, startY + 44).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(130, startY + 50, 240, 25).fill();
    doc.fillColor('#FFFFFF').text('Node.js Express Backend (Port 5000)', 155, startY + 58);
    
    doc.moveTo(250, startY + 75).lineTo(250, startY + 100).stroke();
    // Arrowhead
    doc.moveTo(246, startY + 94).lineTo(250, startY + 100).lineTo(254, startY + 94).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(80, startY + 100, 150, 25).fill();
    doc.fillColor('#FFFFFF').text('MongoDB (User/SOPs/Datasets)', 92, startY + 108);
    
    doc.fillColor(COLOR_PRIMARY).rect(270, startY + 100, 150, 25).fill();
    doc.fillColor('#FFFFFF').text('Supabase Sync DB (Postgres)', 280, startY + 108);

  } else if (type === 'sync') {
    // Sync Command Flow
    doc.fillColor(COLOR_PRIMARY).rect(80, startY + 10, 130, 30).fill();
    doc.fillColor('#FFFFFF').text('HubSpot API (Deals)', 95, startY + 20);
    
    doc.moveTo(210, startY + 25).lineTo(290, startY + 25).stroke();
    doc.moveTo(284, startY + 21).lineTo(290, startY + 25).lineTo(284, startY + 29).stroke();
    doc.moveTo(216, startY + 21).lineTo(210, startY + 25).lineTo(216, startY + 29).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(290, startY + 10, 140, 30).fill();
    doc.fillColor('#FFFFFF').text('Supabase Sync (Pg)', 305, startY + 20);
    
    doc.fillColor(COLOR_SECONDARY).rect(170, startY + 50, 180, 20).fill();
    doc.fillColor('#FFFFFF').text('Sync Health Score: 98%', 200, startY + 56);

  } else if (type === 'coaching') {
    // Coaching Engine Input/Output Flow
    doc.fillColor(COLOR_PRIMARY).rect(60, startY, 110, 25).fill();
    doc.fillColor('#FFFFFF').text('KPI Performance', 75, startY + 8);
    
    doc.fillColor(COLOR_PRIMARY).rect(190, startY, 110, 25).fill();
    doc.fillColor('#FFFFFF').text('HubSpot + Tickets', 200, startY + 8);
    
    doc.fillColor(COLOR_PRIMARY).rect(320, startY, 120, 25).fill();
    doc.fillColor('#FFFFFF').text('RingCentral Transcripts', 325, startY + 8);
    
    doc.moveTo(115, startY + 25).lineTo(245, startY + 55).stroke();
    doc.moveTo(245, startY + 25).lineTo(245, startY + 55).stroke();
    doc.moveTo(380, startY + 25).lineTo(245, startY + 55).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(150, startY + 55, 190, 25).fill();
    doc.fillColor('#FFFFFF').text('Coaching Intelligence Engine', 165, startY + 63);

  } else if (type === 'workflow') {
    // DAG Workflow Nodes
    doc.fillColor(COLOR_PRIMARY).rect(50, startY + 15, 90, 25).fill();
    doc.fillColor('#FFFFFF').text('Trigger Node', 62, startY + 23);
    
    doc.moveTo(140, startY + 27).lineTo(180, startY + 27).stroke();
    doc.moveTo(174, startY + 23).lineTo(180, startY + 27).lineTo(174, startY + 31).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(180, startY + 15, 100, 25).fill();
    doc.fillColor('#FFFFFF').text('Condition Node', 192, startY + 23);
    
    doc.moveTo(280, startY + 27).lineTo(320, startY + 27).stroke();
    doc.moveTo(314, startY + 23).lineTo(320, startY + 27).lineTo(314, startY + 31).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(320, startY + 15, 110, 25).fill();
    doc.fillColor('#FFFFFF').text('Action/Call Node', 330, startY + 23);

  } else if (type === 'rag') {
    // RAG Pipeline
    doc.fillColor(COLOR_PRIMARY).rect(50, startY + 15, 90, 25).fill();
    doc.fillColor('#FFFFFF').text('SOP Ingest', 67, startY + 23);
    
    doc.moveTo(140, startY + 27).lineTo(170, startY + 27).stroke();
    doc.moveTo(164, startY + 23).lineTo(170, startY + 27).lineTo(164, startY + 31).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(170, startY + 15, 100, 25).fill();
    doc.fillColor('#FFFFFF').text('Text Chunking', 185, startY + 23);
    
    doc.moveTo(270, startY + 27).lineTo(300, startY + 27).stroke();
    doc.moveTo(294, startY + 23).lineTo(300, startY + 27).lineTo(294, startY + 31).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(300, startY + 15, 110, 25).fill();
    doc.fillColor('#FFFFFF').text('Vector Store DB', 315, startY + 23);

  } else if (type === 'healing') {
    // Self-Healing Lifecycle
    doc.fillColor(COLOR_PRIMARY).rect(60, startY, 120, 25).fill();
    doc.fillColor('#FFFFFF').text('Workflow Fail', 92, startY + 8);
    
    doc.moveTo(180, startY + 12).lineTo(220, startY + 12).stroke();
    doc.moveTo(214, startY + 8).lineTo(220, startY + 12).lineTo(214, startY + 16).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(220, startY, 140, 25).fill();
    doc.fillColor('#FFFFFF').text('Circuit Breaker Check', 232, startY + 8);
    
    doc.moveTo(290, startY + 25).lineTo(290, startY + 50).stroke();
    doc.moveTo(286, startY + 44).lineTo(290, startY + 50).lineTo(294, startY + 44).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(200, startY + 50, 180, 20).fill();
    doc.fillColor('#FFFFFF').text('Self-Recovery / Alert', 222, startY + 56);
  } else {
    // Default flow diagram
    doc.fillColor(COLOR_PRIMARY).rect(100, startY + 15, 120, 25).fill();
    doc.fillColor('#FFFFFF').text('Input Event', 135, startY + 23);
    
    doc.moveTo(220, startY + 27).lineTo(280, startY + 27).stroke();
    doc.moveTo(274, startY + 23).lineTo(280, startY + 27).lineTo(274, startY + 31).stroke();
    
    doc.fillColor(COLOR_PRIMARY).rect(280, startY + 15, 120, 25).fill();
    doc.fillColor('#FFFFFF').text('Process / Output', 300, startY + 23);
  }
}

// Helper to draw clean callout blocks like Github Alerts
function drawCallout(doc, text, x, y, width, type = 'note') {
  const padding = 10;
  const bgColor = type === 'warning' ? '#FFF5F5' : COLOR_LIGHT_BG;
  const borderColor = type === 'warning' ? '#E53E3E' : COLOR_SECONDARY;
  
  doc.font('Helvetica').fontSize(9);
  const textHeight = doc.heightOfString(text, { width: width - (padding * 2) });
  const boxHeight = textHeight + (padding * 2);
  
  // Background
  doc.fillColor(bgColor).rect(x, y, width, boxHeight).fill();
  // Left border
  doc.fillColor(borderColor).rect(x, y, 4, boxHeight).fill();
  // Text
  doc.fillColor(COLOR_NEUTRAL).text(text, x + padding, y + padding, { width: width - (padding * 2), align: 'justify' });
  
  return boxHeight;
}

// PDF Document Compiler
function compileDocument(info) {
  const filePath = path.join(docsDir, info.filename);
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  
  // 1. COVER PAGE (Page 1)
  doc.rect(0, 0, 595.28, 120).fill(COLOR_PRIMARY);
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text(info.title, 50, 40);
  doc.fillColor(COLOR_SECONDARY).fontSize(11).font('Helvetica').text(info.subtitle, 50, 80);
  
  doc.fillColor(COLOR_PRIMARY).fontSize(10).font('Helvetica-Bold').text(`One Janitorial Operations Library`, 50, 150);
  doc.fillColor(COLOR_NEUTRAL).fontSize(9).font('Helvetica').text(`Version: ${VERSION}`, 50, 168);
  doc.fillColor(COLOR_NEUTRAL).fontSize(9).font('Helvetica').text(`Release Date: ${RELEASE_DATE}`, 50, 182);
  doc.fillColor(COLOR_NEUTRAL).fontSize(9).font('Helvetica').text(`Author: Antigravity Automated AI`, 50, 196);
  
  doc.rect(50, 215, 495, 2).fill(COLOR_SECONDARY);
  
  // Table of Contents Section
  doc.fillColor(COLOR_PRIMARY).fontSize(12).font('Helvetica-Bold').text('Table of Contents', 50, 235);
  const tocSections = [
    'Overview & Purpose',
    'Key Features & Blueprint',
    'System Process Flow (Vector Diagram)',
    'Step-by-Step Usage & Operations',
    'Best Practices & Safety Guidelines',
    'Troubleshooting & FAQ',
    'Glossary & Appendix'
  ];
  let tocY = 260;
  tocSections.forEach((secName, idx) => {
    doc.fillColor(COLOR_NEUTRAL).fontSize(9.5).font('Helvetica').text(`${idx + 1}. ${secName}`, 60, tocY);
    tocY += 18;
  });
  
  doc.addPage();
  
  // 2. RENDER CONTENT SECTIONS (Page 2+)
  let currentY = 65; // Content starts below header line
  
  const sectionsToRender = [
    { heading: '1. Overview & Purpose', content: info.overview },
    { heading: '2. Key Features & Blueprint', content: info.keyFeatures },
    { heading: '3. System Process Flow', isDiagram: true },
    { heading: '4. Step-by-Step Usage & Operations', content: info.stepByStep },
    { heading: '5. Best Practices & Safety Guidelines', content: info.bestPractices, isCallout: true, calloutType: 'note' },
    { heading: '6. Troubleshooting & FAQ', content: info.troubleshooting, isCallout: true, calloutType: 'warning' },
    { heading: '7. Glossary & Appendix', content: info.glossary }
  ];
  
  sectionsToRender.forEach((sec) => {
    // Add spacing between sections
    if (currentY > 65) {
      currentY += 15;
    }
    
    // Check space for heading
    if (currentY > 700) {
      doc.addPage();
      currentY = 65;
    }
    
    // Draw Section Heading
    doc.fillColor(COLOR_PRIMARY).fontSize(12).font('Helvetica-Bold').text(sec.heading, 50, currentY);
    currentY += 18;
    
    if (sec.isDiagram) {
      let diagHeight = 70;
      if (info.diagramType === 'architecture') {
        diagHeight = 140;
      } else if (info.diagramType === 'coaching' || info.diagramType === 'healing') {
        diagHeight = 90;
      }
      
      if (currentY + diagHeight + 20 > 720) {
        doc.addPage();
        currentY = 65;
        // Redraw heading on new page if it was split
        doc.fillColor(COLOR_PRIMARY).fontSize(12).font('Helvetica-Bold').text(sec.heading + ' (Continued)', 50, currentY);
        currentY += 18;
      }
      
      // Draw diagram box boundary
      doc.fillColor('#FAFAFA').rect(50, currentY, 495, diagHeight).fill();
      drawDiagram(doc, info.diagramType || 'workflow', currentY + 5);
      currentY += diagHeight + 15;
      
    } else if (sec.isCallout) {
      // Render content paragraphs inside a callout box
      sec.content.forEach((p) => {
        const textHeight = doc.heightOfString(p, { width: 475 }); // 495 - padding
        const boxHeight = textHeight + 20;
        
        if (currentY + boxHeight > 720) {
          doc.addPage();
          currentY = 65;
        }
        
        const actualBoxHeight = drawCallout(doc, p, 50, currentY, 495, sec.calloutType);
        currentY += actualBoxHeight + 10;
      });
      
    } else {
      // Standard text paragraphs
      doc.font('Helvetica').fontSize(9.5).fillColor(COLOR_NEUTRAL);
      sec.content.forEach((p) => {
        const textHeight = doc.heightOfString(p, { width: 495 });
        if (currentY + textHeight > 720) {
          doc.addPage();
          currentY = 65;
        }
        doc.text(p, 50, currentY, { width: 495, align: 'justify' });
        currentY += textHeight + 10;
      });
    }
  });
  
  // 3. DRAW GLOBAL HEADERS, FOOTERS & PAGE NUMBERS (using buffered page range)
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (i === 0) {
      // Cover page gets a thin bottom border to look premium
      doc.strokeColor(COLOR_SECONDARY).lineWidth(3);
      doc.moveTo(0, 835).lineTo(595.28, 835).stroke();
      continue;
    }
    
    // Draw Header Line
    doc.strokeColor(COLOR_SECONDARY).lineWidth(1);
    doc.moveTo(50, 45).lineTo(545, 45).stroke();
    
    doc.fillColor(COLOR_PRIMARY).font('Helvetica-Bold').fontSize(8);
    doc.text('ONE JANITORIAL | OPERATIONS & TECHNOLOGY MANUAL', 50, 32);
    
    doc.fillColor(COLOR_NEUTRAL).font('Helvetica').fontSize(8);
    const rightHeaderText = info.title.toUpperCase();
    doc.text(rightHeaderText, 545 - doc.widthOfString(rightHeaderText), 32);
    
    // Draw Footer Line
    doc.strokeColor(COLOR_SECONDARY).lineWidth(0.5);
    doc.moveTo(50, 765).lineTo(545, 765).stroke();
    
    doc.fillColor(COLOR_NEUTRAL).font('Helvetica').fontSize(7.5);
    doc.text(`Version ${VERSION} | Released ${RELEASE_DATE} | Confidential`, 50, 772);
    
    const pageNumText = `Page ${i + 1} of ${range.count}`;
    doc.text(pageNumText, 545 - doc.widthOfString(pageNumText), 772);
  }
  
  doc.end();
  console.log(`Successfully compiled: ${info.filename}`);
}

// Define the 20 guides database structures updated for v3 (Analytics & Global Navbar)
const documents = [
  {
    filename: 'Executive Overview.pdf',
    title: 'Executive Overview',
    subtitle: 'Strategic Blueprint to Enterprise AI & Data Operations',
    diagramType: 'architecture',
    overview: [
      'The One Janitorial Executive Operations Platform represents a paradigm shift in commercial cleaning management, replacing manual routing, compliance auditing, and employee coaching with autonomous orchestrator entities.',
      'By linking HubSpot pipeline events, Supabase schemas, and vector document chunks, the system automates client onboarding and service validation loops, providing managers with real-time insight into performance across all franchises.',
      'Version 3 integrates the new Enterprise Data Analytics Center and sticky Global Navbar. Executives can now build custom dashboards, parse CSV/Excel/JSON files, and receive AI-grounded operational insights instantly.'
    ],
    keyFeatures: [
      'Centralized Operations Dashboard: A unified control console that aggregates ticket resolution status, CRM lead sync statistics, and active workflow health.',
      'Enterprise Data Analytics Center: Tableau-style visualization studio that supports bulk uploads, data cleaning, descriptive calculations, and advanced predictive forecasts.',
      'Sticky Global Navbar: Role-filtered sticky header providing one-click access to all core modules (CRM, HR, Workflows, Tickets, Analytics, and Monitoring).'
    ],
    stepByStep: [
      'Accessing the Executive Dashboard: Log in using authorized executive credentials to view cross-platform metrics, API usage costs, and active system alerts.',
      'Navigating the Global Navbar: Access restricted panels like Analytics and Monitoring by clicking active link selectors in the sticky header menu.',
      'Analyzing Datasets: Upload business CSV records in the Analytics panel, execute statistical typecast checks, and consult the AI Assistant for recommendations.'
    ],
    bestPractices: [
      'Audit the CRM synchronization queues weekly to ensure no lead discrepancies between local MongoDB stores and HubSpot CRM pipelines.',
      'Enforce password restrictions and expiry dates when sharing public dashboards containing sensitive invoice values.',
      'Verify that all regional franchise profiles are kept active and up-to-date to maintain accurate routing operations.'
    ],
    troubleshooting: [
      'Discrepancies in dashboard counters: Trigger a manual HubSpot sync replay using the repair API endpoint in the console.',
      'Slow dashboard load times: Inspect MongoDB index configurations for collections tracking system logs and transactions.',
      'Mismatched columns: In the Data Prep Studio, rename variables and convert datatypes to normalize uploaded datasets.'
    ],
    glossary: [
      'SLA: Service Level Agreement - The target timeline for resolving client issues based on ticket priority levels.',
      'ROI: Return on Investment - The measured efficiency gains and cost savings generated by platform automation.',
      'Data Lineage: Traceable history mapping the origin and modifications applied to a specific data collection.'
    ]
  },
  {
    filename: 'Complete User Manual.pdf',
    title: 'Complete User Manual',
    subtitle: 'Step-by-Step Operator Guide for Frontline Staff',
    diagramType: 'workflow',
    overview: [
      'This user manual provides frontline coordinators, dispatchers, and cleaning managers with the step-by-step instructions needed to operate the One Janitorial platform.',
      'Operators will learn how to manage service requests, interact with the SOP chatbot assistant, view active workflow progress, and process candidate profiles.',
      'Additionally, users can now access the central Analytics dashboard via the Global Navbar to import and clean files, check descriptive statistics, and build reports.'
    ],
    keyFeatures: [
      'Ticketing Worklist: A dynamic, real-time board displaying active customer support tickets, sorted by urgency and SLA target timelines.',
      'SOP Chatbot Panel: An embedded AI assistant capable of looking up operational manuals and training documents using semantic search.',
      'Data Ingestion Studio: Drag-and-drop file ingestion module supporting CSV and Excel spreadsheets.'
    ],
    stepByStep: [
      'Logging into the Interface: Navigate to http://localhost:3000/login, choose your coordinator account, and input your password.',
      'Using the Global Navbar: Switch between Tickets, CRM, HR, and Analytics instantly from the sticky navigation header.',
      'Asking the AI Assistant: Go to Analytics -> AI Assistant, type questions about metrics, and review recommended action lists.'
    ],
    bestPractices: [
      'Always request customer ratings upon ticket closure to populate performance scorecards.',
      'Review chatbot suggestions carefully before copy-pasting answers to client communications.',
      'Verify uploaded CSV column headers in the data preview grid before running prep pipelines.'
    ],
    troubleshooting: [
      'Login fails with invalid credentials: Use the self-service reset option or contact your system administrator.',
      'Ticketing board fails to update: Check connection status and refresh the page to renew the WebSocket subscription.',
      'Upload format rejected: Ensure file extension is CSV, JSON, XML, or TXT. Excel files should be exported to CSV.'
    ],
    glossary: [
      'Coordinator: Frontline operations staff member responsible for ticket management and dispatch scheduling.',
      'CSAT: Customer Satisfaction Score - A metric derived from feedback surveys sent to clients after ticket resolution.',
      'Dashboard Widget: Reusable graphical card (Line, Bar, Pie) rendering aggregate metrics.'
    ]
  },
  {
    filename: 'Administrator Guide.pdf',
    title: 'Administrator Guide',
    subtitle: 'System Administration, Security, and Analytics Config Manual',
    diagramType: 'healing',
    overview: [
      'Administrative blueprint for setting up, managing, and securing the One Janitorial environment. Explains role-based access controls, security settings, and audit logs.',
      'System administrators will learn how to manage staff profiles, toggle MFA requirements, rotate credentials, and inspect system log metrics.',
      'Administrators control sharing settings, password hashes, and expiry rules for public analytics URLs.'
    ],
    keyFeatures: [
      'User Account Provisioning Console: Direct interface to create, modify, suspend, or reactivate staff accounts.',
      'Secure Sharing Manager: Control panel enforcing passwords, expiration limits, and role access constraints on shared links.',
      'Global Sticky Menu Configuration: RBAC filter system controlling navbar visibility across different roles.'
    ],
    stepByStep: [
      'Provisioning a User: Go to Admin settings, click Create User, fill profile fields, select user role, and set initial access password.',
      'Auditing Share Links: Open Analytics -> Shared Reports. Inspect active URLs, view count statistics, and manually expire links.',
      'Monitoring API Performance: Open the Monitoring page from the Navbar to track latency averages and background queue backlogs.'
    ],
    bestPractices: [
      'Enforce password updates every 90 days for all administrative and manager accounts.',
      'Restrict API credentials permissions to prevent unauthorized scope leaks.',
      'Regularly review the WebSocket Monitoring Console to track query delays.'
    ],
    troubleshooting: [
      'Locked accounts: Search for user in directory, click Unlock Profile, and issue reset passcode.',
      'SMTP connection fails: Inspect configuration parameters and verify credentials of SMTP gateway.',
      'Replication lag: Open the Supabase Admin console and restart the Postgres synchronization worker thread.'
    ],
    glossary: [
      'JWT: JSON Web Token - Used for secure session authentication.',
      'RBAC: Role-Based Access Control - Restrictions mapping features to specific staff profiles.',
      'MFA: Multi-Factor Authentication - OTP checks verifying credentials.'
    ]
  },
  {
    filename: 'Workflow Automation Guide.pdf',
    title: 'Workflow Automation Guide',
    subtitle: 'Configuring DAG Workflows and Analytics Node Library',
    diagramType: 'workflow',
    overview: [
      'Technical reference for defining and building Automated Directed Acyclic Graph (DAG) workflows. Explains node connections, parameters, and execution triggers.',
      'Learn how to orchestrate autonomous cleaning campaigns, customer responses, and invoice processing by wiring modular steps together.',
      'Version 3 integrates 13 new Analytics nodes, allowing workflows to ingest files, compute averages, run forecast models, and distribute PDF reports automatically.'
    ],
    keyFeatures: [
      'Drag-and-Drop Workflow Canvas: A visual builder allowing designers to drag triggers, conditions, and actions into executable graphs.',
      'Analytics Node Library: Reusable processing blocks (Data Import, Data Cleaner, Aggregation, Forecast, Visualization, Report Generator, Share Link).',
      'Real-Time Execution Inspector: Terminal displaying logs and execution metrics for each active workflow path.'
    ],
    stepByStep: [
      'Creating a new flow: Click Create Workflow, drag a Trigger node, drag action nodes, connect terminals, and click Validate.',
      'Wiring Analytics Nodes: Connect a CSV Reader node to an Aggregation node, map output values, and feed into a Share Report node.',
      'Deploying to production: Click Deploy to publish workflow. The workflow immediately registers with the execution engine.'
    ],
    bestPractices: [
      'Avoid circular loops in paths by verifying node dependency directions before deploying.',
      'Ensure every external API call node is followed by a fallback node to handle timeouts.',
      'Always append a Data Cleaner node before Aggregation nodes to filter blank values.'
    ],
    troubleshooting: [
      'Node validation fails: Inspect connection lines for disconnected inputs or missing parameter values.',
      'Aggregation typecast errors: Ensure the input column datatype is converted to Number before running sum/averages.',
      'Workflow freezes: Check active status of BullMQ worker daemon and Redis database connection.'
    ],
    glossary: [
      'DAG: Directed Acyclic Graph - A flow model with no circular loops.',
      'Workflow: A sequence of connected nodes representing a business process.',
      'Aggregation: Mathematical summarization of record columns (e.g. sum, count, mean).'
    ]
  },
  {
    filename: 'AI Agent Management Guide.pdf',
    title: 'AI Agent Management Guide',
    subtitle: 'Deploying, Prompting, and Auditing Autonomous AI Agents',
    diagramType: 'rag',
    overview: [
      'Operator manual for deploying, prompt engineering, and auditing autonomous LLM agents. Explains safety checks and performance logs.',
      'Ensures that agents executing emails, auditing cleaning contracts, and ranking candidates function safely and within budget limits.',
      'Includes instructions for configuring the AI Analytics Assistant to parse and answer queries.'
    ],
    keyFeatures: [
      'System Instruction Editor: Configurator for defining agent personalities, guardrails, and target outputs.',
      'AI Analytics Node: Custom workflow node executing LLM semantic queries against database tables.',
      'Human-in-the-Loop Override Panel: Dashboard showing flagged low-confidence decisions waiting for human validation.'
    ],
    stepByStep: [
      'Editing Agent Prompts: Access AI Control Center, select target agent (e.g. Resume Evaluator), edit system text, and save draft.',
      'Configuring AI Analytics: Enter context guidelines in the AI Analytics Node parameter editor inside the DAG canvas.',
      'Reviewing Evaluations: Go to Quality tab, inspect agent decision scores, and override incorrect decisions to train the engine.'
    ],
    bestPractices: [
      'Use explicit negative rules in prompts to avoid AI hallucination and unauthorized action triggers.',
      'Perform prompt testing in sandbox modes using mock ticket events before deploying.',
      'Set agent decision confidence thresholds to 85% to ensure safety checks are respected.'
    ],
    troubleshooting: [
      'High hallucination rates: Check prompt context length, decrease temperature parameters, and clarify prompt rules.',
      'AI Analytics timeout: Split large datasets into chunks before routing to AI nodes.',
      'API budget spikes: Review call volume loops and implement caching policies for duplicate queries.'
    ],
    glossary: [
      'LLM: Large Language Model - The underlying AI engine.',
      'Prompt: Instructions and context provided to steer the AI agent behavior.',
      'Hallucination: Erroneous AI outputs not grounded in context data.'
    ]
  },
  {
    filename: 'HubSpot Integration Guide.pdf',
    title: 'HubSpot Integration Guide',
    subtitle: 'Bi-directional HubSpot Pipelines & Analytics Sync Architecture',
    diagramType: 'sync',
    overview: [
      'Synchronization manual for maintaining contact, company, and deal records between HubSpot CRM and local databases.',
      'Ensures sales updates are captured in real-time, triggering cleaning dispatch operations immediately when a deal is closed.',
      'HubSpot deals and contacts sync directly with the Analytics Center as a primary source.'
    ],
    keyFeatures: [
      'Real-Time Webhook Consumer: Express endpoint listening to deal and contact status change events in HubSpot.',
      'CRM Pipeline Analytics: Prebuilt dashboards rendering closed-won values and sales representative conversion charts.',
      'Local Fallback Adapter: Simulation engine that mocks CRM activities if the API gateway encounters connection failures.'
    ],
    stepByStep: [
      'Activating Webhooks: Enter HubSpot API key in the configuration console and test the webhook subscription handshake.',
      'Ingesting HubSpot Data: Open Analytics -> Upload Center, select HubSpot as source, and load synced deal records.',
      'Manually Resolving Discrepancies: Open CRM Sync panel, review conflict list, choose master record database, and execute repair.'
    ],
    bestPractices: [
      'Map custom property keys exactly to database models to prevent schema mismatches.',
      'Run a full sync check daily during low-traffic hours to reconcile database counts.',
      'Clean stale CRM records before synchronizing with the analytics dashboard.'
    ],
    troubleshooting: [
      'Webhook sync failures: Check server SSL certificate status and ensure port 5000 is open to external web traffic.',
      'Sync lag in CRM charts: Re-run manual sync trigger in the Advanced Console.',
      'Rate limit errors: Implement request throttling inside integration adapters to respect HubSpot api limits.'
    ],
    glossary: [
      'CRM: Customer Relationship Management.',
      'Webhook: HTTP POST callback for real-time CRM updates.',
      'Sync History: MongoDB ledger recording sync success counts and discrepancies.'
    ]
  },
  {
    filename: 'Supabase Integration Guide.pdf',
    title: 'Supabase Integration Guide',
    subtitle: 'PostgreSQL Real-Time Database Replication & SQL Analytics Manual',
    diagramType: 'sync',
    overview: [
      'Technical manual detailing PostgreSQL replication, schema mapping, and query execution on Supabase.',
      'Enables real-time data sync for ticketing and user data, ensuring consistent database state across instances.',
      'Provides direct Postgres data source capabilities inside the Analytics Center.'
    ],
    keyFeatures: [
      'PostgreSQL Sync Worker: Backend service that maps MongoDB document states to relational PostgreSQL tables.',
      'Ad-hoc SQL Console: Console for administrators to run direct schema queries and review index health.',
      'Supabase Query Node: Workflow node executing raw Postgres queries and parsing returned arrays.'
    ],
    stepByStep: [
      'Configuring Supabase Connection: Enter endpoint host credentials in system configuration panels.',
      'Mapping Analytics Sources: Select Supabase tables inside the Data Catalog to register them for visualization widgets.',
      'Executing Sync Health Checks: Select connection test tool and verify response times from PostgreSQL cluster.'
    ],
    bestPractices: [
      'Create matching indexes on target tables to optimize replication query performance.',
      'Back up Supabase tables configuration files to allow quick replication rebuilds.',
      'Limit SQL query outputs to avoid loading excessive rows into memory.'
    ],
    troubleshooting: [
      'Replication lag: Open the sync manager and check active worker process threads.',
      'SQL Query timeouts: Verify syntax structures, add target row limits, and inspect index health.',
      'Database connection drops: Confirm that firewall rules allow traffic from the host IP to the Supabase host.'
    ],
    glossary: [
      'PostgreSQL: The relational database hosted on Supabase.',
      'Replication: The process of copying database tables in real-time.',
      'Ad-hoc SQL: Direct query statements executed on the schema.'
    ]
  },
  {
    filename: 'CRM Automation Guide.pdf',
    title: 'CRM Automation Guide',
    subtitle: 'Lead Hygiene, Assignment, and Sales Pipeline Analytics',
    diagramType: 'sync',
    overview: [
      'Strategic manual for managing sales automation, including lead assignment, routing, and closed-won contract drafts.',
      'Ensures no client lead is left neglected and coordinates tasks between sales reps automatically.',
      'Integrates sales metrics dashboard detailing rep conversion trends.'
    ],
    keyFeatures: [
      '7-Day Inactivity Scanner: Cron-based script identifying unaddressed leads and flagging them for re-routing.',
      'Round-Robin Assignment: Algorithm ensuring equal distribution of newly received leads among active sales reps.',
      'Sales Dashboard Widget: Render conversion percentages and leaderboard metrics.'
    ],
    stepByStep: [
      'Setting Rep Schedules: Open CRM Admin, select sales profiles, define working schedules, and toggle active routing.',
      'Customizing Welcome Email Dispatches: Edit template texts, map contact properties, and trigger tests.',
      'Reviewing Sales Pipeline: Navigate to Global Navbar -> Analytics, select Sales Dashboard, and analyze conversion logs.'
    ],
    bestPractices: [
      'Verify email templates across major clients before automating closed-won email campaigns.',
      'Audit representative response times monthly to optimize assignment thresholds.',
      'Exclude test leads from pipeline analytics to prevent metrics drift.'
    ],
    troubleshooting: [
      'Leads not routing: Confirm representative is marked active in routing dashboard and check cron worker status.',
      'Missing metrics in sales dashboard: Ensure synced deal statuses in HubSpot match local database keys.',
      'Failed contract generations: Verify template formatting structure and confirm PDF generator library is active.'
    ],
    glossary: [
      'Lead Hygiene: The task of scanning and cleaning stale lead records.',
      'Round-Robin: A fair distribution model for sales opportunities.',
      'Pipeline Value: Total value of active deals locked in sales stages.'
    ]
  },
  {
    filename: 'Ticket Management Guide.pdf',
    title: 'Ticket Management Guide',
    subtitle: 'Customer Service SLA Compliance and Ticketing Analytics',
    diagramType: 'coaching',
    overview: [
      'Operations guide for resolving customer tickets, managing SLAs, and reviewing customer feedback.',
      'Ensures service complaints are resolved quickly by using auto-escalation pathways.',
      'Provides customer service analytics for ticket resolution SLA audits.'
    ],
    keyFeatures: [
      'SLA Priority Matrix: Dynamic resolution timers based on ticket severity (Urgent, High, Medium, Low).',
      'Negative Rating Auto-Escalation: Trigger that creates escalations if a client issues a thumbs-down score to the chatbot.',
      'CSAT Metrics Widget: Visualization rendering average customer feedback scores.'
    ],
    stepByStep: [
      'Claiming an SLA Ticket: Navigate to support panel, sort tickets by deadline, select item, and read issue.',
      'Viewing Customer Feedback: Open Chatbot Feedback panel to inspect negative reviews and linked transcripts.',
      'Analyzing Ticket Backlog: Navigate to Analytics -> CS Dashboard, audit resolution averages, and identify bottleneck regions.'
    ],
    bestPractices: [
      'Handle urgent complaints within 4 hours to avoid automatic escalation warnings.',
      'Attach relevant SOP references to ticket logs to build knowledge history.',
      'Regularly review ticket category distributions in analytics to optimize staff allocation.'
    ],
    troubleshooting: [
      'SLA timers missing: Verify ticket creation date structures and confirm priority is set.',
      'Feedback logs blank: Confirm that chatbot ratings are synchronizing and check collection logs.',
      'Escalation emails not firing: Check status of email sender node configuration settings.'
    ],
    glossary: [
      'SLA: Service Level Agreement - Target timelines for resolving issues.',
      'Escalation: Route tickets to managers when SLA limits approach.',
      'CSAT: Customer Satisfaction Score.'
    ]
  },
  {
    filename: 'HR Automation Guide.pdf',
    title: 'HR Automation Guide',
    subtitle: 'Recruitment, AI Screening, and Employee Directory Analytics',
    diagramType: 'rag',
    overview: [
      'User manual for processing applicants, ranking resumes, and maintaining worker files.',
      'Leverages AI screening to automate candidate reviews, ranking applicants on qualifications.',
      'Integrates HR dashboards to monitor recruitment volume, pass rates, and training performance averages.'
    ],
    keyFeatures: [
      'Drag-and-Drop Resume Ingest: Tool for uploading candidate documents to trigger screening workflows.',
      'Applicant Scorecard: Matrix containing AI-calculated criteria grades, overall rankings, and summaries.',
      'HR Analytics Dashboard: Analytics view rendering hire rates, employee distribution, and training scores.'
    ],
    stepByStep: [
      'Uploading Candidate Files: Navigate to HR panel, drag resume PDFs to ingest box, and click parse.',
      'Hiring Candidate: Click Hire on high-scoring card. System automatically creates an employee record.',
      'Auditing Employee Performance: Navigate to Analytics -> HR Dashboard, and inspect scorecards averages.'
    ],
    bestPractices: [
      'Review AI summary scores manually before making final interview decisions.',
      'Clean applicant databases monthly to comply with records storage standards.',
      'Validate training records status weekly to maintain up-to-date performance logs.'
    ],
    troubleshooting: [
      'File parse failures: Ensure file extension is supported and check file content for corruption.',
      'Scores missing in directory: Confirm that employee training logs are registered under their active ID.',
      'Missing resume text: Run scanned documents through OCR nodes to convert images to readable text.'
    ],
    glossary: [
      'AI Screening: Automated summary and grade calculation.',
      'Employee Profile: A database log representing active staff records.',
      'Training Scorecard: Metric measuring staff compliance exams.'
    ]
  },
  {
    filename: 'Reporting & Analytics Guide.pdf',
    title: 'Reporting & Analytics Guide',
    subtitle: 'Tableau-Style Centralized Analytics, Dashboard Builder, and Report Engine',
    diagramType: 'coaching',
    overview: [
      'Operations manual for tracking platform performance, API costs, call volume, and agent output.',
      'Provides administrators and managers with Tableau-style centralized analytics, dashboard builder, and report exporter.',
      'Enables staff to configure delivery schedules, share links safely, and clean raw uploaded data.'
    ],
    keyFeatures: [
      'centralized Data Studio: Panel providing file cleaning, column renaming, null handling, and typecasts.',
      'Custom Dashboard Builder: Visual canvas supporting Line/Bar/Pie charts, KPI widgets, and gauges.',
      'Secure Sharing: Links generator enabling passwords, expiry settings, and private role filters.'
    ],
    stepByStep: [
      'Building a Dashboard: Open Dashboard Builder tab, select active dashboard title, and click Add Widget.',
      'Exporting Reports: Choose export options (PDF, Excel, Word, CSV) and click download to compile files.',
      'Configuring Schedules: Go to Scheduled Sharing, input task name, set execution rate, choose channel, and save.'
    ],
    bestPractices: [
      'Export cost metrics weekly to check for anomalies in API call loops.',
      'Use password protection whenever dashboard share links are published externally.',
      'Verify that scheduled cron tasks do not conflict with system maintenance periods.'
    ],
    troubleshooting: [
      'Stale charts data: Refresh system caching keys and verify connection of MongoDB aggregation pipelines.',
      'Share link expired: Access Sharing settings and extend expiration dates.',
      'Missing call statistics: Verify that the RingCentral API integration status is active.'
    ],
    glossary: [
      'Descriptive Analytics: Standard calculations mapping basic statistics.',
      'KPI Widget: Card rendering a single critical metric value.',
      'Scheduled Delivery: Automated report dispatches via Email/Slack/Teams.'
    ]
  },
  {
    filename: 'AI Chatbot Guide.pdf',
    title: 'AI Chatbot Guide',
    subtitle: 'Operational SOP Assistant & Natural Language Data Queries',
    diagramType: 'healing',
    overview: [
      'Guide to operating and maintaining the SOP assistant chatbot, including review of customer satisfaction metrics.',
      'Allows managers to audit conversations, review client ratings, and refine system knowledge bases.',
      'Explains conversational AI query structures inside the Analytics Assistant.'
    ],
    keyFeatures: [
      'SOP Semantic Query Box: User-facing chatbot addressing operational questions using stored manuals.',
      'AI Analytics Assistant: Conversational tab allowing operators to ask direct questions about data.',
      'Correction Engine: Panel showing low ratings, letting admins map queries to updated documents.'
    ],
    stepByStep: [
      'Interacting with the Chatbot: Open chat module, type question, read response, and provide rating.',
      'Running AI Queries: Go to Analytics -> AI Assistant, input operational queries, and view chart recommendations.',
      'Training Chatbot: Access Chatbot settings, check feedback list, select query, and map to correct SOP.'
    ],
    bestPractices: [
      'Check feedback lists daily to address low ratings immediately.',
      'Review AI suggested charts before adding them to permanent dashboards.',
      'Ensure that uploaded manuals are kept up-to-date with current procedures.'
    ],
    troubleshooting: [
      'Chatbot unresponsiveness: Confirm backend service is running and check vector store database connectivity.',
      'AI Assistant gives generic replies: Provide specific dataset IDs and clarify column names in the prompt.',
      'Inaccurate search results: Verify that target SOP documents are loaded and indexed in the RAG library.'
    ],
    glossary: [
      'Feedback Loop: Process of improving chatbot response quality based on user reviews.',
      'Semantic Lookup: Contextual search mechanism.',
      'Conversational Query: Natural language prompt requesting numerical statistics.'
    ]
  },
  {
    filename: 'RAG Knowledge Base Guide.pdf',
    title: 'RAG Knowledge Base Guide',
    subtitle: 'Semantic Document Ingestion, Vector Chunking, and Analytics Grounding',
    diagramType: 'rag',
    overview: [
      'Technical reference manual for managing the Retrieval-Augmented Generation (RAG) platform. Explains chunking and vector lookup.',
      'Details document upload rules, vector spacing configurations, and search parameters.',
      'Explains how vector indexing is connected to the analytics platform.'
    ],
    keyFeatures: [
      'Document Chunking Processor: Logic dividing texts into 2000-character blocks with 200-character overlaps.',
      'Vector Search Engine: Pipeline retrieving context blocks matching user input.',
      'RAG Grounding: Pipeline matching customer complaints to specific training chunks.'
    ],
    stepByStep: [
      'Ingesting new SOPs: Navigate to RAG section, select document, run validation, and click Index Document.',
      'Querying indexed context: Navigate to SOP query panel, type search keys, and view retrieved chunks.',
      'Evaluating Search Weights: Run sample queries inside tests box, and audit returned relevance factors.'
    ],
    bestPractices: [
      'Keep text files clean of non-standard characters to optimize chunk divisions.',
      'Set overlap thresholds appropriately to maintain contextual continuity across sections.',
      'Index updated manuals promptly to ensure chatbot answers remain correct.'
    ],
    troubleshooting: [
      'Vector search returns empty blocks: Confirm target file is fully indexed and check database connection.',
      'Parser fails: Ensure file encoding is UTF-8 before loading into the ingestion dashboard.',
      'Irrelevant results returned: Increase relevance threshold values inside search options.'
    ],
    glossary: [
      'RAG: Retrieval-Augmented Generation - Grounding AI output in files.',
      'Chunking: Splitting documents into small text chunks.',
      'Cosine Similarity: Metric calculating semantic closeness.'
    ]
  },
  {
    filename: 'File Processing Guide.pdf',
    title: 'File Processing Guide',
    subtitle: 'PDF, Excel, CSV, Word, and OCR Node Operations',
    diagramType: 'workflow',
    overview: [
      'Detailed guide to running file upload, text extraction, invoice matching, and OCR nodes in workflows.',
      'Ensures invoice details, resumes, and client orders are processed securely and structured automatically.',
      'Explains how CSV Reader and Excel Reader nodes handle uploaded data sources.'
    ],
    keyFeatures: [
      'OCR Text Extractor: Core node analyzing scanned image files to extract text characters.',
      'Excel Reader Node: Visual node parsing spreadsheet sheets and outputting JSON structures.',
      'CSV Reader Node: Parser split-rendering comma-delimited data files.'
    ],
    stepByStep: [
      'Adding Parse Node: Wire file upload target output to PDF parser node inputs.',
      'Configuring Reader Nodes: Drag CSV Reader, define delimiter parameters, and connect output to cleaner.',
      'Testing Node Output: Click run node, upload test invoices, and check output variable lists.'
    ],
    bestPractices: [
      'Limit file sizes to 10MB per file to prevent execution memory exhaust errors.',
      'Create clean spreadsheet schemas to ensure column names align with mapping rules.',
      'Ensure headers are placed in the first row of CSV files to allow auto-detection.'
    ],
    troubleshooting: [
      'Image text not parsed: Direct file to OCR node instead of basic text reader.',
      'CSV formatting errors: Ensure commas are not embedded in values without quotation wrapper characters.',
      'Parsing timeout: Adjust maximum execution timeout values in workflow builder node settings.'
    ],
    glossary: [
      'OCR: Optical Character Recognition - Extracting text from images.',
      'CSV: Comma-Separated Values - Standard spreadsheet file format.',
      'Delimiters: Characters (commas, tabs) separating value fields.'
    ]
  },
  {
    filename: 'Node Library Reference.pdf',
    title: 'Node Library Reference',
    subtitle: 'Detailed Configuration Reference for Reusable Nodes and Analytics node library',
    diagramType: 'workflow',
    overview: [
      'Catalogue detailing all available custom nodes, input configurations, parameters, and returns.',
      'Serves as a developer reference for extending the automation capabilities of the platform.',
      'Version 3 details the 13 new nodes registered under the Analytics library group.'
    ],
    keyFeatures: [
      'Trigger & Action Nodes: Basic execution components wiring events to automation dispatches.',
      'Analytics Node Library: Block suite handling imports, data cleaning, aggregates, and forecasts.',
      'Evaluation & Audit Nodes: Modules monitoring AI accuracy, logging changes, and healing queues.'
    ],
    stepByStep: [
      'Viewing Node Details: Open node builder page, choose node from sidebar, and inspect properties.',
      'Configuring Analytics Nodes: Drag an Aggregation node, select aggregate action type, and set target keys.',
      'Customizing parameters: Edit mapping fields inside node parameters editor drawer.'
    ],
    bestPractices: [
      'Always define descriptive titles for custom nodes.',
      'Add validation schema definitions to custom nodes to block invalid configurations.',
      'Document input structures inside node configuration logs for future reference.'
    ],
    troubleshooting: [
      'Node missing from sidebar: Confirm file is located in node definitions folder and restart server.',
      'Parameter type mismatch: Verify that preceding nodes output datatypes match expected configurations.',
      'Custom node parameters do not load: Check JSON structure of node definitions schema.'
    ],
    glossary: [
      'Node Library: Catalog of operational elements.',
      'Trigger: Starting node.',
      'Input Schema: Object structure expected by node parameters.'
    ]
  },
  {
    filename: 'API Documentation.pdf',
    title: 'API Reference Manual',
    subtitle: 'REST Endpoints, WebSocket Channels, and Analytics Router Specifications',
    diagramType: 'architecture',
    overview: [
      'Developer reference for REST endpoints and WebSocket channels on the backend.',
      'Provides developers with the specifications to connect client applications and third-party systems.',
      'Documents the new Express endpoints registered under `/api/analytics` route.'
    ],
    keyFeatures: [
      'Secure Endpoints: Routes protected by JWT authentication headers.',
      'Analytics REST APIs: Methods managing dataset uploads, preparation operations, and sharing link tokens.',
      'Metrics API: Interface for retrieving service health, error rates, and system statuses.'
    ],
    stepByStep: [
      'Registering Client: Call auth endpoints to generate developer credentials.',
      'Calling Analytics API: Authenticate client, build multipart/form-data, and POST to `/api/analytics/upload`.',
      'Running requests: Setup authentication header to include bearer tokens, and send query calls.'
    ],
    bestPractices: [
      'Use secure HTTPS connections for all API calls to prevent data interception.',
      'Implement API request throttling to protect resources from request spikes.',
      'Re-authenticate immediately if JWT token expires to maintain connection stability.'
    ],
    troubleshooting: [
      '401 Unauthorized: Refresh active JWT token using authentication refresh endpoint.',
      '429 Too Many Requests: Slow down request dispatcher loops and respect rate limits.',
      '504 Gateway Timeout: Inspect service health parameters and ensure backend processes are active.'
    ],
    glossary: [
      'REST: Representational State Transfer.',
      'WebSocket: Protocol for real-time bi-directional network communication.',
      'Multipart Upload: File transfer schema splitting blocks in HTTP bodies.'
    ]
  },
  {
    filename: 'System Architecture Guide.pdf',
    title: 'System Architecture Guide',
    subtitle: 'Component Relationships, Database schemas, and Data Analytics Flow',
    diagramType: 'architecture',
    overview: [
      'Architectural blueprint of the platform, outlining server tiers, database layouts, and network components.',
      'Helps developers understand the data relationships and system dependencies.',
      'Details relational structures mapping to Datasets, Analytics Dashboards, and logs.'
    ],
    keyFeatures: [
      'Three-Tier Architecture: React frontend client, Node.js API server, and MongoDB/PostgreSQL database layers.',
      'Data Analytics Flow: Pipeline processing inputs, executing schema detection, and caching outputs.',
      'Task Queue Framework: Redis and BullMQ processes handling asynchronous actions.'
    ],
    stepByStep: [
      'Reviewing stack components: Inspect docker compose configurations to identify server structures.',
      'Mapping database schemas: Check mongoose model folders to map dataset and dashboard layouts.',
      'Auditing Data replication: Check Supabase sync logs to verify Postgres schema matches.'
    ],
    bestPractices: [
      'Use database caching schemas to speed up repetitive query executions.',
      'Keep database server instances inside secure private subnets to limit access.',
      'Verify that dataset upload folder permissions restrict execution execution scripts.'
    ],
    troubleshooting: [
      'Slow request responses: Check database query statistics and run query execution plans.',
      'Upload file storage full: Run cleanup crons to purge historical csv temp files.',
      'Queue execution lags: Confirm worker threads count and review Redis server status.'
    ],
    glossary: [
      'Express: Node.js web frame.',
      'MongoDB: Primary database.',
      'Lineage Tracker: Sequence tracking database modifications applied to tables.'
    ]
  },
  {
    filename: 'Troubleshooting Guide.pdf',
    title: 'Troubleshooting Guide',
    subtitle: 'Diagnostics, Recovery, and Analytics System Overrides',
    diagramType: 'healing',
    overview: [
      'Incident response manual for operators and developers. Details error codes, databases lags, and circuit breaker bypasses.',
      'Helps engineers diagnose, isolate, and repair system faults.',
      'Provides diagnostics for file parsing errors, failed report shares, and execution timeouts.'
    ],
    keyFeatures: [
      'Console Diagnostic Console: Panel aggregating exception tracks and logs across services.',
      'Circuit Breaker Overrides: Tools letting operators manual-bypass safety blocks.',
      'Analytics Error Log: Table tracking failed query exceptions and file validation warnings.'
    ],
    stepByStep: [
      'Responding to error alerts: Open diagnostics tab, select log date range, and trace stack exceptions.',
      'Resetting failing routes: Check active API routes, toggle circuit breaker override, and execute queue replay.',
      'Debugging CSV upload errors: Open Analytics -> Upload preview, review header mapping, and convert datatypes.'
    ],
    bestPractices: [
      'Always fix the underlying API issues before closing open circuit breakers.',
      'Do not bypass password hash constraints on private shared links.',
      'Back up transaction logs weekly before archiving log databases.'
    ],
    troubleshooting: [
      'Unresponsive servers: Run diagnostics scripts to check CPU usage and active thread counts.',
      'File reader parsing fails: Check if file encoding is standard UTF-8 and remove empty rows.',
      'DB lock conflicts: Restart database connection pool pools via console overrides.'
    ],
    glossary: [
      'Circuit Breaker: Auto-shutoff design pattern for API errors.',
      'Overrides: Manual controls to bypass safety checks.',
      'ARIMA Error: Forecast metric divergence warning.'
    ]
  },
  {
    filename: 'Deployment Guide.pdf',
    title: 'Deployment Guide',
    subtitle: 'Docker Configurations, Environment Setup, and Directory Layouts',
    diagramType: 'architecture',
    overview: [
      'Setup manual for deploying the environment to production servers, including Docker configurations.',
      'Covers container management, environment configurations, and reverse proxy settings.',
      'Details absolute directory mapping configurations for persistent dataset file uploads.'
    ],
    keyFeatures: [
      'Multi-Container Docker configurations: Docker compose recipes for database and server setups.',
      'Nginx Reverse Proxy: SSL configuration models to map routes securely.',
      'Uploads Directory mount: Mounting storage volumes to store uploaded CSV/Excel documents safely.'
    ],
    stepByStep: [
      'Preparing deployment files: Edit environment files, configure network settings, and check configs.',
      'Mounting Storage Volumes: Map local `/uploads` directory paths inside docker-compose configuration.',
      'Launching system: Run compose commands to download dependencies and deploy containers.'
    ],
    bestPractices: [
      'Run unit tests before triggering deployment actions to check for script bugs.',
      'Configure database storage drives outside container files to preserve data across updates.',
      'Enforce file upload size constraints inside Nginx proxy files.'
    ],
    troubleshooting: [
      'Docker build failures: Clear build cache and ensure docker-desktop is running.',
      'Permissions denied in uploads: Ensure that the Docker execution user has write access to the host path.',
      'Nginx routing errors: Check configuration files syntax and restart reverse proxy service.'
    ],
    glossary: [
      'PM2: Production process runner.',
      'Docker Compose: Multi-container orchestration tool.',
      'Volume Mount: Shared storage mapping host path to container directory.'
    ]
  },
  {
    filename: 'Developer Handbook.pdf',
    title: 'Developer Handbook',
    subtitle: 'Extending the Platform, Dashboard Widget Creation, and Coding Standards',
    diagramType: 'workflow',
    overview: [
      'Reference guide for developers building new custom nodes and extending platform workflows.',
      'Contains coding rules, file layouts, and template guides to ensure clean extensions.',
      'Provides guides on coding custom statistics models and visual dashboard widgets.'
    ],
    keyFeatures: [
      'Extensible Node Factory: Registry interface for developing and adding custom nodes.',
      'Widget Catalog Extension: Instructions to code and register new dashboard chart components.',
      'Coding Style Standards: Rules for variable names, folder structures, and styles.'
    ],
    stepByStep: [
      'Implementing Custom Node: Write node definitions, create UI parameters file, and index in factory files.',
      'Adding Custom Dashboard Charts: Edit `Analytics.jsx` widgets switch, add layout templates, and map data parameters.',
      'Creating Pull Request: Submit code changes, run automated lint tests, and request review.'
    ],
    bestPractices: [
      'Strictly follow existing code structure and variable naming conventions.',
      'Write detailed unit tests for all custom logical workflows.',
      'Always use theme configuration palette tokens for custom colors.'
    ],
    troubleshooting: [
      'Linter test failures: Run linter tool locally to locate and resolve syntax violations.',
      'Widget rendering blank: Check if the dataset fields map correctly to chart labels.',
      'Import mapping errors: Verify relative path configurations in target files.'
    ],
    glossary: [
      'Linter: Tool that checks code for syntax rules.',
      'Pull Request: Submission of code updates for audit.',
      'Widget Config: Object schema containing dashboard visual fields.'
    ]
  }
];

// Launch generation pipeline
console.log("Beginning documentation generation library compiler...");
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

documents.forEach((docInfo) => {
  try {
    compileDocument(docInfo);
  } catch (err) {
    console.error(`Error generating ${docInfo.filename}:`, err);
  }
});
console.log("Master documentation suite generated successfully.");
