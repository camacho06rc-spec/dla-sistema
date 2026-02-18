import { z } from 'zod';
import { OrderStatus, PaymentMethod, OrderSource, DeliveryType, OrderUnit } from '@prisma/client';

export const createOrderItemSchema = z.object({
  productId: z.string().uuid(),
  boxes: z.number().int().min(0).default(0),
  pieces: z.number().int().min(0).default(0)
}).refine(data => data.boxes > 0 || data.pieces > 0, {
  message: "Debe especificar al menos cajas o piezas"
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  branchId: z.string().uuid(),
  deliveryAddressId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z.array(createOrderItemSchema).min(1, "Debe incluir al menos un producto"),
  notes: z.string().optional(),
  deliveryDate: z.string().datetime().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional()
});

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
});
