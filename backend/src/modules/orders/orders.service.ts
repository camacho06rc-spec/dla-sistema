import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { OrderStatus, InventoryMovementType, OrderSource, DeliveryType, OrderUnit, CustomerTier } from '@prisma/client';

export class OrdersService {
  async findAll(query: any) {
    const { page = 1, limit = 20, customerId, branchId, status, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (customerId) where.customerId = customerId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
              tier: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          address: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  piecesPerBox: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
        address: true,
        orderItems: {
          include: {
            product: true
          }
        },
        orderStatusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedByUser: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new AppError(404, 'Pedido no encontrado');
    }

    return order;
  }

  async create(data: any, userId: string) {
    const { customerId, branchId, deliveryAddressId, items, notes, deliveryDate } = data;

    // 1. Verificar cliente
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    if (!customer.isActive) {
      throw new AppError(400, 'Cliente inactivo');
    }

    if (customer.isBlocked) {
      throw new AppError(400, 'Cliente bloqueado');
    }

    // 2. Verificar sucursal
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      throw new AppError(404, 'Sucursal no encontrada');
    }

    // 3. Verificar dirección si se proporciona
    if (deliveryAddressId) {
      const address = await prisma.address.findUnique({
        where: { id: deliveryAddressId }
      });

      if (!address || address.customerId !== customerId) {
        throw new AppError(404, 'Dirección de entrega no válida');
      }
    }

