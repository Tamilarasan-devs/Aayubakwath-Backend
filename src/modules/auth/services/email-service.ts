import { Resend } from 'resend';
import { logger } from '@config/logger.js';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

let resend: Resend | null = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('RESEND_API_KEY is missing. Email will be logged to console instead.');
      return null;
    }
    throw new Error('RESEND_API_KEY is required to send verification emails');
  }

  resend ??= new Resend(apiKey);
  return resend;
};

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const client = getResendClient();

  if (!client) {
    logger.info(`[DEV MODE] OTP for ${to}: ${otp}`);
    return;
  }

  const { error } = await client.emails.send({
    from: FROM,
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

  if (error) {
    logger.error('Resend email failed', { error });
    throw new Error('Failed to send verification email');
  }

  logger.info(`OTP email sent to ${to}`);
}
