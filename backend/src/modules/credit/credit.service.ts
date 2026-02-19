import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreditMovementType } from '@prisma/client';

const round2 = (n: number) => Math.round(n * 100) / 100;

export class CreditService {
  async createCreditAccount(data: any, userId: string) {
    const { customerId, creditLimit, isActive } = data;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError(404, 'Cliente no encontrado');

    const existing = await prisma.creditAccount.findUnique({ where: { customerId } });
    if (existing) throw new AppError(400, 'El cliente ya tiene una cuenta de crédito');

    const limit = round2(creditLimit);

    const account = await prisma.creditAccount.create({
      data: {
        customerId,
        creditLimit: limit,
        availableCredit: limit,
        usedCredit: 0,
        isActive: isActive ?? true,
      },
      include: { customer: true },
    });

    return account;
  }

  async updateCreditLimit(customerId: string, data: any, userId: string) {
    const account = await prisma.creditAccount.findUnique({ where: { customerId } });
    if (!account) throw new AppError(404, 'Cuenta de crédito no encontrada');

    const newLimit = round2(data.creditLimit);
    const usedCredit = Number(account.usedCredit);

    if (newLimit < usedCredit) {
      throw new AppError(400, 'El nuevo límite no puede ser menor al crédito utilizado');
    }

    const availableCredit = round2(newLimit - usedCredit);

    const updated = await prisma.creditAccount.update({
      where: { customerId },
      data: {
        creditLimit: newLimit,
        availableCredit,
      },
      include: { customer: true },
    });

    return updated;
  }

  async registerPayment(data: any, userId: string) {
    const { customerId, amount, paymentMethod, reference, notes, paymentDate, applyToOrders } = data;

    const account = await prisma.creditAccount.findUnique({ where: { customerId } });
    if (!account) throw new AppError(404, 'Cuenta de crédito no encontrada');

    const paymentAmount = round2(amount);

    if (applyToOrders && applyToOrders.length > 0) {
      const orders = await prisma.order.findMany({ where: { id: { in: applyToOrders } } });
      if (orders.length !== applyToOrders.length) {
        throw new AppError(404, 'Uno o más pedidos no encontrados');
      }
    }

    const movement = await prisma.$transaction(async (tx) => {
      const paymentMovement = await tx.creditMovement.create({
        data: {
          creditAccountId: account.id,
          type: CreditMovementType.PAYMENT,
          amount: paymentAmount,
          paymentMethod,
          reference,
          notes,
          createdBy: userId,
          createdAt: paymentDate ? new Date(paymentDate) : undefined,
        },
      });

      if (applyToOrders && applyToOrders.length > 0) {
        const charges = await tx.creditMovement.findMany({
          where: {
            creditAccountId: account.id,
            type: CreditMovementType.CHARGE,
            orderId: { in: applyToOrders },
          },
        });

        for (const charge of charges) {
          await tx.creditMovement.create({
            data: {
              creditAccountId: account.id,
              type: CreditMovementType.RELEASE,
              amount: Number(charge.amount),
              orderId: charge.orderId,
              notes: `Liberación por pago`,
              createdBy: userId,
            },
          });
        }
      } else {
        // FIFO: apply to oldest CHARGE movements
        const charges = await tx.creditMovement.findMany({
          where: { creditAccountId: account.id, type: CreditMovementType.CHARGE },
          orderBy: { createdAt: 'asc' },
        });

        const orderIds = charges.map((c) => c.orderId).filter(Boolean) as string[];
        const existingReleases = await tx.creditMovement.findMany({
          where: {
            creditAccountId: account.id,
            type: CreditMovementType.RELEASE,
            orderId: { in: orderIds },
          },
        });

        const releasedByOrderId = new Map<string, number>();
        for (const r of existingReleases) {
          if (r.orderId) {
            releasedByOrderId.set(r.orderId, (releasedByOrderId.get(r.orderId) ?? 0) + Number(r.amount));
          }
        }

        let remaining = paymentAmount;
        for (const charge of charges) {
          if (remaining <= 0) break;

          const releasedAmount = charge.orderId ? (releasedByOrderId.get(charge.orderId) ?? 0) : 0;
          const pending = round2(Number(charge.amount) - releasedAmount);

          if (pending <= 0) continue;

          const toRelease = round2(Math.min(remaining, pending));
          await tx.creditMovement.create({
            data: {
              creditAccountId: account.id,
              type: CreditMovementType.RELEASE,
              amount: toRelease,
              orderId: charge.orderId,
              notes: `Liberación automática FIFO`,
              createdBy: userId,
            },
          });
          remaining = round2(remaining - toRelease);
        }
      }

      const { usedCredit, availableCredit } = await this.recalculateBalances(tx, account.id, Number(account.creditLimit));

      await tx.creditAccount.update({
        where: { id: account.id },
        data: { usedCredit, availableCredit },
      });

      return tx.creditMovement.findUnique({
        where: { id: paymentMovement.id },
        include: {
          creditAccount: { include: { customer: true } },
          order: true,
        },
      });
    });

    return movement;
  }

