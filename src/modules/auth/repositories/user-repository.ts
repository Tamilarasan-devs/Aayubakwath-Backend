import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { User } from '@prisma/client';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }

  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });
  }

  async existsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });
    return count > 0;
  }

  async saveOtp(userId: string, otpCode: string, otpExpiry: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { otpCode, otpExpiry },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, otpCode: null, otpExpiry: null },
    });
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password, otpCode: null, otpExpiry: null },
    });
  }
}

export const userRepository = new UserRepository();
