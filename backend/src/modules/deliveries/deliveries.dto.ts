import { z } from 'zod';
import { DeliveryStatus, RouteStatus } from '@prisma/client';

export const assignDeliverySchema = z.object({
  orderId: z.string().uuid(),
  driverId: z.string().uuid(),
  estimatedDeliveryTime: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const createRouteSchema = z.object({
  driverId: z.string().uuid(),
  name: z.string().min(1),
  date: z.string().datetime(),
  orderIds: z.array(z.string().uuid()).min(1),
  notes: z.string().optional(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
  deliveredAt: z.string().datetime().optional(),
  failureReason: z.string().optional(),
  receivedBy: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine(
  (data) => data.status !== DeliveryStatus.DELIVERED || !!data.deliveredAt,
  { message: 'deliveredAt es requerido cuando el estado es DELIVERED' }
).refine(
  (data) => data.status !== DeliveryStatus.FAILED || !!data.failureReason,
  { message: 'failureReason es requerido cuando el estado es FAILED' }
);

export const updateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const getDeliveriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  driverId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
  status: z.nativeEnum(DeliveryStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const getRoutesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  driverId: z.string().uuid().optional(),
  date: z.string().optional(),
  status: z.nativeEnum(RouteStatus).optional(),
});

export const getPerformanceQuerySchema = z.object({
  driverId: z.string().uuid().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
