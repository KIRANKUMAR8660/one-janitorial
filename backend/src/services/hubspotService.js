import Deal from '../models/Deal.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import logger from '../config/logger.js';

export const triggerClosedWonFollowUp = async (dealId) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    logger.info(`HubSpot closed-won follow-up triggered for Deal: ${deal.title}`);
    deal.followUpStatus = 'Pending';
    await deal.save();

    // In a real implementation, we would register a queue task (e.g. BullMQ) for 3 days.
    // For local testing, we schedule an asynchronous mock follow-up in 10 seconds.
    setTimeout(async () => {
      try {
        const d = await Deal.findById(dealId);
        if (d && d.followUpStatus === 'Pending') {
          d.followUpStatus = 'Completed';
          d.followUpSentDate = new Date();
          d.activityLogs.push({ action: 'Automated follow-up email sent to ' + (d.clientEmail || 'client@example.com'), timestamp: new Date() });
          await d.save();
          logger.info(`Automated CRM email follow-up sent successfully for Deal: ${d.title}`);
        }
      } catch (err) {
        logger.error(`Error executing scheduled CRM follow-up: ${err.message}`);
      }
    }, 10000); // 10 seconds for demo rather than 3 days
  } catch (error) {
    logger.error(`HubSpot Closed Won follow-up error: ${error.message}`);
  }
};

export const runLeadHygieneCheck = async () => {
  try {
    logger.info('Running CRM Lead Hygiene Automation');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Flag inactive leads after 7 days
    const inactiveLeads = await Lead.find({
      updatedAt: { $lt: sevenDaysAgo },
      status: { $ne: 'Inactive' }
    });
    for (const lead of inactiveLeads) {
      lead.status = 'Inactive';
      lead.inactiveFlagged = true;
      lead.hygieneStatus = 'Flagged for Reassignment';
      await lead.save();
      logger.info(`Lead hygiene: Flagged lead ${lead.firstName} ${lead.lastName} as inactive.`);
    }

    // 2. Lead cap enforcement and Round-Robin distribution
    const salesReps = await User.find({ role: 'Sales' });
    if (salesReps.length > 0) {
      const unassignedLeads = await Lead.find({ assignedTo: { $exists: false } });
      let repIndex = 0;
      for (const lead of unassignedLeads) {
        lead.assignedTo = salesReps[repIndex]._id;
        lead.hygieneStatus = 'Assigned (Round-Robin)';
        await lead.save();
        logger.info(`Lead hygiene: Assigned lead ${lead.firstName} to rep: ${salesReps[repIndex].email}`);
        repIndex = (repIndex + 1) % salesReps.length;
      }
    }
  } catch (error) {
    logger.error(`HubSpot Lead Hygiene check failed: ${error.message}`);
  }
};

export const triggerAppointmentAutomation = async (leadId, creatorId) => {
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) return;

    logger.info(`Appointment Automation triggered for Lead: ${lead.firstName} ${lead.lastName}`);
    // Create Callback task
    const callbackTask = new Task({
      title: `Callback Lead: ${lead.firstName} ${lead.lastName}`,
      description: `Follow up callback for lead email: ${lead.email}. Phone: ${lead.phone || 'N/A'}`,
      assignedTo: lead.assignedTo || creatorId,
      createdBy: creatorId,
      priority: 'High',
      status: 'Todo',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day out
    });
    await callbackTask.save();
    logger.info(`Created callback task for lead callback.`);
  } catch (error) {
    logger.error(`Appointment automation error: ${error.message}`);
  }
};
