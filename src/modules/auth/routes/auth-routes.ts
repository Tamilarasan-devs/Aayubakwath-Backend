import { Router } from 'express';
import { register, login, refreshToken, getProfile, verifyOtp, resendOtp } from '@modules/auth/controllers/auth-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate } from '@middleware/auth.js';
import { authRateLimiter } from '@middleware/rate-limiter.js';
import { registerSchema, loginSchema, refreshTokenSchema, verifyOtpSchema, resendOtpSchema } from '@modules/auth/validators/auth-validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authRateLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.get('/profile', authenticate, getProfile);

export default router;
