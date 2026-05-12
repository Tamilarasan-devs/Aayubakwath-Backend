import nodemailer from 'nodemailer';
import { logger } from '@config/logger.js';

// Use the SMTP user as the default sender address
const FROM = process.env.SMTP_USER ?? 'tamilarasan.softwarengineer@gmail.com';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // IMPORTANT: Do not put your real password here in the code check!
  // This check is only meant to prevent errors if NO password is set at all.
  if (!host || !user || !pass || pass === 'your-app-password-here') {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('SMTP configuration is incomplete. Email will be logged to console instead.');
      return null;
    }
    throw new Error('SMTP configuration (HOST, USER, PASS) is required for production email sending');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    logger.info(`[DEV MODE] OTP for ${to}: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Aayubakwath" <${FROM}>`,
      to,
      subject: 'Your verification code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Verify your email</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px">Use the code below to complete your registration. It expires in 10 minutes.</p>
          <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#111827;text-align:center;padding:20px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
            ${otp}
          </div>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${to}`);
  } catch (error: any) {
    logger.error('Nodemailer OTP email failed', { 
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error('Failed to send verification email');
  }
}

export async function sendForgotPasswordEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    logger.info(`[DEV MODE] Forgot Password OTP for ${to}: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Aayubakwath" <${FROM}>`,
      to,
      subject: 'Reset your password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="margin:0 0 8px;font-size:22px;color:#111827">Reset your password</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px">Use the code below to reset your password. It expires in 10 minutes.</p>
          <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#111827;text-align:center;padding:20px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
            ${otp}
          </div>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    logger.info(`Forgot password email sent to ${to}`);
  } catch (error: any) {
    logger.error('Nodemailer forgot password email failed', { 
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error('Failed to send password reset email');
  }
}
