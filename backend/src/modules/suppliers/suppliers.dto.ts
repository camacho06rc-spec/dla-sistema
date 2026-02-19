import { z } from 'zod';

// Create Supplier
export const createSupplierSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeName: z.string().optional(),
  rfc: z.string().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  street: z.string().min(1, 'Street is required'),
  exteriorNumber: z.string().min(1, 'Exterior number is required'),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().default('México'),
  creditDays: z.number().int().min(0).default(0),
  creditLimit: z.number().min(0).default(0),
});

export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;

// Update Supplier
export const updateSupplierSchema = createSupplierSchema.partial();
export type UpdateSupplierDTO = z.infer<typeof updateSupplierSchema>;

// Toggle Block
export const toggleBlockSupplierSchema = z.object({
  reason: z.string().optional(),
});
export type ToggleBlockSupplierDTO = z.infer<typeof toggleBlockSupplierSchema>;

// Create Contact
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.string().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  isMain: z.boolean().default(false),
});

export type CreateContactDTO = z.infer<typeof createContactSchema>;

// Update Contact
export const updateContactSchema = createContactSchema.partial();
export type UpdateContactDTO = z.infer<typeof updateContactSchema>;

// Add Product to Supplier
export const addProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  leadTimeDays: z.number().int().min(0).default(0),
  minimumOrder: z.number().int().min(1).default(1),
  supplierSku: z.string().optional(),
  isPreferred: z.boolean().default(false),
});

export type AddProductDTO = z.infer<typeof addProductSchema>;

// Update Supplier Product
export const updateSupplierProductSchema = addProductSchema.partial().omit({ productId: true });
export type UpdateSupplierProductDTO = z.infer<typeof updateSupplierProductSchema>;

// Query filters
export const suppliersQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  isBlocked: z.enum(['true', 'false']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export type SuppliersQueryDTO = z.infer<typeof suppliersQuerySchema>;
