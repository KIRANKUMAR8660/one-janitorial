import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import Deal from '../models/Deal.js';
import Lead from '../models/Lead.js';
import Ticket from '../models/Ticket.js';
import BcoProject from '../models/BcoProject.js';
import JobPosting from '../models/JobPosting.js';
import PerformanceRecord from '../models/PerformanceRecord.js';
import AIAgent from '../models/AIAgent.js';
import SOPDocument from '../models/SOPDocument.js';
import { chunkAndIndexDocument } from '../services/ragService.js';
import logger from './logger.js';
import AgentEvaluation from '../models/AgentEvaluation.js';
import SyncHistory from '../models/SyncHistory.js';
import CoachingReport from '../models/CoachingReport.js';
import ProcessMining from '../models/ProcessMining.js';
import PromptRegistry from '../models/PromptRegistry.js';
import AICost from '../models/AICost.js';
import N8NMigration from '../models/N8NMigration.js';
import ChatbotFeedback from '../models/ChatbotFeedback.js';
import AuditRecord from '../models/AuditRecord.js';
import FailureRecovery from '../models/FailureRecovery.js';


export const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@onejanitorial.com' });
    const sopCount = await SOPDocument.countDocuments();
    const syncCount = await SyncHistory.countDocuments();
    if (adminExists && sopCount > 0 && syncCount > 0) {
      logger.info('Database already seeded with mock data. Skipping seeder.');
      return;
    }

    logger.info('Clearing old database state and seeding fresh data...');
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      logger.info('Database dropped successfully.');
    }


    // 1. Seed Users & Employees
    const seedUsers = [
      { email: 'superadmin@onejanitorial.com', role: 'Super Admin', firstName: 'Sarah', lastName: 'Jenkins', dept: 'Administration' },
      { email: 'admin@onejanitorial.com', role: 'Admin', firstName: 'Kiran', lastName: 'Kumar', dept: 'Administration' },
      { email: 'manager@onejanitorial.com', role: 'Manager', firstName: 'Marcus', lastName: 'Vance', dept: 'Administration' },
      { email: 'sales@onejanitorial.com', role: 'Sales', firstName: 'Jessica', lastName: 'Rios', dept: 'Sales' },
      { email: 'bco@onejanitorial.com', role: 'BCO', firstName: 'Derek', lastName: 'Snyder', dept: 'BCO Operations' },
      { email: 'clientservice@onejanitorial.com', role: 'Client Service', firstName: 'Elena', lastName: 'Rostova', dept: 'Client Service' },
      { email: 'hr@onejanitorial.com', role: 'HR', firstName: 'Rachel', lastName: 'Green', dept: 'HR' },
      { email: 'employee@onejanitorial.com', role: 'Employee', firstName: 'John', lastName: 'Doe', dept: 'Operations' }
    ];

    const usersMap = {};
    const employeesMap = {};

    for (const u of seedUsers) {
      const user = new User({
        email: u.email,
        password: 'Password123',
        role: u.role
      });
      await user.save();
      usersMap[u.role] = user;

      const employee = new Employee({
        user: user._id,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: '555-019' + Math.floor(Math.random() * 9),
        department: u.dept,
        status: 'Active',
        performanceScorecard: {
          rating: 4 + Math.random(),
          notes: 'Consistent performance matching One Janitorial standards.'
        }
      });
      await employee.save();
      employeesMap[u.role] = employee;
    }

    // Set manager associations
    const adminEmp = employeesMap['Admin'];
    const superAdminEmp = employeesMap['Super Admin'];
    const managerEmp = employeesMap['Manager'];

    for (const role of ['Sales', 'BCO', 'Client Service', 'HR']) {
      const emp = employeesMap[role];
      emp.manager = managerEmp._id;
      await emp.save();
    }
    employeesMap['Employee'].manager = adminEmp._id;
    await employeesMap['Employee'].save();

    // 2. Seed Channels & Messages
    const chan1 = new Channel({ name: '#general', description: 'Company-wide general communications', type: 'Channel' });
    const chan2 = new Channel({ name: '#cleaning-ops', description: 'Field cleaning operations coordination', type: 'Channel' });
    const chan3 = new Channel({ name: '#sales-pipeline', description: 'HubSpot sales pipeline tracking', type: 'Channel' });
    await chan1.save();
    await chan2.save();
    await chan3.save();

    const msg1 = new Message({
      channel: chan1._id,
      sender: usersMap['Admin']._id,
      content: 'Welcome to the One Janitorial Executive Operations Platform! All integrations with HubSpot, RingCentral, and Google Workspace are operational.'
    });
    const msg2 = new Message({
      channel: chan1._id,
      sender: usersMap['Manager']._id,
      content: 'Thanks Kiran! Please ensure all client onboarding tickets are tracked under the new SLA timeline.'
    });
    const msg3 = new Message({
      channel: chan2._id,
      sender: usersMap['Employee']._id,
      content: 'Morning team. Cleaning crew completed the downtown commercial plaza site run at 5:00 AM today. No inspection failures.'
    });
    await msg1.save();
    await msg2.save();
    await msg3.save();

    // 3. Seed Tasks
    const tasks = [
      {
        title: 'Review Quarterly Commercial Cleaning Contracts',
        description: 'Verify service specifications and chemical safety policies for the metropolitan area contract.',
        assignedTo: usersMap['Manager']._id,
        createdBy: usersMap['Admin']._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Perform Inspection: Downtown Plaza Site',
        description: 'Evaluate cleanliness standards of level 1 to 5 corridors and common facilities.',
        assignedTo: usersMap['Employee']._id,
        createdBy: usersMap['Manager']._id,
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Follow Up: HubSpot Qualified CRM Leads',
        description: 'Call leads flagged in hygiene review and qualify for proposal stage.',
        assignedTo: usersMap['Sales']._id,
        createdBy: usersMap['Admin']._id,
        priority: 'High',
        status: 'Todo',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Submit Monthly Financial Split Reports',
        description: 'Prepare contract sharing payouts for partner alliances under operations database.',
        assignedTo: usersMap['BCO']._id,
        createdBy: usersMap['Super Admin']._id,
        priority: 'Medium',
        status: 'Review',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const t of tasks) {
      const task = new Task(t);
      await task.save();
    }

    // 4. Seed CRM (Leads & Deals)
    const mockLeads = [
      { firstName: 'Alice', lastName: 'Henderson', email: 'alice.henderson@corporatehalls.com', phone: '202-555-0143', status: 'New', hygieneStatus: 'Good' },
      { firstName: 'Robert', lastName: 'Chen', email: 'robert.chen@techhuboffices.com', phone: '415-555-0182', status: 'Contacted', hygieneStatus: 'Good', assignedTo: usersMap['Sales']._id },
      { firstName: 'David', lastName: 'Miller', email: 'david.miller@valleywarehouses.com', phone: '650-555-0199', status: 'Inactive', hygieneStatus: 'Flagged for Reassignment', assignedTo: usersMap['Sales']._id, updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    ];

    for (const l of mockLeads) {
      const lead = new Lead(l);
      await lead.save();
    }

    const mockDeals = [
      { title: 'Metro Commercial Plaza - Full Janitorial Service', amount: 15400, stage: 'Proposal Sent', owner: usersMap['Sales']._id, clientEmail: 'billing@metroplaza.com' },
      { title: 'Westside Logistics Park - Floor Refinishing', amount: 8200, stage: 'Appointment Scheduled', owner: usersMap['Sales']._id, clientEmail: 'ops@westsidelogistics.com' },
      { title: 'Downtown Medical Complex - Sanitization Run', amount: 24500, stage: 'Closed Won', owner: usersMap['Sales']._id, clientEmail: 'compliance@downtownmedical.com', closedDate: new Date(), followUpStatus: 'Completed', followUpSentDate: new Date() }
    ];

    for (const d of mockDeals) {
      const deal = new Deal(d);
      await deal.save();
    }

    // 5. Seed Tickets
    const mockTickets = [
      {
        title: 'Missed Floor Buffing - Suite 402',
        description: 'Client reports suite 402 floor buffing was skipped during Wednesday run.',
        clientEmail: 'tenant402@metroplaza.com',
        assignedTo: usersMap['Client Service']._id,
        status: 'Open',
        priority: 'High',
        ticketType: 'Service Complaint',
        slaDueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        communicationLogs: [
          { sender: 'tenant402@metroplaza.com', recipient: 'clientservice@onejanitorial.com', message: 'Hello, our suite 402 floor was not buffed last night. Can you look into this?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      },
      {
        title: 'Billing Query: Invoice #OJ-2026-06',
        description: 'Discrepancy in chemical supply surcharge on last invoice.',
        clientEmail: 'accounts@westsidelogistics.com',
        assignedTo: usersMap['Client Service']._id,
        status: 'In Progress',
        priority: 'Medium',
        ticketType: 'Billing',
        slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        communicationLogs: [
          { sender: 'accounts@westsidelogistics.com', recipient: 'clientservice@onejanitorial.com', message: 'Hi, there is a $120 extra charge for chemical supply. Can we verify this?', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
          { sender: 'clientservice@onejanitorial.com', recipient: 'accounts@westsidelogistics.com', message: 'Checking with BCO Operations. Will get back shortly.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }
        ]
      }
    ];

    for (const t of mockTickets) {
      const ticket = new Ticket(t);
      await ticket.save();
    }

    // 6. Seed BCO Projects
    const bcoProj = new BcoProject({
      allianceName: 'Regional Clean LLC Partner Alliance',
      buildingName: 'North Star Office Tower',
      buildingAddress: '888 Polaris Parkway, Suite 100',
      contractValue: 48000,
      contractStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      contractEndDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      contractStatus: 'Active',
      profitSplits: [
        { partnerName: 'Regional Clean LLC', partnerPercentage: 60, staffPercentage: 40, calculatedAmount: 28800 }
      ],
      inspections: [
        { inspector: usersMap['Employee']._id, status: 'Passed', notes: 'All common areas compliant with sanitation regulations.' }
      ],
      welcomeEmailSent: true,
      contractFilingPath: '/uploads/contracts/mock_signed_contract.pdf'
    });
    await bcoProj.save();

    // 7. Seed Job Postings
    const jobPost = new JobPosting({
      title: 'Commercial Cleaner & Janitorial Technician',
      description: 'Looking for experienced cleaners for premium office spaces. Must understand PPE guidelines and dilution protocols.',
      department: 'Operations',
      status: 'Open',
      applicants: [
        {
          fullName: 'Marcus Aurelius',
          email: 'marcus@stoiccleaning.com',
          phone: '312-555-0100',
          resumePath: '/uploads/resumes/mock_resume.pdf',
          status: 'AI Screened',
          rankingScore: 88,
          aiScreeningQuestions: [
            { question: 'What is your experience in janitorial workflows?', answer: 'I have managed corporate cleaning plans for over 5 years, focusing on safety.', score: 9, analysis: 'Highly qualified candidate with strong safety awareness.' }
          ]
        }
      ]
    });
    await jobPost.save();

    // 8. Seed Performance Scores
    const perfRec = new PerformanceRecord({
      employee: employeesMap['Employee']._id,
      coach: usersMap['Manager']._id,
      coachingLogs: [
        { topic: 'PPE & Chemical Dilution Standards', discussionNotes: 'Discussed proper OSHA chemical handling protocols and high-to-low space dusting routines.', actionItems: 'Conduct dilution verification checks next week.' }
      ],
      expectations: [
        { metricName: 'Inspections Pass Rate', targetValue: '95%', actualValue: '100%', status: 'Met' }
      ],
      kpis: { talkTimeSeconds: 0, callsMade: 0, leadsClosed: 0, ticketsResolved: 15 }
    });
    await perfRec.save();

    // 9. Seed AI Agents
    const seedAgents = [
      { name: 'Staff Support Assistant', provider: 'OpenAI', modelName: 'gpt-4o-mini', systemPrompt: 'You are an internal staff assistant for One Janitorial. Provide professional answers about cleaning operations, HR, and ticketing.' },
      { name: 'RAG Knowledge Assistant', provider: 'Claude', modelName: 'claude-3-haiku', systemPrompt: 'Help staff find operational SOP instructions quickly by searching the indexed vector knowledge base.' },
      { name: 'CRM Hygiene Bot', provider: 'OpenAI', modelName: 'gpt-4', systemPrompt: 'Monitor pipeline stages, flag inactive leads, and perform round-robin CRM distribution audits.' }
    ];

    for (const a of seedAgents) {
      const agent = new AIAgent(a);
      await agent.save();
    }

    // 10. Seed SOP Documents & Run RAG Chunk Indexing
    const sop1 = new SOPDocument({
      title: 'OSHA Chemical Safety & PPE Guidelines',
      category: 'General',
      content: 'Always wear appropriate Personal Protective Equipment (PPE) including heavy-duty gloves and safety goggles when handling cleaning chemicals. Dilution should strictly follow the printed ratio instructions on the bottle. Never mix bleach with ammonia-based solutions to prevent toxic vapor releases. Store all hazardous compounds in ventilated, locked operational cabinets.',
      uploadedBy: usersMap['Admin']._id,
      filePath: '/uploads/sops/osha_safety_guidelines.txt',
      fileType: 'txt'
    });
    await sop1.save();
    await chunkAndIndexDocument(sop1._id);

    const sop2 = new SOPDocument({
      title: 'Building Cleaning Sequence & Standards',
      category: 'General',
      content: 'Standard cleaning sequence must proceed from top to bottom (high dusting, mid-level surface cleaning, and finally floor vacuuming/mopping). This prevents dust particles from settling on previously cleaned surfaces. Pay special attention to high-touch points like elevator buttons, door handles, and kitchen counters. Log sanitization runs on the sheet.',
      uploadedBy: usersMap['Admin']._id,
      filePath: '/uploads/sops/cleaning_standards.txt',
      fileType: 'txt'
    });
    await sop2.save();
    await chunkAndIndexDocument(sop2._id);

    // 11. Seed Agent Evaluations
    const qa1 = new AgentEvaluation({
      agentName: 'Staff Support Assistant',
      successRate: 95,
      failureRate: 5,
      averageConfidence: 0.94,
      averageRuntime: 850,
      decisionLogs: [
        { input: 'What is the bleach dilution ratio?', output: 'Follow standard OSHA guidelines dilution details: 1:10 ratio in ventilated workspace.', confidence: 96, overrideStatus: 'Auto-Approved' }
      ]
    });
    const qa2 = new AgentEvaluation({
      agentName: 'CRM Hygiene Bot',
      successRate: 98,
      failureRate: 2,
      averageConfidence: 0.97,
      averageRuntime: 1200,
      decisionLogs: [
        { input: 'Check inactive leads list', output: 'Found 3 leads inactive for 7 days. Flagged hygiene status and assigned to Jessica Rios.', confidence: 98, overrideStatus: 'Auto-Approved' }
      ]
    });
    await qa1.save();
    await qa2.save();

    // 12. Seed Sync History
    const sync = new SyncHistory({
      syncHealthScore: 98,
      contactsCount: 1250,
      companiesCount: 450,
      dealsCount: 380,
      ticketsCount: 92,
      activitiesCount: 3400,
      notesCount: 2200,
      tasksCount: 1100,
      failedSyncsCount: 0
    });
    await sync.save();

    // 13. Seed Process Mining
    const pm1 = new ProcessMining({
      activityName: 'Manual HubSpot deal updates on stage matches',
      count: 245,
      duplicateActionsCount: 42,
      avgDurationMs: 45000,
      bottleneckLevel: 'High',
      recommendation: 'Users manually update 73 HubSpot deals daily. Automate using CRM deal update agent.'
    });
    const pm2 = new ProcessMining({
      activityName: 'Inspections scheduling and welcome emails',
      count: 120,
      duplicateActionsCount: 15,
      avgDurationMs: 30000,
      bottleneckLevel: 'Medium',
      recommendation: 'Welcome email dispatcher is triggered manually. Automate using BCO welcome trigger node.'
    });
    await pm1.save();
    await pm2.save();

    // 14. Seed Prompt Registry
    const pr1 = new PromptRegistry({
      name: 'Bleach Dilution Helper',
      version: 1,
      content: 'Always specify bleach dilution guidelines. Ratios: 1:10.',
      provider: 'GPT',
      isApproved: true
    });
    const pr2 = new PromptRegistry({
      name: 'RAG search summary prompt',
      version: 1,
      content: 'Summarize indexed search context on cleaning protocols.',
      provider: 'Claude',
      isApproved: false
    });
    await pr1.save();
    await pr2.save();

    // 15. Seed AI Costs
    const cost1 = new AICost({ provider: 'OpenAI GPT-4o', cost: 12.45, tokensCount: 620000, category: 'Inference' });
    const cost2 = new AICost({ provider: 'Anthropic Claude 3.5', cost: 18.20, tokensCount: 450000, category: 'Inference' });
    const cost3 = new AICost({ provider: 'Gemini 1.5 Pro', cost: 4.80, tokensCount: 960000, category: 'Inference' });
    const cost4 = new AICost({ provider: 'Embedding Engine', cost: 1.15, tokensCount: 230000, category: 'Embedding' });
    const cost5 = new AICost({ provider: 'Pinecone VectorDB', cost: 8.50, tokensCount: 0, category: 'Vector' });
    await cost1.save();
    await cost2.save();
    await cost3.save();
    await cost4.save();
    await cost5.save();

    // 16. Seed Chatbot Feedback
    const fb1 = new ChatbotFeedback({
      question: 'How to clean elevator buttons?',
      answer: 'Standard sequence: sanitize with high touch points checklist guidelines.',
      rating: 'Thumbs Up'
    });
    const fb2 = new ChatbotFeedback({
      question: 'What is BCO split for North Star?',
      answer: 'Unknown split configuration details.',
      rating: 'Thumbs Down',
      isIncorrect: true,
      missingSopReported: true,
      sopTopic: 'North Star project splits'
    });
    await fb1.save();
    await fb2.save();

    // 17. Seed Audits
    const au1 = new AuditRecord({
      action: 'SYSTEM_STARTUP',
      actorEmail: 'admin@onejanitorial.com',
      reason: 'Operations Console initialized'
    });
    await au1.save();

    // 18. Seed Failure Recovery
    const rec1 = new FailureRecovery({
      errorOrigin: 'HubSpot CRM Action',
      errorMessage: 'ECONNRESET: connection reset by peer api.hubspot.com',
      recoveryAction: 'Retry',
      recoveryStatus: 'Recovered',
      retriesCount: 2,
      circuitBreakerStatus: 'Closed'
    });
    const rec2 = new FailureRecovery({
      errorOrigin: 'Google Calendar Sync',
      errorMessage: '401 Unauthorized API credentials invalid',
      recoveryAction: 'Escalation',
      recoveryStatus: 'Escalated',
      retriesCount: 3,
      circuitBreakerStatus: 'Open'
    });
    await rec1.save();
    await rec2.save();

    logger.info('Database Seeding Completed Successfully.');
  } catch (error) {
    logger.error(`Database seeding error: ${error.message}`);
  }
};
