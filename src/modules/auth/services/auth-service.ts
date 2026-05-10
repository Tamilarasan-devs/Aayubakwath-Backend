import { randomInt } from 'crypto';
import { userRepository } from '@modules/auth/repositories/user-repository.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '@utils/password.js';
import { generateAccessToken, generateRefreshToken, type TokenPayload } from '@utils/jwt.js';
import { AppError } from '@utils/app-error.js';
import { logger } from '@config/logger.js';
import { sendOtpEmail } from './email-service.js';

export interface RegisterInput {
  name: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginInput {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterPendingResult {
  userId: string;
  email: string;
  message: string;
}

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export class AuthService {
  async register(input: RegisterInput): Promise<RegisterPendingResult> {
    if (!input.email && !input.phoneNumber) {
      throw AppError.badRequest('Email or phone number is required');
    }

    validatePasswordStrength(input.password);

    const existingUser = await userRepository.findByEmailOrPhone(input.email, input.phoneNumber);
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw AppError.conflict('User already exists with this email or phone number');
      }
      // Unverified account exists — resend OTP instead of blocking
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      const hashedOtp = await hashPassword(otp);
      await userRepository.saveOtp(existingUser.id, hashedOtp, otpExpiry);
      if (existingUser.email) await sendOtpEmail(existingUser.email, otp);
      logger.info(`OTP resent for unverified user: ${existingUser.id}`);
      return {
        userId: existingUser.id,
        email: existingUser.email ?? '',
        message: 'Verification code sent to your email',
      };
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      password: hashedPassword,
    });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await hashPassword(otp);
    await userRepository.saveOtp(user.id, hashedOtp, otpExpiry);

    if (user.email) await sendOtpEmail(user.email, otp);

    logger.info(`User registered, OTP sent: ${user.id}`);

    return {
      userId: user.id,
      email: user.email ?? '',
      message: 'Verification code sent to your email',
    };
  }

  async verifyOtp(userId: string, otp: string): Promise<AuthResult> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user.isEmailVerified) {
      throw AppError.badRequest('Email already verified');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw AppError.badRequest('No verification code found. Please register again.');
    }

    if (new Date() > user.otpExpiry) {
      throw AppError.badRequest('Verification code has expired. Please request a new one.');
    }

    const isValid = await comparePassword(otp, user.otpCode);
    if (!isValid) {
      throw AppError.badRequest('Invalid verification code');
    }

    await userRepository.markEmailVerified(user.id);

    const tokenPayload: TokenPayload = { id: user.id, role: user.role };

    logger.info(`Email verified for user: ${user.id}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }

  async resendOtp(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    if (user.isEmailVerified) throw AppError.badRequest('Email already verified');
    if (!user.email) throw AppError.badRequest('No email address on file');

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await hashPassword(otp);
    await userRepository.saveOtp(user.id, hashedOtp, otpExpiry);
    await sendOtpEmail(user.email, otp);

    logger.info(`OTP resent for user: ${user.id}`);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    if (!input.email && !input.phoneNumber) {
      throw AppError.badRequest('Email or phone number is required');
    }

    const user = input.email
      ? await userRepository.findByEmail(input.email)
      : await userRepository.findByPhoneNumber(input.phoneNumber!);

    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated');
    }

    if (user.email && !user.isEmailVerified && process.env.NODE_ENV === 'production') {
      throw AppError.forbidden('Please verify your email before logging in');
    }

    const tokenPayload: TokenPayload = { id: user.id, role: user.role };

    logger.info(`User logged in: ${user.id}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const payload = await import('@utils/jwt.js').then((m) => m.verifyRefreshToken(refreshToken));

    const user = await userRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const newTokenPayload: TokenPayload = { id: user.id, role: user.role };

    return {
      token: generateAccessToken(newTokenPayload),
      refreshToken: generateRefreshToken(newTokenPayload),
    };
  }
}

export const authService = new AuthService();
