import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { LoyaltyMovementType } from '@prisma/client';
import {
  CreateLoyaltyRuleDTO,
  UpdateLoyaltyRuleDTO,
  GetLoyaltyRulesQueryDTO,
  RedeemPointsDTO,
  AdjustPointsDTO,
  GetLoyaltyMovementsQueryDTO,
} from './loyalty.dto';

export class LoyaltyService {
  // ==========================================
  // LOYALTY RULES
  // ==========================================

  async createRule(data: CreateLoyaltyRuleDTO, _userId: string) {
    const rule = await prisma.loyaltyRule.create({
      data: {
        name: data.name,
        description: data.description,
        spendAmount: Math.round(data.spendAmount * 100) / 100,
        pointsEarned: data.pointsEarned,
        pointsRequired: data.pointsRequired,
        rewardValue: data.rewardValue != null ? Math.round(data.rewardValue * 100) / 100 : null,
        expirationDays: data.expirationDays,
        isActive: data.isActive,
      },
    });

    return rule;
  }

  async updateRule(id: string, data: UpdateLoyaltyRuleDTO, _userId: string) {
    const rule = await prisma.loyaltyRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new AppError(404, 'Regla de lealtad no encontrada');
    }

    const updated = await prisma.loyaltyRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        spendAmount: data.spendAmount != null ? Math.round(data.spendAmount * 100) / 100 : undefined,
        pointsEarned: data.pointsEarned,
        pointsRequired: data.pointsRequired,
        rewardValue: data.rewardValue != null ? Math.round(data.rewardValue * 100) / 100 : undefined,
        expirationDays: data.expirationDays,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  async getRules(query: GetLoyaltyRulesQueryDTO) {
    const { page = 1, limit = 20, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [rules, total] = await Promise.all([
      prisma.loyaltyRule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loyaltyRule.count({ where }),
    ]);

    return {
      data: rules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRuleById(id: string) {
    const rule = await prisma.loyaltyRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new AppError(404, 'Regla de lealtad no encontrada');
    }

    return rule;
  }

  async deleteRule(id: string) {
    const rule = await prisma.loyaltyRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new AppError(404, 'Regla de lealtad no encontrada');
    }

    await prisma.loyaltyRule.delete({
      where: { id },
    });

    return { message: 'Regla eliminada exitosamente' };
  }

  // ==========================================
  // LOYALTY WALLETS
  // ==========================================

  async getOrCreateWallet(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    let wallet = await prisma.loyaltyWallet.findUnique({
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
          },
        },
        loyaltyMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            order: {
              select: {
                id: true,
                code: true,
                total: true,
              },
            },
          },
        },
      },
    });

    if (!wallet) {
      await prisma.loyaltyWallet.create({
        data: {
          customerId,
          totalPoints: 0,
          availablePoints: 0,
          usedPoints: 0,
          expiredPoints: 0,
        },
      });

      wallet = await prisma.loyaltyWallet.findUnique({
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
            },
          },
          loyaltyMovements: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              order: {
                select: {
                  id: true,
                  code: true,
                  total: true,
                },
              },
            },
          },
        },
      });
    }

    if (!wallet) {
      throw new AppError(500, 'Error al crear wallet de lealtad');
    }

    return wallet;
  }

  async getWalletByCustomer(customerId: string) {
    return this.getOrCreateWallet(customerId);
  }

  // ==========================================
  // EARN POINTS
  // ==========================================

  async earnPoints(customerId: string, orderTotal: number, orderId: string) {
    const rule = await prisma.loyaltyRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!rule || rule.spendAmount == null || rule.pointsEarned == null || rule.expirationDays == null) {
      return null;
    }

    const pointsEarned = Math.floor((orderTotal / Number(rule.spendAmount)) * rule.pointsEarned);

    if (pointsEarned <= 0) {
      return null;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + rule.expirationDays);

    const wallet = await this.getOrCreateWallet(customerId);

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.loyaltyMovement.create({
        data: {
          walletId: wallet.id,
          type: LoyaltyMovementType.EARNED,
          points: pointsEarned,
          orderId,
          expiresAt,
          notes: `Ganados por compra de $${orderTotal.toFixed(2)}`,
        },
      });

      await tx.loyaltyWallet.update({
        where: { id: wallet.id },
        data: {
          totalPoints: wallet.totalPoints + pointsEarned,
          availablePoints: wallet.availablePoints + pointsEarned,
        },
      });

      return movement;
    });

    return result;
  }

  // ==========================================
  // REDEEM POINTS
  // ==========================================

  async redeemPoints(data: RedeemPointsDTO, _userId: string) {
    const wallet = await this.getOrCreateWallet(data.customerId);

    if (wallet.availablePoints < data.points) {
      throw new AppError(400, `Puntos insuficientes. Disponibles: ${wallet.availablePoints}`);
    }

    let rewardValue = 0;
    if (data.ruleId) {
      const rule = await prisma.loyaltyRule.findUnique({
        where: { id: data.ruleId },
      });

      if (!rule || !rule.isActive) {
        throw new AppError(400, 'Regla de canje no válida');
      }

      if (rule.pointsRequired != null && data.points < rule.pointsRequired) {
        throw new AppError(400, `Se requieren al menos ${rule.pointsRequired} puntos para este canje`);
      }

      rewardValue = Number(rule.rewardValue ?? 0);
    }

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.loyaltyMovement.create({
        data: {
          walletId: wallet.id,
          type: LoyaltyMovementType.REDEEMED,
          points: data.points,
          notes: data.notes ?? `Canjeados por descuento de $${rewardValue.toFixed(2)}`,
        },
      });

      await tx.loyaltyWallet.update({
        where: { id: wallet.id },
        data: {
          availablePoints: wallet.availablePoints - data.points,
          usedPoints: wallet.usedPoints + data.points,
        },
      });

      return movement;
    });

    return {
      movement: result,
      rewardValue,
    };
  }

  // ==========================================
  // ADJUST POINTS
  // ==========================================

  async adjustPoints(data: AdjustPointsDTO, _userId: string) {
    const wallet = await this.getOrCreateWallet(data.customerId);

    if (data.points < 0 && wallet.availablePoints < Math.abs(data.points)) {
      throw new AppError(400, `Puntos insuficientes. Disponibles: ${wallet.availablePoints}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.loyaltyMovement.create({
        data: {
          walletId: wallet.id,
          type: LoyaltyMovementType.ADJUSTED,
          points: Math.abs(data.points),
          notes: `AJUSTE MANUAL: ${data.reason}${data.notes ? ' - ' + data.notes : ''}`,
        },
      });

      await tx.loyaltyWallet.update({
        where: { id: wallet.id },
        data: {
          totalPoints: wallet.totalPoints + data.points,
          availablePoints: wallet.availablePoints + data.points,
        },
      });

      return movement;
    });

    return result;
  }

  // ==========================================
  // EXPIRE POINTS
  // ==========================================

  async expirePoints() {
    const now = new Date();

    const expiredMovements = await prisma.loyaltyMovement.findMany({
      where: {
        type: LoyaltyMovementType.EARNED,
        expiresAt: { lte: now },
      },
      include: {
        wallet: true,
      },
    });

    let totalExpired = 0;

    for (const movement of expiredMovements) {
      await prisma.$transaction(async (tx) => {
        await tx.loyaltyMovement.create({
          data: {
            walletId: movement.walletId,
            type: LoyaltyMovementType.EXPIRED,
            points: movement.points,
            notes: `Expirados del movimiento ${movement.id}`,
          },
        });

        const wallet = movement.wallet;
        await tx.loyaltyWallet.update({
          where: { id: wallet.id },
          data: {
            availablePoints: wallet.availablePoints - movement.points,
            expiredPoints: wallet.expiredPoints + movement.points,
          },
        });

        await tx.loyaltyMovement.update({
          where: { id: movement.id },
          data: { expiresAt: null },
        });
      });

      totalExpired += movement.points;
    }

    return {
      expiredMovements: expiredMovements.length,
      totalPointsExpired: totalExpired,
    };
  }

  // ==========================================
  // GET MOVEMENTS
  // ==========================================

  async getMovements(query: GetLoyaltyMovementsQueryDTO) {
    const { page = 1, limit = 20, customerId, type, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (customerId) {
      const wallet = await prisma.loyaltyWallet.findUnique({
        where: { customerId },
      });
      if (wallet) {
        where.walletId = wallet.id;
      } else {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
    }

    if (type) where.type = type;

    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {};
      if (fromDate) createdAt.gte = new Date(fromDate);
      if (toDate) createdAt.lte = new Date(toDate);
      where.createdAt = createdAt;
    }

    const [movements, total] = await Promise.all([
      prisma.loyaltyMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          wallet: {
            include: {
              customer: {
                select: {
                  id: true,
                  code: true,
                  firstName: true,
                  lastName: true,
                  businessName: true,
                },
              },
            },
          },
          order: {
            select: {
              id: true,
              code: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loyaltyMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // GET STATS
  // ==========================================

  async getStats() {
    const [totalCustomers, aggregate] = await Promise.all([
      prisma.loyaltyWallet.count(),
      prisma.loyaltyWallet.aggregate({
        _sum: {
          totalPoints: true,
          availablePoints: true,
          usedPoints: true,
          expiredPoints: true,
        },
      }),
    ]);

    const totalPointsIssued = aggregate._sum.totalPoints ?? 0;
    const totalPointsAvailable = aggregate._sum.availablePoints ?? 0;
    const totalPointsRedeemed = aggregate._sum.usedPoints ?? 0;
    const totalPointsExpired = aggregate._sum.expiredPoints ?? 0;

    const redemptionRate = totalPointsIssued > 0
      ? Math.round((totalPointsRedeemed / totalPointsIssued) * 100 * 100) / 100
      : 0;

    return {
      totalCustomers,
      totalPointsIssued,
      totalPointsAvailable,
      totalPointsRedeemed,
      totalPointsExpired,
      redemptionRate,
    };
  }

  // ==========================================
  // TOP CUSTOMERS BY POINTS
  // ==========================================

  async getTopCustomers(limit: number = 10) {
    const wallets = await prisma.loyaltyWallet.findMany({
      take: limit,
      orderBy: { availablePoints: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            firstName: true,
            lastName: true,
            businessName: true,
            tier: true,
          },
        },
      },
    });

    return wallets;
  }
}
