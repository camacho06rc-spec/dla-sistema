import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateReturnableEventDTO,
  GetReturnablesLedgersQueryDTO,
  GetReturnableEventsQueryDTO,
  AdjustLedgerDTO,
} from './returnables.dto';

export class ReturnablesService {
  async createEvent(data: CreateReturnableEventDTO, userId: string) {
    const { customerId, type, quantity, orderId, depositCharged, notes } = data;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError(404, 'Cliente no encontrado');

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new AppError(404, 'Pedido no encontrado');
      if (order.customerId !== customerId) {
        throw new AppError(400, 'El pedido no pertenece al cliente especificado');
      }
    }

    let ledger = await prisma.returnablesLedger.findUnique({ where: { customerId } });
    if (!ledger) {
      ledger = await prisma.returnablesLedger.create({
        data: { customerId, pendingContainers: 0 },
      });
    }

    let newPending = ledger.pendingContainers;

    switch (type) {
      case 'DELIVERED':
        newPending += quantity;
        break;
      case 'RETURNED':
        newPending -= quantity;
        if (newPending < 0) {
          throw new AppError(400, `El cliente solo tiene ${ledger.pendingContainers} envases pendientes, no puede devolver ${quantity}`);
        }
        break;
      case 'CHARGED':
        newPending -= quantity;
        if (newPending < 0) {
          throw new AppError(400, `El cliente solo tiene ${ledger.pendingContainers} envases pendientes, no puede cobrar ${quantity}`);
        }
        if (!depositCharged || depositCharged <= 0) {
          throw new AppError(400, 'Debe especificar el monto del depósito cobrado');
        }
        break;
      case 'FORGIVEN':
        newPending -= quantity;
        if (newPending < 0) {
          throw new AppError(400, `El cliente solo tiene ${ledger.pendingContainers} envases pendientes, no puede condonar ${quantity}`);
        }
        break;
    }

    const ledgerId = ledger.id;

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.returnablesEvent.create({
        data: {
          ledgerId,
          type,
          quantity,
          orderId,
          depositCharged: depositCharged ? Math.round(depositCharged * 100) / 100 : null,
          notes,
        },
      });

      await tx.returnablesLedger.update({
        where: { id: ledgerId },
        data: { pendingContainers: newPending },
      });

      return event;
    });

    return prisma.returnablesEvent.findUnique({
      where: { id: result.id },
      include: {
        ledger: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
                code: true,
              },
            },
          },
        },
        order: {
          select: { id: true, code: true, deliveryDate: true },
        },
      },
    });
  }

  async getLedgers(query: GetReturnablesLedgersQueryDTO) {
    const { page = 1, limit = 20, customerId, hasPending } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (hasPending !== undefined) {
      where.pendingContainers = hasPending ? { gt: 0 } : { equals: 0 };
    }

    const [ledgers, total] = await Promise.all([
      prisma.returnablesLedger.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              firstName: true,
              lastName: true,
              businessName: true,
              tier: true,
              phone: true,
            },
          },
          _count: { select: { returnablesEvents: true } },
        },
        orderBy: { pendingContainers: 'desc' },
      }),
      prisma.returnablesLedger.count({ where }),
    ]);

    return {
      data: ledgers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getLedgerByCustomer(customerId: string) {
    let ledger = await prisma.returnablesLedger.findUnique({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            firstName: true,
            lastName: true,
            businessName: true,
            tier: true,
            phone: true,
          },
        },
        returnablesEvents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            order: { select: { id: true, code: true, deliveryDate: true } },
          },
        },
      },
    });

    if (!ledger) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new AppError(404, 'Cliente no encontrado');

      ledger = await prisma.returnablesLedger.create({
        data: { customerId, pendingContainers: 0 },
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              firstName: true,
              lastName: true,
              businessName: true,
              tier: true,
              phone: true,
            },
          },
          returnablesEvents: {
            include: {
              order: { select: { id: true, code: true, deliveryDate: true } },
            },
          },
        },
      });
    }

    return ledger;
  }

  async getEvents(query: GetReturnableEventsQueryDTO) {
    const { page = 1, limit = 20, customerId, type, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      const ledger = await prisma.returnablesLedger.findUnique({ where: { customerId } });
      if (ledger) {
        where.ledgerId = ledger.id;
      } else {
        return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
    }

    if (type) where.type = type;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [events, total] = await Promise.all([
      prisma.returnablesEvent.findMany({
        where,
        skip,
        take: limit,
        include: {
          ledger: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  businessName: true,
                  code: true,
                },
              },
            },
          },
          order: { select: { id: true, code: true, deliveryDate: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.returnablesEvent.count({ where }),
    ]);

    return {
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSummary() {
    const ledgers = await prisma.returnablesLedger.findMany({
      include: { returnablesEvents: true },
    });

    let totalPending = 0;
    let customersWithPending = 0;
    let totalDelivered = 0;
    let totalReturned = 0;
    let totalCharged = 0;
    let totalForgiven = 0;

    for (const ledger of ledgers) {
      totalPending += ledger.pendingContainers;
      if (ledger.pendingContainers > 0) customersWithPending++;

      for (const event of ledger.returnablesEvents) {
        switch (event.type) {
          case 'DELIVERED': totalDelivered += event.quantity; break;
          case 'RETURNED':  totalReturned  += event.quantity; break;
          case 'CHARGED':   totalCharged   += event.quantity; break;
          case 'FORGIVEN':  totalForgiven  += event.quantity; break;
        }
      }
    }

    const returnRate = totalDelivered > 0
      ? Math.round((totalReturned / totalDelivered) * 100 * 100) / 100
      : 0;

    return {
      totalCustomers: ledgers.length,
      customersWithPending,
      totalPending,
      totalDelivered,
      totalReturned,
      totalCharged,
      totalForgiven,
      returnRate,
    };
  }

  async adjustLedger(data: AdjustLedgerDTO, userId: string) {
    const { customerId, quantity, reason, notes } = data;

    let ledger = await prisma.returnablesLedger.findUnique({ where: { customerId } });

    if (!ledger) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new AppError(404, 'Cliente no encontrado');

      ledger = await prisma.returnablesLedger.create({
        data: { customerId, pendingContainers: 0 },
      });
    }

    const newPending = ledger.pendingContainers + quantity;
    if (newPending < 0) {
      throw new AppError(400, `El ajuste resultaría en un saldo negativo: ${newPending}`);
    }

    const eventType = quantity > 0 ? 'DELIVERED' : 'RETURNED';
    const absQuantity = Math.abs(quantity);
    const ledgerId = ledger.id;

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.returnablesEvent.create({
        data: {
          ledgerId,
          type: eventType,
          quantity: absQuantity,
          notes: `AJUSTE MANUAL: ${reason}${notes ? ' - ' + notes : ''}`,
        },
      });

      await tx.returnablesLedger.update({
        where: { id: ledgerId },
        data: { pendingContainers: newPending },
      });

      return event;
    });

    return result;
  }
}
