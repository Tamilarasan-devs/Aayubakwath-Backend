import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { logger } from '@config/logger.js';
import { AppError } from '@utils/app-error.js';

// Default sender email
const FROM =
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  'no-reply@example.com';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465); // Default to 465 for better compatibility
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

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
      secure: port === 465, // Use true for 465, false for other ports
      pool: true,
      maxConnections: 5,
      maxMessages: 100,

      auth: {
        user,
        pass,
      },

      tls: {
        // Do not fail on invalid certs
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
  let stage = 'initializing';
  try {
    // Try Resend first if API key is provided
    if (resend) {
      stage = 'sending via Resend';
      try {
        const { data, error } = await resend.emails.send({
          from: `Aayubakwath <${process.env.RESEND_FROM_EMAIL || FROM}>`,
          to,
          subject,
          html,
        });

        if (error) {
          logger.error('Resend email failed', { error });
          // Fall back to nodemailer if Resend fails
        } else {
          logger.info(`Email sent successfully via Resend to ${to}`, { id: data?.id });
          return;
        }
      } catch (resendError: any) {
        logger.error('Resend service error', { message: resendError?.message, stage });
        // Fall back to nodemailer
      }
    }

    stage = 'creating transporter';
    const transporter = createTransporter();

    // Development fallback
    if (!transporter) {
      logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    stage = 'sending via SMTP';
    await transporter.sendMail({
      from: `"Aayubakwath" <${FROM}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully to ${to}`);
  } catch (error: any) {
    logger.error('Email sending failed', {
      stage,
      message: error?.message,
      code: error?.code,
      response: error?.response,
      command: error?.command,
      stack: error?.stack,
      to,
      subject
    });

    // Provide a more descriptive error based on the stage and error type
    const errorPrefix = `Email failed during ${stage}: `;
    
    if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
      throw AppError.internal(`${errorPrefix}Connection timed out. Please check your SMTP settings or network.`);
    }

    if (error?.code === 'EAUTH' || error?.message?.includes('Invalid login')) {
      throw AppError.internal(`${errorPrefix}Authentication failed. Please check your SMTP credentials.`);
    }

    throw AppError.internal(`${errorPrefix}${error?.message || 'Unexpected error'}`);
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