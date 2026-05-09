import { addressRepository } from '../repositories/address-repository.js';
import { AppError } from '@utils/app-error.js';
import type { CreateAddressInput, UpdateAddressInput } from '../validators/address-validator.js';
import type { Address } from '@prisma/client';

export class AddressService {
  async getAll(userId: string): Promise<Address[]> {
    return addressRepository.findAllByUserId(userId);
  }

  async create(userId: string, data: CreateAddressInput): Promise<Address> {
    const existing = await addressRepository.findAllByUserId(userId);
    if (existing.length >= 10) {
      throw AppError.badRequest('Maximum 10 addresses allowed');
    }
    if (existing.length === 0) {
      data.isDefault = true;
    }
    return addressRepository.create(userId, data);
  }

  async update(userId: string, addressId: string, data: UpdateAddressInput): Promise<Address> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.userId !== userId) {
      throw AppError.notFound('Address not found');
    }
    return addressRepository.update(addressId, userId, data);
  }

  async delete(userId: string, addressId: string): Promise<void> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.userId !== userId) {
      throw AppError.notFound('Address not found');
    }
    await addressRepository.delete(addressId);
  }

  async setDefault(userId: string, addressId: string): Promise<Address> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.userId !== userId) {
      throw AppError.notFound('Address not found');
    }
    return addressRepository.setDefault(addressId, userId);
  }
}

export const addressService = new AddressService();
