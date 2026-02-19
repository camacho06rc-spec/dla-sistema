import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { PaymentMethod } from '@prisma/client';

export class CashRegisterService {
  async openSession(data: any, userId: string) {
    const { branchId, initialCash, notes } = data;

    // Verify branch exists
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new AppError(404, 'Sucursal no encontrada');

    // Verify no open session for this user
    const existing = await prisma.cashRegisterSession.findFirst({
      where: { userId, closedAt: null },
    });
    if (existing) throw new AppError(400, 'El usuario ya tiene una sesión de caja abierta');

    const session = await prisma.cashRegisterSession.create({
      data: {
        branchId,
        userId,
        initialCash,
        notes,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return session;
  }

  async closeSession(sessionId: string, data: any, userId: string) {
    const { finalCash, notes } = data;

    const session = await prisma.cashRegisterSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new AppError(404, 'Sesión de caja no encontrada');
    if (session.closedAt) throw new AppError(400, 'La sesión ya está cerrada');
    if (session.userId !== userId) throw new AppError(403, 'Solo el usuario que abrió la sesión puede cerrarla');

    // Calculate expectedCash: initial cash + cash payments from orders in this branch during the session
    const cashPayments = await prisma.payment.aggregate({
      where: {
        method: PaymentMethod.CASH,
        status: 'VERIFIED',
        order: {
          branchId: session.branchId,
          createdAt: {
            gte: session.openedAt,
          },
        },
      },
      _sum: { amount: true },
    });

    const cashIn = Number(cashPayments._sum.amount ?? 0);
    const expectedCash = Math.round((Number(session.initialCash) + cashIn) * 100) / 100;
    const difference = Math.round((finalCash - expectedCash) * 100) / 100;

    const updated = await prisma.cashRegisterSession.update({
      where: { id: sessionId },
      data: {
        closedAt: new Date(),
        finalCash,
        expectedCash,
        difference,
        notes: notes ?? session.notes,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return updated;
  }

  async getSessions(query: any) {
    const { page = 1, limit = 20, branchId, userId, isOpen, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (userId) where.userId = userId;
    if (isOpen === true) where.closedAt = null;
    if (isOpen === false) where.closedAt = { not: null };

    if (fromDate || toDate) {
      where.openedAt = {};
      if (fromDate) where.openedAt.gte = new Date(fromDate);
      if (toDate) where.openedAt.lte = new Date(toDate);
    }

    const [sessions, total] = await Promise.all([
      prisma.cashRegisterSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { openedAt: 'desc' },
        include: {
          branch: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.cashRegisterSession.count({ where }),
    ]);

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSessionById(id: string) {
    const session = await prisma.cashRegisterSession.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!session) throw new AppError(404, 'Sesión de caja no encontrada');
    return session;
  }

  async getActiveSession(userId: string) {
    const session = await prisma.cashRegisterSession.findFirst({
      where: { userId, closedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return session;
  }

  async getSessionsByBranch(branchId: string, fromDate?: string, toDate?: string) {
    const where: any = { branchId };
    if (fromDate || toDate) {
      where.openedAt = {};
      if (fromDate) where.openedAt.gte = new Date(fromDate);
      if (toDate) where.openedAt.lte = new Date(toDate);
    }

    const sessions = await prisma.cashRegisterSession.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return sessions;
  }

  async getSessionStats(sessionId: string) {
    const session = await prisma.cashRegisterSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError(404, 'Sesión de caja no encontrada');

    const endDate = session.closedAt ?? new Date();

    const [cashPayments, transferPayments, totalOrders] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          method: PaymentMethod.CASH,
          status: 'VERIFIED',
          order: {
            branchId: session.branchId,
            createdAt: { gte: session.openedAt, lte: endDate },
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          method: PaymentMethod.TRANSFER,
          status: 'VERIFIED',
          order: {
            branchId: session.branchId,
            createdAt: { gte: session.openedAt, lte: endDate },
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.count({
        where: {
          branchId: session.branchId,
          createdAt: { gte: session.openedAt, lte: endDate },
        },
      }),
    ]);

    return {
      session,
      stats: {
        totalOrders,
        cashPayments: {
          count: cashPayments._count,
          amount: Number(cashPayments._sum.amount ?? 0),
        },
        transferPayments: {
          count: transferPayments._count,
          amount: Number(transferPayments._sum.amount ?? 0),
        },
        totalCollected:
          Number(cashPayments._sum.amount ?? 0) + Number(transferPayments._sum.amount ?? 0),
      },
    };
  }
}
