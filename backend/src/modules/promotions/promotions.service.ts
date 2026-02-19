import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { Prisma, PromotionType } from '@prisma/client';
import {
  CreatePromotionDTO,
  UpdatePromotionDTO,
  GetPromotionsQueryDTO,
  ValidatePromotionDTO,
} from './promotions.dto';

export class PromotionsService {
  private buildRulesFromData(data: Partial<CreatePromotionDTO>): Record<string, unknown> {
    const rules: Record<string, unknown> = {};
    if (data.discountPercentage !== undefined) rules.discountPercentage = data.discountPercentage;
    if (data.discountAmount !== undefined) rules.discountAmount = data.discountAmount;
    if (data.minPurchaseAmount !== undefined) rules.minPurchaseAmount = data.minPurchaseAmount;
    if (data.maxDiscountAmount !== undefined) rules.maxDiscountAmount = data.maxDiscountAmount;
    if (data.applicableToTiers) rules.applicableToTiers = data.applicableToTiers;
    if (data.applicableProductIds) rules.applicableProductIds = data.applicableProductIds;
    if (data.applicableCategoryIds) rules.applicableCategoryIds = data.applicableCategoryIds;
    if (data.buyQuantity !== undefined) rules.buyQuantity = data.buyQuantity;
    if (data.getQuantity !== undefined) rules.getQuantity = data.getQuantity;
    if (data.maxUsesPerCustomer !== undefined) rules.maxUsesPerCustomer = data.maxUsesPerCustomer;
    if (data.maxTotalUses !== undefined) rules.maxTotalUses = data.maxTotalUses;
    return rules;
  }

  async create(data: CreatePromotionDTO, userId: string) {
    if (data.code) {
      const existing = await prisma.promotion.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new AppError(400, `El código '${data.code}' ya está en uso`);
      }
    }

    if (data.type === PromotionType.PERCENTAGE_OFF && !data.discountPercentage) {
      throw new AppError(400, 'discountPercentage es requerido para tipo PERCENTAGE_OFF');
    }

    if (data.type === PromotionType.MIX_MATCH && (!data.buyQuantity || !data.getQuantity)) {
      throw new AppError(400, 'buyQuantity y getQuantity son requeridos para tipo MIX_MATCH');
    }

