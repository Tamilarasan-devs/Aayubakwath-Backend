import nodemailer from 'nodemailer';
import { logger } from '@config/logger.js';
import { AppError } from '@utils/app-error.js';

// Default sender email
const FROM =
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  'no-reply@example.com';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Prevent crashes if SMTP config is missing
  if (!host || !user || !pass) {
    logger.warn(
      'SMTP configuration is incomplete. Emails will be logged to console.'
    );
    return null;
  }

  return nodemailer.createTransport(
    {
      host,
      port,
      secure: port === 465,
      pool: true, // Use pooling for better performance and resilience
      maxConnections: 5,
      maxMessages: 100,

      auth: {
        user,
        pass,
      },

      tls: {
        rejectUnauthorized: false,
      },

      // Increased timeouts to handle slow SMTP responses
      connectionTimeout: 20000, // 20s
      greetingTimeout: 20000,   // 20s
      socketTimeout: 30000,     // 30s
    } as any
  );
};

// Shared email template
const generateTemplate = (
  title: string,
  description: string,
  otp: string
) => `
  <div
    style="
      font-family:sans-serif;
      max-width:480px;
      margin:0 auto;
      padding:32px 24px;
      background:#fff;
      border:1px solid #e5e7eb;
      border-radius:12px;
    "
  >
    <h2
      style="
        margin:0 0 8px;
        font-size:22px;
        color:#111827;
      "
    >
      ${title}
    </h2>

    <p
      style="
        margin:0 0 24px;
        color:#6b7280;
        font-size:15px;
      "
    >
      ${description}
    </p>

    <div
      style="
        letter-spacing:10px;
        font-size:36px;
        font-weight:700;
        color:#111827;
        text-align:center;
        padding:20px;
        background:#f9fafb;
        border-radius:8px;
        border:1px solid #e5e7eb;
      "
    >
      ${otp}
    </div>

    <p
      style="
        margin:24px 0 0;
        color:#9ca3af;
        font-size:13px;
      "
    >
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const transporter = createTransporter();

  // Development fallback
  if (!transporter) {
    logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Aayubakwath" <${FROM}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully to ${to}`);
  } catch (error: any) {
    logger.error('Email sending failed', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
      command: error?.command,
      stack: error?.stack,
      to,
      subject
    });

    // Provide a more descriptive error if it's a timeout
    if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
      throw AppError.internal('Email service connection timed out. Please try again.');
    }

    throw AppError.internal('Failed to send email');
  }
};

// Send verification OTP email
export async function sendOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  await sendEmail(
    to,
    'Your verification code',
    generateTemplate(
      'Verify your email',
      'Use the code below to complete your registration. It expires in 10 minutes.',
      otp
    )
  );
}

// Send forgot password OTP email
export async function sendForgotPasswordEmail(
  to: string,
  otp: string
): Promise<void> {
  await sendEmail(
    to,
    'Reset your password',
    generateTemplate(
      'Reset your password',
      'Use the code below to reset your password. It expires in 10 minutes.',
      otp
    )
  );
}