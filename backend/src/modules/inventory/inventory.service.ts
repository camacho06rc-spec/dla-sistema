import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { InventoryMovementType } from '@prisma/client';

export class InventoryService {
  async findAll(query: any) {
    const { page = 1, limit = 20, productId, branchId, lowStock } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (branchId) where.branchId = branchId;

    let inventoryData = await prisma.inventory.findMany({
      where,
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            piecesPerBox: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } }
      ]
    });

    // Filtrar por stock bajo si se solicita
    if (lowStock) {
      inventoryData = await this.filterLowStock(inventoryData);
    }

    const total = await prisma.inventory.count({ where });

    return {
      data: inventoryData.map(inv => ({
        ...inv,
        totalPiecesInStock: (inv.stockBoxes * (inv.product.piecesPerBox || 0)) + inv.stockPieces
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getByProductAndBranch(productId: string, branchId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_branchId: { productId, branchId }
      },
      include: {
        product: true,
        branch: true
      }
    });

    if (!inventory) {
      throw new AppError(404, 'Inventario no encontrado');
    }

    return {
      ...inventory,
      totalPiecesInStock: (inventory.stockBoxes * (inventory.product.piecesPerBox || 0)) + inventory.stockPieces
    };
  }

  async adjust(data: any, userId: string) {
    const { productId, branchId, type, boxesDelta, piecesDelta, reason, referenceId } = data;

    // Verificar producto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      throw new AppError(404, 'Producto no encontrado');
    }

    // Verificar sucursal
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!branch) {
      throw new AppError(404, 'Sucursal no encontrada');
    }

    // Obtener o crear inventario
    let inventory = await prisma.inventory.findUnique({
      where: { productId_branchId: { productId, branchId } }
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          branchId,
          stockBoxes: 0,
          stockPieces: 0
        }
      });
    }

    // Calcular nuevo stock
    const newStockBoxes = inventory.stockBoxes + boxesDelta;
    const newStockPieces = inventory.stockPieces + piecesDelta;

    // Validar que no quede negativo
    if (newStockBoxes < 0 || newStockPieces < 0) {
      throw new AppError(400, 'Stock insuficiente para realizar el movimiento');
    }

    // Actualizar inventario y registrar movimiento en una transacción
    const result = await prisma.$transaction([
      prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          stockBoxes: newStockBoxes,
          stockPieces: newStockPieces
        }
      }),
      prisma.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type,
          boxesDelta,
          piecesDelta,
          reason,
          referenceId,
          userId
        }
      })
    ]);

    // Verificar stock mínimo
    await this.checkStockRules(productId, branchId);

    return result[0];
  }

  async openBox(data: any, userId: string) {
    const { productId, branchId, boxes } = data;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado');
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId_branchId: { productId, branchId } }
    });

    if (!inventory || inventory.stockBoxes < boxes) {
      throw new AppError(400, `No hay suficientes cajas. Disponibles: ${inventory?.stockBoxes || 0}`);
    }

    if (!product.piecesPerBox) {
      throw new AppError(400, 'El producto no tiene configurado piezas por caja');
    }

    // Abrir cajas: quitar cajas, agregar piezas
    const piecesToAdd = boxes * product.piecesPerBox;

    const result = await prisma.$transaction([
      prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          stockBoxes: inventory.stockBoxes - boxes,
          stockPieces: inventory.stockPieces + piecesToAdd
        }
      }),
      prisma.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: InventoryMovementType.ADJUSTMENT,
          boxesDelta: -boxes,
          piecesDelta: piecesToAdd,
          reason: `Apertura de ${boxes} caja(s)`,
          userId
        }
      })
    ]);

    return result[0];
  }

  async getMovements(productId: string, branchId: string, query: any) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const inventory = await prisma.inventory.findUnique({
      where: { productId_branchId: { productId, branchId } }
    });

    if (!inventory) {
      throw new AppError(404, 'Inventario no encontrado');
    }

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: { inventoryId: inventory.id },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryMovement.count({
        where: { inventoryId: inventory.id }
      })
    ]);

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createStockRule(data: any) {
    const { productId, branchId, minBoxes, minPieces } = data;

    // Verificar si ya existe
    const existing = await prisma.stockRule.findUnique({
      where: { productId_branchId: { productId, branchId } }
    });

    if (existing) {
      throw new AppError(409, 'Ya existe una regla de stock para este producto en esta sucursal');
    }

    const rule = await prisma.stockRule.create({
      data: {
        productId,
        branchId,
        minBoxes,
        minPieces,
        isActive: true
      }
    });

    // Verificar inmediatamente
    await this.checkStockRules(productId, branchId);

    return rule;
  }

  async updateStockRule(productId: string, branchId: string, data: any) {
    const rule = await prisma.stockRule.findUnique({
      where: { productId_branchId: { productId, branchId } }
    });

    if (!rule) {
      throw new AppError(404, 'Regla de stock no encontrada');
    }

    const updated = await prisma.stockRule.update({
      where: { id: rule.id },
      data
    });

    // Verificar con las nuevas reglas
    await this.checkStockRules(productId, branchId);

    return updated;
  }

  async getStockAlerts(query: any) {
    const { page = 1, limit = 20, isSent } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isSent !== undefined) {
      where.isSent = isSent;
    }

    const [alerts, total] = await Promise.all([
      prisma.stockAlert.findMany({
        where,
        skip,
        take: limit,
        include: {
          stockRule: {
            include: {
              product: true,
              branch: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockAlert.count({ where })
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private async checkStockRules(productId: string, branchId: string) {
    const rule = await prisma.stockRule.findUnique({
      where: { 
        productId_branchId: { productId, branchId },
        isActive: true
      }
    });

    if (!rule) return;

    const inventory = await prisma.inventory.findUnique({
      where: { productId_branchId: { productId, branchId } },
      include: { product: true, branch: true }
    });

    if (!inventory) return;

    const isBelowMin = inventory.stockBoxes < rule.minBoxes || inventory.stockPieces < rule.minPieces;

    if (isBelowMin) {
      // Crear alerta si no existe una reciente (últimas 24 horas)
      const recentAlert = await prisma.stockAlert.findFirst({
        where: {
          stockRuleId: rule.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!recentAlert) {
        await prisma.stockAlert.create({
          data: {
            stockRuleId: rule.id,
            message: `Stock bajo: ${inventory.product.name} en ${inventory.branch.name}. Stock actual: ${inventory.stockBoxes} cajas, ${inventory.stockPieces} piezas. Mínimo: ${rule.minBoxes} cajas, ${rule.minPieces} piezas`,
            isSent: false
          }
        });
      }
    }
  }

  private async filterLowStock(inventoryData: any[]) {
    const filtered = [];
    
    for (const inv of inventoryData) {
      const rule = await prisma.stockRule.findUnique({
        where: {
          productId_branchId: {
            productId: inv.productId,
            branchId: inv.branchId
          },
          isActive: true
        }
      });

      if (rule) {
        const isBelowMin = inv.stockBoxes < rule.minBoxes || inv.stockPieces < rule.minPieces;
        if (isBelowMin) {
          filtered.push(inv);
        }
      }
    }

    return filtered;
  }
}
