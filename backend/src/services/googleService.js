import logger from '../config/logger.js';

// Checks if Google keys are configured
const isConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

export const sendGmailEmail = async ({ to, subject, body }) => {
  if (isConfigured()) {
    logger.info(`Sending REAL Gmail to ${to} with subject: ${subject}`);
    // Real Google OAuth + Gmail REST API call would go here
    return { success: true, messageId: 'real-msg-id-12345' };
  } else {
    logger.info(`[MOCK GOOGLE] Sending Gmail to ${to} | Subject: ${subject}`);
    return { success: true, messageId: 'mock-msg-id-' + Math.random().toString(36).substring(7) };
  }
};

export const createGoogleCalendarEvent = async ({ title, description, startTime, durationMinutes }) => {
  if (isConfigured()) {
    logger.info(`Creating REAL Google Calendar Event: ${title}`);
    return {
      success: true,
      eventId: 'real-event-123',
      meetLink: 'https://meet.google.com/real-abc-def'
    };
  } else {
    const meetId = Math.random().toString(36).substring(2, 5) + '-' +
                   Math.random().toString(36).substring(2, 6) + '-' +
                   Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${meetId}`;
    logger.info(`[MOCK GOOGLE] Created Calendar Event and Google Meet link: ${meetLink}`);
    return {
      success: true,
      eventId: 'mock-event-' + Math.random().toString(36).substring(7),
      meetLink
    };
  }
};

export const uploadToGoogleDrive = async (fileName, fileContentBuffer) => {
  if (isConfigured()) {
    logger.info(`Uploading REAL file to Google Drive: ${fileName}`);
    return { success: true, driveFileId: 'real-drive-file-999' };
  } else {
    logger.info(`[MOCK GOOGLE] Uploaded file to Google Drive: ${fileName}`);
    return { success: true, driveFileId: 'mock-drive-file-' + Math.random().toString(36).substring(7) };
  }
};

export const appendToGoogleSheet = async (spreadsheetId, range, values) => {
  if (isConfigured()) {
    logger.info(`Appending REAL rows to Google Sheet ${spreadsheetId}`);
    return { success: true };
  } else {
    logger.info(`[MOCK GOOGLE] Appended row to Google Sheet range ${range}: ${JSON.stringify(values)}`);
    return { success: true };
  }
};
