import { PurchaseStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreatePurchaseDTO,
  UpdatePurchaseStatusDTO,
  ReceivePurchaseDTO,
  RegisterPaymentDTO,
  PurchasesQueryDTO,
} from './purchases.dto';

export class PurchasesService {
  // ==========================================
  // PURCHASES CRUD
  // ==========================================

  async getAll(query: PurchasesQueryDTO) {
    const {
      search,
      supplierId,
      branchId,
      status,
      fromDate,
      toDate,
      page = '1',
      limit = '20',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate) {
      where.purchaseDate = {
        ...where.purchaseDate,
        gte: new Date(fromDate),
      };
    }

    if (toDate) {
      where.purchaseDate = {
        ...where.purchaseDate,
        lte: new Date(toDate),
      };
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              businessName: true,
              code: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.purchase.count({ where }),
    ]);

    return {
      purchases,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getById(id: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            tradeName: true,
            code: true,
            phone: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                piecesPerBox: true,
                brand: { select: { name: true } },
                category: { select: { name: true } },
              },
            },
          },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new AppError(404, 'Purchase not found');
    }

    return purchase;
  }

  async create(data: CreatePurchaseDTO, userId: string) {
    const code = `PUR-${Date.now()}`;

    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    if (!supplier.isActive) {
      throw new AppError(400, 'Supplier is not active');
    }

    if (supplier.isBlocked) {
      throw new AppError(400, 'Supplier is blocked');
    }

    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch) {
      throw new AppError(404, 'Branch not found');
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const itemsData: Array<{
      productId: string;
      boxes: number;
      pieces: number;
      totalPieces: number;
      unitCost: number;
      subtotal: number;
    }> = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new AppError(404, `Product ${item.productId} not found`);
      }

      const piecesPerBox = product.piecesPerBox ?? 0;
      const totalPieces = item.boxes * piecesPerBox + item.pieces;
      const itemSubtotal = totalPieces * item.unitCost;
      subtotal += itemSubtotal;

      itemsData.push({
        productId: item.productId,
        boxes: item.boxes,
        pieces: item.pieces,
        totalPieces,
        unitCost: item.unitCost,
        subtotal: itemSubtotal,
      });
    }

    const total = subtotal + data.tax + data.shipping;
    const pendingAmount = total;

    const purchase = await prisma.purchase.create({
      data: {
        code,
        supplierId: data.supplierId,
        branchId: data.branchId,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        subtotal,
        tax: data.tax,
        shipping: data.shipping,
        total,
        paidAmount: 0,
        pendingAmount,
        notes: data.notes,
        internalNotes: data.internalNotes,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
        createdById: userId,
        items: {
          create: itemsData,
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: PurchaseStatus.PENDING,
            changedById: userId,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplier: true,
        branch: true,
      },
    });

    return purchase;
  }

  async updateStatus(id: string, data: UpdatePurchaseStatusDTO, userId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      throw new AppError(404, 'Purchase not found');
    }

    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new AppError(400, 'Cannot change status of cancelled purchase');
    }

    if (purchase.status === (data.status as PurchaseStatus)) {
      throw new AppError(400, 'Purchase is already in this status');
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: {
        status: data.status as PurchaseStatus,
        statusHistory: {
          create: {
            fromStatus: purchase.status,
            toStatus: data.status as PurchaseStatus,
            reason: data.reason,
            notes: data.notes,
            changedById: userId,
          },
        },
      },
      include: {
        items: true,
        supplier: true,
        branch: true,
      },
    });

    return updated;
  }

  async receive(id: string, data: ReceivePurchaseDTO, userId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!purchase) {
      throw new AppError(404, 'Purchase not found');
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new AppError(400, 'Only PENDING purchases can be received');
    }

    const receivedDate = data.receivedDate ? new Date(data.receivedDate) : new Date();

    await prisma.purchase.update({
      where: { id },
      data: {
        status: PurchaseStatus.RECEIVED,
        receivedDate,
        receivedById: userId,
        statusHistory: {
          create: {
            fromStatus: PurchaseStatus.PENDING,
            toStatus: PurchaseStatus.RECEIVED,
            notes: data.notes,
            changedById: userId,
          },
        },
      },
    });

    // Update inventory for each item
    for (const item of purchase.items) {
      let inventory = await prisma.inventory.findUnique({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId: purchase.branchId,
          },
        },
      });

      if (!inventory) {
        inventory = await prisma.inventory.create({
          data: {
            productId: item.productId,
            branchId: purchase.branchId,
            stockBoxes: 0,
            stockPieces: 0,
          },
        });
      }

      await prisma.$transaction([
        prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            stockBoxes: inventory.stockBoxes + item.boxes,
            stockPieces: inventory.stockPieces + item.pieces,
          },
        }),
        prisma.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            type: 'IN',
            boxesDelta: item.boxes,
            piecesDelta: item.pieces,
            reason: `Purchase received: ${purchase.code}`,
            referenceId: purchase.id,
            userId,
          },
        }),
      ]);
    }

    return this.getById(id);
  }

  async registerPayment(id: string, data: RegisterPaymentDTO, userId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      throw new AppError(404, 'Purchase not found');
    }

    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new AppError(400, 'Cannot register payment for cancelled purchase');
    }

    if (purchase.status !== PurchaseStatus.RECEIVED) {
      throw new AppError(400, 'Purchase must be RECEIVED before registering payment');
    }

    const newPaidAmount = Number(purchase.paidAmount) + data.amount;
    const newPendingAmount = Number(purchase.total) - newPaidAmount;

    if (newPaidAmount > Number(purchase.total)) {
      throw new AppError(400, 'Payment amount exceeds pending amount');
    }

    const newStatus = Math.abs(newPendingAmount) < 0.01 ? PurchaseStatus.PAID : PurchaseStatus.RECEIVED;

    const updated = await prisma.purchase.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        status: newStatus,
        statusHistory: newStatus !== purchase.status
          ? {
              create: {
                fromStatus: purchase.status,
                toStatus: newStatus,
                notes: data.notes || `Payment registered: $${data.amount}`,
                changedById: userId,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        supplier: true,
        branch: true,
      },
    });

    return updated;
  }

  async cancel(id: string, reason: string, userId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      throw new AppError(404, 'Purchase not found');
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new AppError(400, 'Only PENDING purchases can be cancelled');
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: {
        status: PurchaseStatus.CANCELLED,
        statusHistory: {
          create: {
            fromStatus: purchase.status,
            toStatus: PurchaseStatus.CANCELLED,
            reason,
            changedById: userId,
          },
        },
      },
      include: {
        items: true,
        supplier: true,
        branch: true,
      },
    });

    return updated;
  }

  // ==========================================
  // REPORTS
  // ==========================================

  async getBySupplier(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    return prisma.purchase.findMany({
      where: { supplierId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductHistory(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    return prisma.purchaseItem.findMany({
      where: { productId },
      include: {
        purchase: {
          include: {
            supplier: {
              select: {
                id: true,
                businessName: true,
                code: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
