import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Meeting from '../models/Meeting.js';
import Deal from '../models/Deal.js';
import Lead from '../models/Lead.js';
import Ticket from '../models/Ticket.js';
import PerformanceRecord from '../models/PerformanceRecord.js';
import TrainingRecord from '../models/TrainingRecord.js';
import SOPDocument from '../models/SOPDocument.js';
import AIAgent from '../models/AIAgent.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import BcoProject from '../models/BcoProject.js';
import JobPosting from '../models/JobPosting.js';
import CustomRole from '../models/CustomRole.js';
import VoiceTranscript from '../models/VoiceTranscript.js';

// Integration services & recovery libs
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail, sendLockoutNotificationEmail } from '../services/emailService.js';
import { triggerClosedWonFollowUp, runLeadHygieneCheck, triggerAppointmentAutomation } from '../services/hubspotService.js';
import { sendGmailEmail, createGoogleCalendarEvent, uploadToGoogleDrive } from '../services/googleService.js';
import { getDailyPerformanceReport, fetchRingCentralCallLogs } from '../services/ringcentralService.js';
import { runAgentExecution } from '../services/aiService.js';
import { chunkAndIndexDocument, searchVectorKnowledge } from '../services/ragService.js';

// Password Strength Validator
const validatePasswordStrength = (password) => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password && password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

// Helper to sign JWTs
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_jwt_access_key_12345!', {
    expiresIn: '1d'
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'supersecret_jwt_refresh_key_12345!', {
    expiresIn: '7d'
  });
};

/* =========================================================
   1. AUTHENTICATION MODULE
   ========================================================= */
