import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

export class DeliveriesService {
  async assignDelivery(data: any, userId: string) {
    const { orderId, driverId, estimatedDeliveryTime, notes } = data;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, 'Pedido no encontrado');
    if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.PREPARING) {
      throw new AppError(400, 'El pedido debe estar en estado CONFIRMED o PREPARING para asignar entrega');
    }

    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) throw new AppError(404, 'Repartidor no encontrado');

    const delivery = await prisma.$transaction(async (tx) => {
      const upserted = await tx.delivery.upsert({
        where: { orderId },
        create: {
          orderId,
          driverId,
          estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
          notes,
          assignedBy: userId,
        },
        update: {
          driverId,
          estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : undefined,
          notes,
          assignedBy: userId,
        },
        include: {
          order: true,
          driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (order.status === OrderStatus.CONFIRMED) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PREPARING },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: OrderStatus.CONFIRMED,
            toStatus: OrderStatus.PREPARING,
            notes: 'Repartidor asignado',
            changedBy: userId,
          },
        });
      }

      return upserted;
    });

    return delivery;
  }

  async createRoute(data: any, userId: string) {
    const { driverId, name, date, orderIds, notes } = data;

    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) throw new AppError(404, 'Repartidor no encontrado');

    const orders = await prisma.order.findMany({ where: { id: { in: orderIds } } });
    if (orders.length !== orderIds.length) {
      throw new AppError(404, 'Uno o más pedidos no encontrados');
    }

    const route = await prisma.$transaction(async (tx) => {
      const newRoute = await tx.deliveryRoute.create({
        data: {
          driverId,
          name,
          date: new Date(date),
          notes,
          createdBy: userId,
        },
      });

      for (const orderId of orderIds) {
        await tx.delivery.upsert({
          where: { orderId },
          create: {
            orderId,
            driverId,
            routeId: newRoute.id,
            assignedBy: userId,
          },
          update: {
            routeId: newRoute.id,
          },
        });
      }

      return tx.deliveryRoute.findUnique({
        where: { id: newRoute.id },
        include: {
          driver: { select: { id: true, firstName: true, lastName: true, email: true } },
          deliveries: { include: { order: true } },
        },
      });
    });

    return route;
  }

  async updateDeliveryStatus(deliveryId: string, data: any, userId: string) {
    const { status, deliveredAt, failureReason, receivedBy, notes, latitude, longitude } = data;

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });
    if (!delivery) throw new AppError(404, 'Entrega no encontrada');

    const originalOrderStatus = delivery.order.status;

    const orderStatusMap: Partial<Record<DeliveryStatus, OrderStatus>> = {
      [DeliveryStatus.IN_ROUTE]: OrderStatus.IN_ROUTE,
      [DeliveryStatus.DELIVERED]: OrderStatus.DELIVERED,
    };

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status,
          deliveredAt: deliveredAt ? new Date(deliveredAt) : undefined,
          failureReason,
          receivedBy,
          notes,
        },
        include: {
          order: true,
          driver: { select: { id: true, firstName: true, lastName: true, email: true } },
          route: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId,
          status,
          notes,
          latitude,
          longitude,
          changedBy: userId,
        },
      });

      const newOrderStatus = orderStatusMap[status as DeliveryStatus];
      if (newOrderStatus) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: newOrderStatus },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.orderId,
            fromStatus: originalOrderStatus,
            toStatus: newOrderStatus,
            notes: `Actualizado por cambio de estado de entrega a ${status}`,
            changedBy: userId,
          },
        });
      }

      return updatedDelivery;
    });

    return updated;
  }

  async updateDriverLocation(deliveryId: string, data: any) {
    const { latitude, longitude } = data;

    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) throw new AppError(404, 'Entrega no encontrada');

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationUpdate: new Date(),
      },
      select: {
        id: true,
        lastLatitude: true,
        lastLongitude: true,
        lastLocationUpdate: true,
      },
    });

    return updated;
  }

  async getDeliveries(query: any) {
    const { page, limit, driverId, routeId, status, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (routeId) where.routeId = routeId;
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              customer: { select: { id: true, firstName: true, lastName: true, businessName: true } },
              address: true,
            },
          },
          driver: { select: { id: true, firstName: true, lastName: true, email: true } },
          route: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.delivery.count({ where }),
    ]);

    return {
      data: deliveries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDeliveryById(id: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            address: true,
            orderItems: { include: { product: true } },
          },
        },
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        route: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!delivery) throw new AppError(404, 'Entrega no encontrada');
    return delivery;
  }

  async getRoutes(query: any) {
    const { page, limit, driverId, date, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }

    const [routes, total] = await Promise.all([
      prisma.deliveryRoute.findMany({
        where,
        skip,
        take: limit,
        include: {
          driver: { select: { id: true, firstName: true, lastName: true, email: true } },
          deliveries: {
            include: { order: { select: { id: true, code: true, status: true } } },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.deliveryRoute.count({ where }),
    ]);

    const data = routes.map((r) => ({
      ...r,
      totalDeliveries: r.deliveries.length,
      pending: r.deliveries.filter((d) => d.status === DeliveryStatus.PENDING).length,
      delivered: r.deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED).length,
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRouteById(id: string) {
    const route = await prisma.deliveryRoute.findUnique({
      where: { id },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        deliveries: {
          include: {
            order: { include: { customer: true, address: true } },
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!route) throw new AppError(404, 'Ruta no encontrada');

    const stats = {
      totalDeliveries: route.deliveries.length,
      pending: route.deliveries.filter((d) => d.status === DeliveryStatus.PENDING).length,
      inRoute: route.deliveries.filter((d) => d.status === DeliveryStatus.IN_ROUTE).length,
      delivered: route.deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED).length,
      failed: route.deliveries.filter((d) => d.status === DeliveryStatus.FAILED).length,
      returned: route.deliveries.filter((d) => d.status === DeliveryStatus.RETURNED).length,
    };

    return { ...route, stats };
  }

  async getDriverPerformance(query: any) {
    const { driverId, fromDate, toDate } = query;

    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const driverMap = new Map<string, any>();

    for (const d of deliveries) {
      const key = d.driverId;
      if (!driverMap.has(key)) {
        driverMap.set(key, {
          driver: d.driver,
          totalDeliveries: 0,
          delivered: 0,
          failed: 0,
          returned: 0,
          pending: 0,
          inRoute: 0,
        });
      }
      const entry = driverMap.get(key);
      entry.totalDeliveries++;
      if (d.status === DeliveryStatus.DELIVERED) entry.delivered++;
      else if (d.status === DeliveryStatus.FAILED) entry.failed++;
      else if (d.status === DeliveryStatus.RETURNED) entry.returned++;
      else if (d.status === DeliveryStatus.PENDING) entry.pending++;
      else if (d.status === DeliveryStatus.IN_ROUTE) entry.inRoute++;
    }

    const results = Array.from(driverMap.values()).map((entry) => {
      const finalized = entry.delivered + entry.failed + entry.returned;
      return {
        ...entry,
        successRate: finalized > 0 ? parseFloat(((entry.delivered / finalized) * 100).toFixed(2)) : 0,
        failureRate: finalized > 0 ? parseFloat(((entry.failed / finalized) * 100).toFixed(2)) : 0,
      };
    });

    results.sort((a, b) => b.totalDeliveries - a.totalDeliveries);

    return driverId ? results[0] ?? null : results;
  }
}
