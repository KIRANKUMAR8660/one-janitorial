import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger.js';

// Setup nodemailer transport
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || process.env.GMAIL_SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.SENDGRID_USER;
  const pass = process.env.SMTP_PASS || process.env.SENDGRID_API_KEY;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    logger.info('Nodemailer SMTP Transporter configured successfully.');
  }
  return transporter;
};

// Logger to write simulated emails locally in dev/fallback
const logEmailLocally = (to, subject, bodyHtml, text) => {
  try {
    const logDir = path.resolve('c:/Users/KIRAN Kumar/Downloads/one__janitorial/backend');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'temp_emails.log');
    const logEntry = `
=========================================
TIMESTAMP: ${new Date().toISOString()}
TO: ${to}
SUBJECT: ${subject}
-----------------------------------------
TEXT BODY:
${text}
-----------------------------------------
HTML BODY:
${bodyHtml}
=========================================
\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    logger.info(`Simulated email logged to: ${logFilePath}`);
  } catch (err) {
    logger.error('Failed to log email locally', err);
  }
};

/**
 * Sends a password reset request email
 */
export const sendResetPasswordEmail = async ({ to, userName, resetLink }) => {
  const subject = 'Password Reset Request';
  const text = `Hello ${userName},

We received a request to reset your password.

Click below to create a new password:

${resetLink}

This link expires in 30 minutes.

If you did not request this change, ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 4px; background-color: #FFFFFF;">
      <div style="background-color: #001F3F; padding: 15px; text-align: center; border-radius: 4px 4px 0 0;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 0.5px;">One Janitorial Operations</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #111827;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.5;">We received a request to reset your password.</p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.5;">Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank" style="background-color: #00A8E8; color: #FFFFFF; text-decoration: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #9CA3AF; line-height: 1.5;">
          Or copy and paste this URL into your browser: <br/>
          <a href="${resetLink}" style="color: #00A8E8;">${resetLink}</a>
        </p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.5; margin-top: 20px;">This link expires in 30 minutes.</p>
        <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5; margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
          If you did not request this change, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  const client = getTransporter();
  if (client) {
    try {
      await client.sendMail({
        from: process.env.SMTP_FROM || '"One Janitorial Security" <security@onejanitorial.com>',
        to,
        subject,
        text,
        html
      });
      logger.info(`Password reset email successfully sent to ${to} via SMTP.`);
      return { success: true };
    } catch (err) {
      logger.error(`Failed to send email via SMTP, falling back to local file log. Error: ${err.message}`);
    }
  }

  // Fallback to local file logging
  logEmailLocally(to, subject, html, text);
  return { success: true, loggedLocally: true };
};

/**
 * Sends an account lockout notification email
 */
export const sendLockoutNotificationEmail = async ({ to, userName }) => {
  const subject = 'Security Alert: Account Locked';
  const text = `Hello ${userName},

Your account has been locked for 15 minutes due to 5 consecutive failed login attempts.

If you did not request this change, please contact your security administrator immediately.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EF4444; border-radius: 4px; background-color: #FFFFFF;">
      <div style="background-color: #EF4444; padding: 15px; text-align: center; border-radius: 4px 4px 0 0;">
        <h2 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 0.5px;">Security Alert</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #111827;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.5;">Your account has been locked for <strong>15 minutes</strong> due to 5 consecutive failed login attempts.</p>
        <p style="font-size: 14px; color: #EF4444; font-weight: bold; line-height: 1.5; margin-top: 20px;">
          If you did not perform these actions, please contact your security administrator immediately.
        </p>
      </div>
    </div>
  `;

  const client = getTransporter();
  if (client) {
    try {
      await client.sendMail({
        from: process.env.SMTP_FROM || '"One Janitorial Security" <security@onejanitorial.com>',
        to,
        subject,
        text,
        html
      });
      logger.info(`Account lockout email successfully sent to ${to} via SMTP.`);
      return { success: true };
    } catch (err) {
      logger.error(`Failed to send email via SMTP, falling back to local file log. Error: ${err.message}`);
    }
  }

  logEmailLocally(to, subject, html, text);
  return { success: true, loggedLocally: true };
};