  async getCreditAccounts(query: any) {
    const { page, limit, customerId, isActive, hasDebt } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (isActive !== undefined) where.isActive = isActive;
    if (hasDebt) where.usedCredit = { gt: 0 };

    const [accounts, total] = await Promise.all([
      prisma.creditAccount.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          _count: { select: { creditMovements: true } },
        },
        orderBy: { usedCredit: 'desc' },
      }),
      prisma.creditAccount.count({ where }),
    ]);

    return {
      data: accounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAccountByCustomer(customerId: string) {
    const account = await prisma.creditAccount.findUnique({
      where: { customerId },
      include: {
        customer: true,
        creditMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!account) throw new AppError(404, 'Cuenta de crédito no encontrada');

    const pendingOrders = await this.getPendingOrders(customerId);

    return { ...account, pendingOrders };
  }

  async getCreditMovements(query: any) {
    const { page, limit, customerId, type, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      const account = await prisma.creditAccount.findUnique({ where: { customerId } });
      if (!account) throw new AppError(404, 'Cuenta de crédito no encontrada');
      where.creditAccountId = account.id;
    }

    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [movements, total] = await Promise.all([
      prisma.creditMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          creditAccount: { include: { customer: true } },
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.creditMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOverdueAccounts(query: any) {
    const { page, limit, term } = query;
    const now = new Date();

    const where: any = {
      type: CreditMovementType.CHARGE,
      dueDate: { lte: now },
    };
    if (term) where.term = term;

    const overdueCharges = await prisma.creditMovement.findMany({
      where,
      include: {
        creditAccount: { include: { customer: true } },
        order: true,
      },
    });

    // Fetch all releases for these charges in one query
    const chargeOrderIds = overdueCharges.map((c) => c.orderId).filter(Boolean) as string[];
    const creditAccountIds = [...new Set(overdueCharges.map((c) => c.creditAccountId))];

    const allReleases = await prisma.creditMovement.findMany({
      where: {
        creditAccountId: { in: creditAccountIds },
        type: CreditMovementType.RELEASE,
        orderId: { in: chargeOrderIds },
      },
    });

    // Group releases by creditAccountId + orderId
    const releaseMap = new Map<string, number>();
    for (const r of allReleases) {
      const key = `${r.creditAccountId}:${r.orderId}`;
      releaseMap.set(key, (releaseMap.get(key) ?? 0) + Number(r.amount));
    }

    // Group by customer and calculate pending per charge
    const customerMap = new Map<string, any>();

    for (const charge of overdueCharges) {
      const key = `${charge.creditAccountId}:${charge.orderId}`;
      const releasedAmount = releaseMap.get(key) ?? 0;
      const pendingAmount = round2(Number(charge.amount) - releasedAmount);

      if (pendingAmount <= 0) continue;

      const daysOverdue = Math.floor((now.getTime() - (charge.dueDate as Date).getTime()) / (1000 * 60 * 60 * 24));
      const customerId = charge.creditAccount.customerId;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer: charge.creditAccount.customer,
          creditAccountId: charge.creditAccountId,
          totalOverdue: 0,
          charges: [],
        });
      }

      const entry = customerMap.get(customerId);
      entry.totalOverdue = round2(entry.totalOverdue + pendingAmount);
      entry.charges.push({
        orderId: charge.orderId,
        chargedAmount: round2(Number(charge.amount)),
        paidAmount: round2(releasedAmount),
        pendingAmount,
        dueDate: charge.dueDate,
        term: charge.term,
        daysOverdue,
      });
    }

    const results = Array.from(customerMap.values())
      .sort((a, b) => b.totalOverdue - a.totalOverdue);

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPortfolioSummary() {
    const accounts = await prisma.creditAccount.findMany({
      where: { isActive: true },
      include: { creditMovements: true },
    });

    const now = new Date();
    let totalCreditLimit = 0;
    let totalUsedCredit = 0;
    let totalAvailableCredit = 0;
    let accountsWithDebt = 0;
    let accountsOverdue = 0;

    for (const account of accounts) {
      const creditLimit = Number(account.creditLimit);
      const usedCredit = Number(account.usedCredit);
      const availableCredit = Number(account.availableCredit);

      totalCreditLimit += creditLimit;
      totalUsedCredit += usedCredit;
      totalAvailableCredit += availableCredit;

      if (usedCredit > 0) accountsWithDebt++;

      // Group releases by orderId for this account
      const releasesByOrderId = new Map<string, number>();
      for (const m of account.creditMovements) {
        if (m.type === CreditMovementType.RELEASE && m.orderId) {
          releasesByOrderId.set(m.orderId, (releasesByOrderId.get(m.orderId) ?? 0) + Number(m.amount));
        }
      }

      // Account is overdue if it has a CHARGE past due date with outstanding balance
      const hasOverdue = account.creditMovements.some((m) => {
        if (m.type !== CreditMovementType.CHARGE || !m.dueDate || m.dueDate > now) return false;
        const released = m.orderId ? (releasesByOrderId.get(m.orderId) ?? 0) : 0;
        return round2(Number(m.amount) - released) > 0;
      });
      if (hasOverdue) accountsOverdue++;
    }

    const utilizationRate = totalCreditLimit > 0
      ? round2((totalUsedCredit / totalCreditLimit) * 100)
      : 0;

    return {
      totalCreditLimit: round2(totalCreditLimit),
      totalUsedCredit: round2(totalUsedCredit),
      totalAvailableCredit: round2(totalAvailableCredit),
      accountsWithDebt,
      accountsOverdue,
      utilizationRate,
    };
  }

  async creditAdjustment(data: any, userId: string) {
    const { customerId, amount, reason, notes } = data;

    const account = await prisma.creditAccount.findUnique({ where: { customerId } });
    if (!account) throw new AppError(404, 'Cuenta de crédito no encontrada');

    const movement = await prisma.$transaction(async (tx) => {
      const adjustmentMovement = await tx.creditMovement.create({
        data: {
          creditAccountId: account.id,
          type: CreditMovementType.ADJUSTMENT,
          amount,
          notes: notes ? `${reason}: ${notes}` : reason,
          createdBy: userId,
        },
      });

      const { usedCredit, availableCredit } = await this.recalculateBalances(tx, account.id, Number(account.creditLimit));

      await tx.creditAccount.update({
        where: { id: account.id },
        data: { usedCredit, availableCredit },
      });

      return adjustmentMovement;
    });

    return movement;
  }

  private async recalculateBalances(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    accountId: string,
    creditLimit: number,
  ) {
    const allMovements = await tx.creditMovement.findMany({
      where: { creditAccountId: accountId },
    });

    let usedCredit = 0;
    for (const m of allMovements) {
      const amt = Number(m.amount);
      if (m.type === CreditMovementType.RESERVE || m.type === CreditMovementType.CHARGE) {
        usedCredit += amt;
      } else if (m.type === CreditMovementType.RELEASE || m.type === CreditMovementType.PAYMENT) {
        usedCredit -= amt;
      } else if (m.type === CreditMovementType.ADJUSTMENT) {
        usedCredit += amt;
      }
    }

    usedCredit = round2(Math.max(0, usedCredit));
    const availableCredit = round2(creditLimit - usedCredit);
    return { usedCredit, availableCredit };
  }

  private async getPendingOrders(customerId: string) {
    const account = await prisma.creditAccount.findUnique({ where: { customerId } });
    if (!account) return [];

    const charges = await prisma.creditMovement.findMany({
      where: {
        creditAccountId: account.id,
        type: CreditMovementType.CHARGE,
        orderId: { not: null },
      },
      include: { order: true },
    });

    const orderIds = charges.map((c) => c.orderId).filter(Boolean) as string[];
    const releases = await prisma.creditMovement.findMany({
      where: {
        creditAccountId: account.id,
        type: CreditMovementType.RELEASE,
        orderId: { in: orderIds },
      },
    });

    const releasedByOrderId = new Map<string, number>();
    for (const r of releases) {
      if (r.orderId) {
        releasedByOrderId.set(r.orderId, (releasedByOrderId.get(r.orderId) ?? 0) + Number(r.amount));
      }
    }

    const results = [];
    for (const charge of charges) {
      const paidAmount = round2(charge.orderId ? (releasedByOrderId.get(charge.orderId) ?? 0) : 0);
      const chargedAmount = round2(Number(charge.amount));
      const pendingAmount = round2(chargedAmount - paidAmount);

      if (pendingAmount > 0) {
        results.push({
          orderId: charge.orderId,
          order: charge.order,
          chargedAmount,
          paidAmount,
          pendingAmount,
          dueDate: charge.dueDate,
          term: charge.term,
        });
      }
    }

    return results;
  }
}

