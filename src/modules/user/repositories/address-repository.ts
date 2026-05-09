import { prisma } from '@config/database.js';
import type { Address } from '@prisma/client';
import type { CreateAddressInput, UpdateAddressInput } from '../validators/address-validator.js';

export class AddressRepository {
  async findAllByUserId(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({ where: { id } });
  }

  async create(userId: string, data: CreateAddressInput): Promise<Address> {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        doorNumber: data.doorNumber,
        area: data.area,
        street: data.area,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        landmark: data.landmark ?? null,
        addressType: data.addressType,
        isDefault: data.isDefault ?? false,
        country: 'India',
      },
    });
  }

  async update(id: string, userId: string, data: UpdateAddressInput): Promise<Address> {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.doorNumber !== undefined && { doorNumber: data.doorNumber }),
        ...(data.area !== undefined && { area: data.area, street: data.area }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.landmark !== undefined && { landmark: data.landmark }),
        ...(data.addressType !== undefined && { addressType: data.addressType }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}

export const addressRepository = new AddressRepository();