    // 4. Procesar items y calcular totales
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      unit: OrderUnit;
      unitPrice: number;
      subtotal: number;
      discount: number;
      total: number;
      pointsGranted: number;
    }> = [];
    let subtotal = 0;
    let totalContainersRequired = 0;
    let totalDepositCharged = 0;

    for (const item of items) {
      // Obtener producto con precios
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          productPrices: true
        }
      });

      if (!product) {
        throw new AppError(404, `Producto ${item.productId} no encontrado`);
      }

      if (!product.isActive) {
        throw new AppError(400, `Producto ${product.name} está inactivo`);
      }

      // Obtener precio según tier del cliente
      const priceRecord = product.productPrices;
      if (!priceRecord) {
        throw new AppError(400, `No hay precio configurado para ${product.name}`);
      }

      // Seleccionar precio según tier
      let pricePerPiece: number;
      switch (customer.tier) {
        case CustomerTier.EVENTUAL:
          pricePerPiece = Number(priceRecord.priceEventual);
          break;
        case CustomerTier.FRECUENTE:
          pricePerPiece = Number(priceRecord.priceFrecuente);
          break;
        case CustomerTier.VIP:
          pricePerPiece = Number(priceRecord.priceVip);
          break;
        default:
          pricePerPiece = Number(priceRecord.priceEventual);
      }

      // Verificar stock disponible
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_branchId: {
            productId: product.id,
            branchId
          }
        }
      });

      if (!inventory) {
        throw new AppError(400, `No hay inventario de ${product.name} en esta sucursal`);
      }

      // Validar stock suficiente (considerando total de piezas disponibles)
      const piecesPerBox = product.piecesPerBox || 1;
      const requestedTotalPieces = (item.boxes * piecesPerBox) + item.pieces;
      const availableTotalPieces = (inventory.stockBoxes * piecesPerBox) + inventory.stockPieces;
      
      if (availableTotalPieces < requestedTotalPieces) {
        throw new AppError(400, `Stock insuficiente de ${product.name}. Piezas solicitadas: ${requestedTotalPieces}, disponibles: ${availableTotalPieces}`);
      }
      
      // Validar que hay suficientes cajas completas si se solicitan cajas
      if (item.boxes > 0 && inventory.stockBoxes < item.boxes) {
        // Verificar si podemos cubrir con piezas sueltas
        const piecesNeeded = (item.boxes - inventory.stockBoxes) * piecesPerBox;
        if (inventory.stockPieces < piecesNeeded) {
          throw new AppError(400, `Stock insuficiente de ${product.name}. Cajas solicitadas: ${item.boxes}, disponibles: ${inventory.stockBoxes}`);
        }
      }

      // Calcular cantidad total en piezas
      const totalPieces = requestedTotalPieces;

      // Calcular depósito de retornables si aplica
      let itemContainersRequired = 0;
      let itemDepositCharged = 0;
      if (product.isReturnable && product.depositPerContainer) {
        // Calcular containers basado en total de piezas
        itemContainersRequired = Math.ceil(totalPieces / piecesPerBox);
        itemDepositCharged = itemContainersRequired * Number(product.depositPerContainer);
      }

      totalContainersRequired += itemContainersRequired;
      totalDepositCharged += itemDepositCharged;

      // Crear items para cajas (si hay)
      if (item.boxes > 0) {
        const boxSubtotal = item.boxes * piecesPerBox * pricePerPiece;
        subtotal += boxSubtotal;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.boxes,
          unit: OrderUnit.BOX,
          unitPrice: piecesPerBox * pricePerPiece,
          subtotal: boxSubtotal,
          discount: 0,
          total: boxSubtotal,
          pointsGranted: 0
        });
      }

      // Crear items para piezas (si hay)
      if (item.pieces > 0) {
        const pieceSubtotal = item.pieces * pricePerPiece;
        subtotal += pieceSubtotal;
        
        orderItemsData.push({
          productId: product.id,
          quantity: item.pieces,
          unit: OrderUnit.PIECE,
          unitPrice: pricePerPiece,
          subtotal: pieceSubtotal,
          discount: 0,
          total: pieceSubtotal,
          pointsGranted: 0
        });
      }
    }

    const totalAmount = subtotal + totalDepositCharged;

    // 5. Generar código de pedido
    const orderCount = await prisma.order.count();
    const orderCode = `ORD-${Date.now()}-${orderCount + 1}`;

    // 6. Crear pedido con items en transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear pedido
      const newOrder = await tx.order.create({
        data: {
          code: orderCode,
          customerId,
          branchId,
          addressId: deliveryAddressId,
          source: OrderSource.POS,
          deliveryType: deliveryAddressId ? DeliveryType.DELIVERY : DeliveryType.PICKUP,
          status: OrderStatus.CREATED,
          subtotal,
          discount: 0,
          total: totalAmount,
          containersRequired: totalContainersRequired,
          containersReturned: 0,
          depositCharged: totalDepositCharged,
          notes,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          createdBy: userId,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      // Registrar en historial de estados
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: OrderStatus.CREATED,
          toStatus: OrderStatus.CREATED,
          notes: 'Pedido creado',
          changedBy: userId
        }
      });

      return newOrder;
    });

    return order;
  }

  async updateStatus(id: string, data: any, userId: string) {
    const { status, notes } = data;

    const order = await this.findById(id);

    // Validar transición de estado
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      CREATED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.IN_ROUTE, OrderStatus.CANCELLED],
      IN_ROUTE: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      DELIVERED: [],
      CANCELLED: []
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new AppError(400, `No se puede cambiar de ${order.status} a ${status}`);
    }

    // Si se confirma, descontar inventario
    if (status === OrderStatus.CONFIRMED && order.status === OrderStatus.CREATED) {
      await this.discountInventory(order, userId);
    }

    // Si se cancela desde CONFIRMED, devolver inventario
    if (status === OrderStatus.CANCELLED && order.status === OrderStatus.CONFIRMED) {
      await this.returnInventory(order, userId);
    }

    // Actualizar estado
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: status,
          notes: notes || `Estado cambiado a ${status}`,
          changedBy: userId
        }
      });

      return updated;
    });

    return updatedOrder;
  }

  private async discountInventory(order: any, userId: string) {
    // Group items by product to calculate total boxes/pieces per product
    const productMap = new Map<string, { boxes: number; pieces: number; piecesPerBox: number }>();

    for (const item of order.orderItems) {
      const key = item.productId;
      const existing = productMap.get(key) || { boxes: 0, pieces: 0, piecesPerBox: item.product.piecesPerBox || 1 };
      
      if (item.unit === OrderUnit.BOX) {
        existing.boxes += item.quantity;
      } else {
        existing.pieces += item.quantity;
      }
      
      productMap.set(key, existing);
    }

    // Process all products in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const [productId, totals] of productMap.entries()) {
        const inventory = await tx.inventory.findUnique({
          where: {
            productId_branchId: {
              productId,
              branchId: order.branchId
            }
          }
        });

        if (!inventory) {
          const product = order.orderItems.find((i: any) => i.productId === productId)?.product;
          throw new AppError(500, `Error: No se encontró inventario para ${product?.name || productId}`);
        }

        // Validar stock nuevamente
        if (inventory.stockBoxes < totals.boxes || inventory.stockPieces < totals.pieces) {
          const product = order.orderItems.find((i: any) => i.productId === productId)?.product;
          throw new AppError(400, `Stock insuficiente de ${product?.name || productId}`);
        }

        // Descontar inventario
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stockBoxes: inventory.stockBoxes - totals.boxes,
            stockPieces: inventory.stockPieces - totals.pieces
          }
        });
        
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            type: InventoryMovementType.SALE,
            boxesDelta: -totals.boxes,
            piecesDelta: -totals.pieces,
            reason: `Venta - Pedido ${order.code}`,
            referenceId: order.id,
            userId
          }
        });
      }
    });
  }

  private async returnInventory(order: any, userId: string) {
    // Group items by product to calculate total boxes/pieces per product
    const productMap = new Map<string, { boxes: number; pieces: number; piecesPerBox: number }>();

    for (const item of order.orderItems) {
      const key = item.productId;
      const existing = productMap.get(key) || { boxes: 0, pieces: 0, piecesPerBox: item.product.piecesPerBox || 1 };
      
      if (item.unit === OrderUnit.BOX) {
        existing.boxes += item.quantity;
      } else {
        existing.pieces += item.quantity;
      }
      
      productMap.set(key, existing);
    }

    // Process all products in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const [productId, totals] of productMap.entries()) {
        const inventory = await tx.inventory.findUnique({
          where: {
            productId_branchId: {
              productId,
              branchId: order.branchId
            }
          }
        });

        if (!inventory) {
          const product = order.orderItems.find((i: any) => i.productId === productId)?.product;
          throw new AppError(500, `Error: No se encontró inventario para ${product?.name || productId} durante la devolución`);
        }

        // Devolver inventario
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            stockBoxes: inventory.stockBoxes + totals.boxes,
            stockPieces: inventory.stockPieces + totals.pieces
          }
        });
        
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            type: InventoryMovementType.RETURN,
            boxesDelta: totals.boxes,
            piecesDelta: totals.pieces,
            reason: `Devolución - Pedido ${order.code} cancelado`,
            referenceId: order.id,
            userId
          }
        });
      }
    });
  }
}
