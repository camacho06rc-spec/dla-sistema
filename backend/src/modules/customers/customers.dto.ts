import { z } from 'zod';
import { CustomerType, CustomerTier } from '@prisma/client';

export const createCustomerSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  businessName: z.string().min(2).max(200).optional(),
  type: z.nativeEnum(CustomerType),
  tier: z.nativeEnum(CustomerTier).default('EVENTUAL'),
  credentialId: z.string().optional()
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const getCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(CustomerType).optional(),
  tier: z.nativeEnum(CustomerTier).optional(),
  isActive: z.coerce.boolean().optional(),
  isBlocked: z.coerce.boolean().optional()
});

export const createAddressSchema = z.object({
  customerId: z.string().uuid(),
  street: z.string().min(3).max(200),
  number: z.string().max(50).optional(),
  colony: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zipCode: z.string().optional(),
  references: z.string().optional(),
  isDefault: z.boolean().default(false)
});

export const updateAddressSchema = createAddressSchema.omit({ customerId: true }).partial();

export const toggleBlockSchema = z.object({
  reason: z.string().optional()
});

export const changeTierSchema = z.object({
  tier: z.nativeEnum(CustomerTier)
});