    const rules = this.buildRulesFromData(data);

    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        code: data.code,
        rules: rules as Prisma.InputJsonValue,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        isActive: data.isActive,
      },
    });

    return promotion;
  }

  async update(id: string, data: Partial<UpdatePromotionDTO>, _userId: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new AppError(404, 'Promoción no encontrada');
    }

    if (data.code && data.code !== promotion.code) {
      const existing = await prisma.promotion.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new AppError(400, `El código '${data.code}' ya está en uso`);
      }
    }

    const existingRules: Record<string, unknown> = ((promotion.rules as Record<string, unknown>) || {});
    const newRules = this.buildRulesFromData(data);
    const updatedRules = { ...existingRules, ...newRules };

    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        code: data.code,
        rules: updatedRules as Prisma.InputJsonValue,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  async findAll(query: GetPromotionsQueryDTO) {
    const { page = 1, limit = 20, type, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promotion.count({ where }),
    ]);

    return {
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new AppError(404, 'Promoción no encontrada');
    }

    return promotion;
  }

  async getActivePromotions() {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return promotions;
  }

  async validatePromotion(data: ValidatePromotionDTO) {
    let promotion;

    if (data.promotionId) {
      promotion = await prisma.promotion.findUnique({
        where: { id: data.promotionId },
      });
    } else if (data.code) {
      promotion = await prisma.promotion.findUnique({
        where: { code: data.code },
      });
    }

    if (!promotion) {
      return {
        isValid: false,
        message: 'Promoción no encontrada',
      };
    }

    if (!promotion.isActive) {
      return {
        isValid: false,
        message: 'Promoción inactiva',
      };
    }

    const now = new Date();
    if (now < promotion.validFrom || now > promotion.validTo) {
      return {
        isValid: false,
        message: 'Promoción fuera de vigencia',
      };
    }

    const rules = (promotion.rules as Record<string, unknown>) || {};

    if (rules.applicableToTiers && (rules.applicableToTiers as string[]).length > 0) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer || !(rules.applicableToTiers as string[]).includes(customer.tier)) {
        return {
          isValid: false,
          message: `Promoción solo aplica para clientes: ${(rules.applicableToTiers as string[]).join(', ')}`,
        };
      }
    }

    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    if (rules.minPurchaseAmount && subtotal < (rules.minPurchaseAmount as number)) {
      return {
        isValid: false,
        message: `Compra mínima requerida: $${(rules.minPurchaseAmount as number).toFixed(2)}`,
      };
    }

    if (rules.applicableProductIds && (rules.applicableProductIds as string[]).length > 0) {
      const hasApplicableProduct = data.items.some(item =>
        (rules.applicableProductIds as string[]).includes(item.productId)
      );

      if (!hasApplicableProduct) {
        return {
          isValid: false,
          message: 'No hay productos aplicables para esta promoción',
        };
      }
    }

    if (rules.applicableCategoryIds && (rules.applicableCategoryIds as string[]).length > 0) {
      const productIds = data.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true },
      });

      const hasApplicableCategory = products.some(product =>
        (rules.applicableCategoryIds as string[]).includes(product.categoryId)
      );

      if (!hasApplicableCategory) {
        return {
          isValid: false,
          message: 'No hay productos de categorías aplicables',
        };
      }
    }

    if (rules.maxUsesPerCustomer) {
      const usageCount = await prisma.order.count({
        where: {
          customerId: data.customerId,
          promotionId: promotion.id,
        },
      });

      if (usageCount >= (rules.maxUsesPerCustomer as number)) {
        return {
          isValid: false,
          message: `Límite de usos por cliente alcanzado (${rules.maxUsesPerCustomer})`,
        };
      }
    }

    if (rules.maxTotalUses) {
      const totalUsage = await prisma.order.count({
        where: { promotionId: promotion.id },
      });

      if (totalUsage >= (rules.maxTotalUses as number)) {
        return {
          isValid: false,
          message: 'Promoción agotada',
        };
      }
    }

    let discount = 0;

    switch (promotion.type) {
      case PromotionType.PERCENTAGE_OFF:
        discount = subtotal * ((rules.discountPercentage as number) / 100);
        if (rules.maxDiscountAmount && discount > (rules.maxDiscountAmount as number)) {
          discount = rules.maxDiscountAmount as number;
        }
        break;

      case PromotionType.DISCOUNT_EXPIRY:
      case PromotionType.FLASH_SALE:
        if (rules.discountAmount) {
          discount = rules.discountAmount as number;
        } else if (rules.discountPercentage) {
          discount = subtotal * ((rules.discountPercentage as number) / 100);
          if (rules.maxDiscountAmount && discount > (rules.maxDiscountAmount as number)) {
            discount = rules.maxDiscountAmount as number;
          }
        }
        break;

      case PromotionType.MIX_MATCH:
        if (rules.buyQuantity && rules.getQuantity) {
          const buyQty = rules.buyQuantity as number;
          const getQty = rules.getQuantity as number;
          const freePerSet = Math.max(0, getQty - buyQty);
          if (freePerSet > 0) {
            const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
            const sets = Math.floor(totalItems / buyQty);
            const freeItems = sets * freePerSet;
            if (freeItems > 0) {
              const avgPrice = subtotal / totalItems;
              discount = avgPrice * freeItems;
            }
          }
        }
        break;
    }

    discount = Math.round(discount * 100) / 100;

    return {
      isValid: true,
      message: 'Promoción válida',
      promotion: {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        estimatedDiscount: discount,
      },
    };
  }

  async delete(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new AppError(404, 'Promoción no encontrada');
    }

    const ordersCount = await prisma.order.count({
      where: { promotionId: id },
    });

    if (ordersCount > 0) {
      throw new AppError(400, `No se puede eliminar. Hay ${ordersCount} pedidos con esta promoción`);
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return { message: 'Promoción eliminada exitosamente' };
  }

  async getStats(promotionId: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new AppError(404, 'Promoción no encontrada');
    }

    const orders = await prisma.order.findMany({
      where: { promotionId },
      select: {
        id: true,
        total: true,
        discount: true,
        createdAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalDiscount = orders.reduce((sum, order) => sum + Number(order.discount || 0), 0);

    return {
      promotion: {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
      },
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        averageDiscount: totalOrders > 0 ? Math.round((totalDiscount / totalOrders) * 100) / 100 : 0,
      },
    };
  }
}