export const registerUser = async (req, res) => {
  const { email, password, role, firstName, lastName, department } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password, role });
    await user.save();

    // Create basic profile
    const employee = new Employee({
      user: user._id,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || 'Staff',
      department: department || (role === 'Sales' ? 'Sales' : role === 'HR' ? 'HR' : role === 'BCO' ? 'BCO Operations' : 'Administration')
    });
    await employee.save();

    const log = new AuditLog({ user: user._id, action: 'USER_REGISTERED', module: 'Authentication', details: `User registered with role ${role}` });
    await log.save();

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, deviceInfo } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is disabled
    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'This staff account has been disabled. Please contact your administrator.' });
    }

    // Check account lockout status
    if (user.isLocked) {
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMins = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        return res.status(403).json({ 
          message: `Account is locked due to multiple failed login attempts. Please try again in ${remainingMins} minutes.` 
        });
      } else {
        // Lock expired, reset attempts
        user.isLocked = false;
        user.lockUntil = null;
        user.loginAttempts = 0;
        await user.save();
      }
    }

    // Password validation check
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await user.save();
        
        // Log security event
        const log = new AuditLog({ 
          user: user._id, 
          action: 'ACCOUNT_LOCKOUT', 
          module: 'Authentication', 
          details: 'Account locked for 15 minutes due to 5 consecutive failed login attempts',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        await log.save();

        // Send email notification
        await sendLockoutNotificationEmail({
          to: user.email,
          userName: user.email.split('@')[0]
        });

        return res.status(403).json({ 
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts. An alert email has been sent.' 
        });
      } else {
        await user.save();

        const log = new AuditLog({ 
          user: user._id, 
          action: 'LOGIN_FAILED', 
          module: 'Authentication', 
          details: `Failed login attempt ${user.loginAttempts}/5`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        await log.save();

        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Login successful - reset attempts
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;

    // Token creation
    const accessToken = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Save session & refresh tokens (Session Management & Device Tracking)
    const ipAddress = req.ip || req.connection.remoteAddress;
    user.sessions.push({ token: accessToken, deviceInfo: deviceInfo || 'Web Browser', ipAddress });
    user.refreshTokens.push(refreshToken);
    await user.save();

    const log = new AuditLog({ 
      user: user._id, 
      action: 'LOGIN_SUCCESS', 
      module: 'Authentication', 
      details: `User logged in from ${deviceInfo || 'Unknown Device'}`,
      ipAddress,
      userAgent: req.headers['user-agent']
    });
    await log.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      role: user.role,
      email: user.email,
      mfaRequired: user.mfaEnabled,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;

    // Filter out current active token
    user.sessions = user.sessions.filter(s => s.token !== token);
    await user.save();

    const log = new AuditLog({ user: user._id, action: 'LOGOUT_SUCCESS', module: 'Authentication', details: 'User logged out' });
    await log.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enableMFA = async (req, res) => {
  try {
    const user = req.user;
    user.mfaEnabled = true;
    user.mfaSecret = 'ONE_JANITORIAL_SECRET_KEY_' + Math.random().toString(36).substring(3).toUpperCase();
    await user.save();
    res.status(200).json({ message: 'MFA enabled successfully', secret: user.mfaSecret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   2. EMPLOYEE MANAGEMENT MODULE
   ========================================================= */
export const getEmployees = async (req, res) => {
  try {
    const list = await Employee.find().populate('user', 'email role').populate('manager', 'firstName lastName');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   3. TASK MANAGEMENT MODULE
   ========================================================= */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Track status change for alerts/notifications
    const oldStatus = task.status;
    Object.assign(task, req.body);
    task.history.push({
      changedBy: req.user._id,
      field: 'status',
      oldValue: oldStatus,
      newValue: task.status
    });
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   4. INTERNAL CHAT MODULE
   ========================================================= */
export const getChannels = async (req, res) => {
  try {
    const list = await Channel.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChannel = async (req, res) => {
  try {
    const newChan = new Channel(req.body);
    await newChan.save();
    res.status(201).json(newChan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const msgs = await Message.find({ channel: channelId })
      .populate('sender', 'email')
      .sort({ createdAt: 1 });
    res.status(200).json(msgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   5. MEETING MODULE
   ========================================================= */
export const getMeetings = async (req, res) => {
  try {
    const list = await Meeting.find().populate('host', 'email').populate('participants', 'email');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleMeeting = async (req, res) => {
  try {
    // Generate meeting and Calendar invite link
    const calEvent = await createGoogleCalendarEvent({
      title: req.body.title,
      description: req.body.description,
      startTime: req.body.scheduledTime,
      durationMinutes: req.body.durationMinutes
    });

    const meeting = new Meeting({
      ...req.body,
      host: req.user._id,
      googleMeetLink: calEvent.meetLink
    });

    // Generate mock AI summary as default placeholder
    meeting.aiSummary = `Scheduled team synchronization meeting. Host: ${req.user.email}. Google Meet link generated.`;
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   6. CRM MODULE
   ========================================================= */
export const getDeals = async (req, res) => {
  try {
    const list = await Deal.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    if (deal.stage === 'Closed Won') {
      await triggerClosedWonFollowUp(deal._id);
    }
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDealStage = async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  try {
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    deal.stage = stage;
    await deal.save();

    if (stage === 'Closed Won') {
      await triggerClosedWonFollowUp(deal._id);
    }
    res.status(200).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const list = await Lead.find().populate('assignedTo', 'email');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    await triggerAppointmentAutomation(lead._id, req.user._id);
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const runCRMHygiene = async (req, res) => {
  try {
    await runLeadHygieneCheck();
    res.status(200).json({ message: 'Lead hygiene routine completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   7. TICKETING MODULE
   ========================================================= */
export const getTickets = async (req, res) => {
  try {
    const list = await Ticket.find().populate('assignedTo', 'email');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const slaHours = req.body.priority === 'Urgent' ? 4 : req.body.priority === 'High' ? 12 : 24;
    const ticket = new Ticket({
      ...req.body,
      slaDueDate: new Date(Date.now() + slaHours * 60 * 60 * 1000)
    });
    // Send acknowledgement email
    await sendGmailEmail({
      to: ticket.clientEmail,
      subject: `Support Ticket Received: ${ticket.title}`,
      body: `Hello, we have received your ticket regarding: ${ticket.title}. Our team is review it with SLA due: ${ticket.slaDueDate}`
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logTicketCommunication = async (req, res) => {
  const { id } = req.params;
  const { message, recipient } = req.body;
  try {
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.communicationLogs.push({
      sender: req.user.email,
      recipient,
      message,
      timestamp: new Date()
    });
    await ticket.save();

    // Trigger Gmail send
    await sendGmailEmail({ to: recipient, subject: `RE: Ticket ${ticket.title}`, body: message });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   8. BCO OPERATIONS MODULE
   ========================================================= */
export const getBcoProjects = async (req, res) => {
  try {
    const projects = await BcoProject.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBcoProject = async (req, res) => {
  try {
    const project = new BcoProject(req.body);
    // Welcome email automation
    await sendGmailEmail({
      to: 'alliance@example.com',
      subject: `Welcome to One Janitorial Operations: ${project.allianceName}`,
      body: `We are excited to lock contract starting ${project.contractStartDate || 'now'}.`
    });
    project.welcomeEmailSent = true;
    project.contractFilingPath = '/uploads/contracts/mock_signed_contract.pdf';
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   9. HR MANAGEMENT MODULE
   ========================================================= */
export const getJobPostings = async (req, res) => {
  try {
    const list = await JobPosting.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJobPosting = async (req, res) => {
  try {
    const posting = new JobPosting(req.body);
    await posting.save();
    res.status(201).json(posting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addApplicant = async (req, res) => {
  const { jobId } = req.params;
  const { fullName, email, phone, resumeText } = req.body;
  try {
    const job = await JobPosting.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job posting not found' });

    // AI screening logic
    const rankingScore = Math.floor(Math.random() * 60) + 40; // mock evaluation score 40-100
    const aiAnalysis = `AI Screening completed for ${fullName}. Recommended fit profile index: Medium-High. Resume matched keywords.`;

    job.applicants.push({
      fullName,
      email,
      phone,
      resumePath: '/uploads/resumes/mock_resume.pdf',
      status: 'AI Screened',
      rankingScore,
      aiScreeningQuestions: [{
        question: 'What is your experience in janitorial workflows?',
        answer: resumeText || 'I have 3 years experience matching standards.',
        score: Math.floor(rankingScore / 10),
        analysis: aiAnalysis
      }]
    });

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   10. PERFORMANCE MANAGEMENT MODULE
   ========================================================= */
export const getPerformanceRecords = async (req, res) => {
  try {
    const list = await PerformanceRecord.find().populate('employee');
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logCoachingSession = async (req, res) => {
  const { employeeId } = req.params;
  const { topic, discussionNotes, actionItems, expectations } = req.body;
  try {
    let record = await PerformanceRecord.findOne({ employee: employeeId });
    if (!record) {
      const emp = await Employee.findById(employeeId);
      record = new PerformanceRecord({
        employee: employeeId,
        coach: req.user._id,
        expectations: expectations || []
      });
    }

    record.coachingLogs.push({
      topic,
      discussionNotes,
      actionItems,
      timestamp: new Date()
    });

    if (expectations) {
      record.expectations = expectations;
    }

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   11. AI AGENT CONTROL CENTER
   ========================================================= */
export const getAIAgents = async (req, res) => {
  try {
    const list = await AIAgent.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerAgentQuery = async (req, res) => {
  const { agentName, prompt, context } = req.body;
  try {
    const response = await runAgentExecution(agentName, prompt, context);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   12. RAG KNOWLEDGE SYSTEM
   ========================================================= */
export const getSopDocuments = async (req, res) => {
  try {
    const list = await SOPDocument.find({}, '-chunks'); // retrieve overview
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadSopDocument = async (req, res) => {
  const { title, category, content } = req.body;
  try {
    const doc = new SOPDocument({
      title,
      category,
      content,
      uploadedBy: req.user._id,
      filePath: '/uploads/sops/sop_sample.txt',
      fileType: 'txt'
    });
    await doc.save();
    await chunkAndIndexDocument(doc._id);
    res.status(201).json({ message: 'Document uploaded and indexed successfully', docId: doc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const queryKnowledgeBase = async (req, res) => {
  const { query, category } = req.body;
  try {
    const results = await searchVectorKnowledge(query, category);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   13. DASHBOARD METRICS
   ========================================================= */
export const getDashboardMetrics = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeTasks = await Task.countDocuments({ status: { $ne: 'Done' } });
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const totalDeals = await Deal.countDocuments();

    // CRM details
    const salesReport = await getDailyPerformanceReport(req.user._id);

    res.status(200).json({
      employeesCount: totalEmployees,
      activeTasksCount: activeTasks,
      openTicketsCount: openTickets,
      totalDealsCount: totalDeals,
      talkTimeSeconds: salesReport.totalTalkTimeSeconds,
      callsMade: salesReport.totalCalls,
      missedCalls: salesReport.missedCalls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   14. SYSTEM ADMINISTRATION (AUDIT LOGS)
   ========================================================= */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'email').sort({ createdAt: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   15. PASSWORD RESET & SECURITY MODULE
   ========================================================= */

// Public endpoint to request a password recovery email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No staff account found with this email.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'This staff account has been disabled. Recovery is blocked.' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Save hashed token & expiry
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Reset link pointing to frontend port 3000 in dev or default domain
    const host = req.get('host');
    const baseUrl = host.includes('localhost:5000') ? 'http://localhost:3000' : `${req.protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password/${token}`;

    // Send email
    await sendResetPasswordEmail({
      to: user.email,
      userName: user.email.split('@')[0],
      resetLink
    });

    // Create Audit Log
    const audit = new AuditLog({
      user: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      module: 'Authentication',
      details: 'Password reset recovery email requested and dispatched.',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: 'Password recovery email sent. Link expires in 30 minutes.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public endpoint to reset password using token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Validate password rules
    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({ 
        message: 'Password does not meet requirements (Minimum 12 characters, must include uppercase, lowercase, number, and special character).' 
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      const audit = new AuditLog({
        action: 'FAILED_RESET_ATTEMPT',
        module: 'Authentication',
        details: 'Attempted password reset with invalid or expired token',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      await audit.save();

      return res.status(400).json({ message: 'Invalid or expired recovery token.' });
    }

    // Validate password history (prevent reuse of last 3 passwords)
    let isReused = false;
    for (const oldHash of user.passwordHistory) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        isReused = true;
        break;
      }
    }
    // Also check current password
    if (await user.comparePassword(newPassword)) {
      isReused = true;
    }

    if (isReused) {
      return res.status(400).json({ message: 'You cannot reuse any of your last 3 passwords.' });
    }

    // Shift password history
    if (user.password) {
      user.passwordHistory.push(user.password);
      if (user.passwordHistory.length > 3) {
        user.passwordHistory.shift();
      }
    }

    // Set new password
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.lastPasswordReset = Date.now();
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    
    // Invalidate active sessions to force logout from all devices
    user.sessions = [];
    user.refreshTokens = [];
    await user.save();

    const audit = new AuditLog({
      user: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      module: 'Authentication',
      details: 'Password successfully recovered and reset. Active sessions invalidated.',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: 'Password updated successfully. Please sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Private endpoint for changing password while logged in
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = req.user;
    
    // Validate current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Validate new password rules
    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({ 
        message: 'New password does not meet requirements (Minimum 12 characters, must include uppercase, lowercase, number, and special character).' 
      });
    }

    // Validate password history (prevent reuse of last 3 passwords)
    let isReused = false;
    for (const oldHash of user.passwordHistory) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        isReused = true;
        break;
      }
    }
    if (await user.comparePassword(newPassword)) {
      isReused = true;
    }

    if (isReused) {
      return res.status(400).json({ message: 'You cannot reuse any of your last 3 passwords.' });
    }

    // Shift password history
    if (user.password) {
      user.passwordHistory.push(user.password);
      if (user.passwordHistory.length > 3) {
        user.passwordHistory.shift();
      }
    }

    // Set new password
    user.password = newPassword;
    user.lastPasswordReset = Date.now();

    // Invalidate OTHER sessions (keep current session active, clear others)
    const activeToken = req.token;
    user.sessions = user.sessions.filter(s => s.token === activeToken);
    user.refreshTokens = []; // Clear refresh tokens to force re-auth elsewhere
    await user.save();

    const audit = new AuditLog({
      user: user._id,
      action: 'PASSWORD_RESET_COMPLETED', // Maps to tracked password change
      module: 'Authentication',
      details: 'Password changed successfully via user profile settings. Other sessions terminated.',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint: List all users
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -mfaSecret');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint: Force Password Reset for a user
export const adminForcePasswordReset = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Save token and expiry
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
    await user.save();

    const host = req.get('host');
    const baseUrl = host.includes('localhost:5000') ? 'http://localhost:3000' : `${req.protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password/${token}`;

    // Send email
    await sendResetPasswordEmail({
      to: user.email,
      userName: user.email.split('@')[0],
      resetLink
    });

    const audit = new AuditLog({
      user: req.user._id, // admin who performed the reset
      action: 'ADMIN_RESET_ACTIONS',
      module: 'Administration',
      details: `Forced password reset for user: ${user.email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: `Password reset email forced and sent to ${user.email}.`, resetLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint: Unlock account
export const adminUnlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isLocked = false;
    user.lockUntil = null;
    user.loginAttempts = 0;
    await user.save();

    const audit = new AuditLog({
      user: req.user._id,
      action: 'ADMIN_RESET_ACTIONS',
      module: 'Administration',
      details: `Unlocked account for user: ${user.email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: `Account unlocked successfully for ${user.email}.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint: Enable or Disable user status
export const adminToggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!['Enabled', 'Disabled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    if (status === 'Disabled') {
      // Invalidate sessions immediately
      user.sessions = [];
      user.refreshTokens = [];
    }
    await user.save();

    const audit = new AuditLog({
      user: req.user._id,
      action: status === 'Enabled' ? 'ADMIN_RESET_ACTIONS' : 'ADMIN_RESET_ACTIONS',
      module: 'Administration',
      details: `User status set to ${status} for email: ${user.email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await audit.save();

    res.status(200).json({ message: `User status set to ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoint: View Login History, Failed Attempts
export const adminGetUserLogs = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Retrieve all audit logs related to this user
    const logs = await AuditLog.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked,
      lockUntil: user.lockUntil,
      status: user.status,
      lastPasswordReset: user.lastPasswordReset,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   17. MEETING MANAGEMENT MODULE (ADDITIONAL CRUD)
   ========================================================= */
export const updateMeeting = async (req, res) => {
  const { id } = req.params;
  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });

    Object.assign(meeting, req.body);
    await meeting.save();
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMeeting = async (req, res) => {
  const { id } = req.params;
  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });

    await meeting.deleteOne();
    res.status(200).json({ message: 'Meeting deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   18. VOICE MESSAGE & TRANSCRIPTION MODULE
   ========================================================= */
export const uploadVoiceMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No voice message file uploaded.' });
    }

    const { channelId, durationSeconds, transcription, meetingId } = req.body;
    if (!channelId && !meetingId) {
      return res.status(400).json({ message: 'Either channelId or meetingId is required.' });
    }

    // Save audio file path
    const filePath = `/uploads/${req.file.filename}`;
    
    // Resolve transcription content
    let finalTranscription = transcription || '';
    if (!finalTranscription) {
      // Mock transcription if browser text was not provided
      finalTranscription = `[Voice Note Transcription - ${new Date().toLocaleTimeString()}] Hi team, checking in on our operations alignment checklist. Please make sure to complete BCO projects by end of shift today.`;
    }

    // Determine speaker name
    const speakerName = req.user?.email ? req.user.email.split('@')[0] : 'Staff Member';

    // 1. If it's a channel chat voice note
    let messageId = null;
    if (channelId) {
      const msg = new Message({
        channel: channelId,
        sender: req.user._id,
        content: `🎤 Voice Note (${Math.round(durationSeconds || 0)}s) - Click to listen`,
        attachments: [{
          fileName: req.file.originalname || 'voice_message.webm',
          filePath
        }]
      });
      await msg.save();
      messageId = msg._id;

      // Populate sender and broadcast
      const populatedMsg = await msg.populate('sender', 'email');
      if (global.io) {
        global.io.to(channelId).emit('new_message', populatedMsg);
      }
    }

    // 2. Save VoiceTranscript record in DB
    const transcript = new VoiceTranscript({
      message: messageId,
      meeting: meetingId || undefined,
      speaker: req.user._id,
      speakerName,
      channel: channelId || undefined,
      filePath,
      transcription: finalTranscription,
      durationSeconds: durationSeconds || 0,
      aiSummary: `Brief staff briefing about operations checklist checklist alignment by ${speakerName}.`,
      meetingMinutes: `Meeting synced at ${new Date().toLocaleTimeString()}.\n- Speaker: ${speakerName}\n- Main discussion: Operational progress checks.`,
      actionItems: ['Complete BCO projects by end of shift', 'Review checklist statuses']
    });
    await transcript.save();

    res.status(201).json({
      message: 'Voice message uploaded and transcribed successfully.',
      filePath,
      transcription: finalTranscription,
      transcript
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchVoiceTranscripts = async (req, res) => {
  const { query, channelId, meetingId } = req.query;
  try {
    const filter = {};
    if (query) {
      filter.transcription = { $regex: query, $options: 'i' };
    }
    if (channelId) filter.channel = channelId;
    if (meetingId) filter.meeting = meetingId;

    const list = await VoiceTranscript.find(filter)
      .populate('speaker', 'email')
      .populate('channel', 'name')
      .populate('meeting', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   19. CUSTOM ROLES & PERMISSIONS MODULE
   ========================================================= */
export const getCustomRoles = async (req, res) => {
  try {
    const list = await CustomRole.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = new CustomRole({ name, description, permissions });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomRole = async (req, res) => {
  const { id } = req.params;
  try {
    await CustomRole.findByIdAndDelete(id);
    res.status(200).json({ message: 'Custom role deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

