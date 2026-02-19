import { OrderStatus, PurchaseStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  SalesReportDTO,
  TopProductsDTO,
  TopCustomersDTO,
  InventoryStatusDTO,
  ProfitMarginDTO,
  PurchasesSummaryDTO,
  DashboardDTO,
} from './reports.dto';

export class ReportsService {
  // Helper: Get date range
  private getDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    if (period === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (period === 'today') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
    } else {
      // Default to current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  // ==========================================
  // SALES REPORT
  // ==========================================

  async getSalesReport(query: SalesReportDTO) {
    const { period = 'month', startDate, endDate, branchId } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const where: any = {
      orderDate: {
        gte: start,
        lte: end,
      },
      status: {
        in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.IN_ROUTE, OrderStatus.DELIVERED],
      },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        orderDate: true,
        status: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const salesByDate: { [key: string]: { orders: number; revenue: number } } = {};
    orders.forEach(order => {
      const date = order.orderDate.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { orders: 0, revenue: 0 };
      }
      salesByDate[date].orders++;
      salesByDate[date].revenue += Number(order.total);
    });

    return {
      period: {
        start,
        end,
        label: period,
      },
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        deliveredOrders: deliveredOrders.length,
        deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
      },
      salesByDate: Object.entries(salesByDate).map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
      })),
    };
  }

  // ==========================================
  // TOP PRODUCTS
  // ==========================================

  async getTopProducts(query: TopProductsDTO) {
    const { period = 'month', startDate, endDate, limit = '10', orderBy = 'revenue' } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);
    const limitNum = parseInt(limit);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          orderDate: {
            gte: start,
            lte: end,
          },
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.IN_ROUTE, OrderStatus.DELIVERED],
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
    });

    const productStats: {
      [key: string]: {
        product: any;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
      };
    } = {};

    orderItems.forEach(item => {
      const productId = item.productId;
      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        };
      }
      productStats[productId].totalQuantity += item.quantity;
      productStats[productId].totalRevenue += Number(item.total);
      productStats[productId].orderCount++;
    });

    const sorted = Object.values(productStats).sort((a, b) => {
      if (orderBy === 'quantity') {
        return b.totalQuantity - a.totalQuantity;
      } else {
        return b.totalRevenue - a.totalRevenue;
      }
    });

    return {
      period: { start, end, label: period },
      orderBy,
      topProducts: sorted.slice(0, limitNum).map(stat => ({
        product: stat.product,
        totalQuantity: stat.totalQuantity,
        totalRevenue: Math.round(stat.totalRevenue * 100) / 100,
        orderCount: stat.orderCount,
        averagePrice: stat.totalQuantity > 0 ? Math.round((stat.totalRevenue / stat.totalQuantity) * 100) / 100 : 0,
      })),
    };
  }

  // ==========================================
  // TOP CUSTOMERS
  // ==========================================

  async getTopCustomers(query: TopCustomersDTO) {
    const { period = 'month', startDate, endDate, limit = '10', orderBy = 'total' } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);
    const limitNum = parseInt(limit);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: start,
          lte: end,
        },
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.IN_ROUTE, OrderStatus.DELIVERED],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            code: true,
            tier: true,
            type: true,
          },
        },
      },
    });

    const customerStats: {
      [key: string]: {
        customer: any;
        totalSpent: number;
        orderCount: number;
      };
    } = {};

    orders.forEach(order => {
      const customerId = order.customerId;
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          customer: order.customer,
          totalSpent: 0,
          orderCount: 0,
        };
      }
      customerStats[customerId].totalSpent += Number(order.total);
      customerStats[customerId].orderCount++;
    });

    const sorted = Object.values(customerStats).sort((a, b) => {
      if (orderBy === 'frequency') {
        return b.orderCount - a.orderCount;
      } else {
        return b.totalSpent - a.totalSpent;
      }
    });

    return {
      period: { start, end, label: period },
      orderBy,
      topCustomers: sorted.slice(0, limitNum).map(stat => ({
        customer: stat.customer,
        totalSpent: Math.round(stat.totalSpent * 100) / 100,
        orderCount: stat.orderCount,
        averageOrderValue: Math.round((stat.totalSpent / stat.orderCount) * 100) / 100,
      })),
    };
  }

  // ==========================================
  // INVENTORY STATUS
  // ==========================================

  async getInventoryStatus(query: InventoryStatusDTO) {
    const { branchId, categoryId, lowStockOnly } = query;

    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (categoryId) {
      where.product = {
        categoryId,
      };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            piecesPerBox: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
            stockRules: {
              select: { branchId: true, minBoxes: true, minPieces: true },
            },
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
    });

    const items = inventory.map(inv => {
      const piecesPerBox = inv.product.piecesPerBox || 0;
      const totalPieces = inv.stockBoxes * piecesPerBox + inv.stockPieces;
      const rule = inv.product.stockRules.find(r => r.branchId === inv.branchId);
      const minimumStock = rule ? rule.minBoxes * piecesPerBox + rule.minPieces : 0;
      const isLowStock = totalPieces <= minimumStock;
      const isOutOfStock = totalPieces === 0;

      return {
        product: inv.product,
        branch: inv.branch,
        boxes: inv.stockBoxes,
        pieces: inv.stockPieces,
        totalPieces,
        minimumStock,
        isLowStock,
        isOutOfStock,
      };
    });

    const filtered = lowStockOnly === 'true'
      ? items.filter(item => item.isLowStock || item.isOutOfStock)
      : items;

    const summary = {
      totalItems: filtered.length,
      lowStockItems: filtered.filter(i => i.isLowStock && !i.isOutOfStock).length,
      outOfStockItems: filtered.filter(i => i.isOutOfStock).length,
    };

    return {
      summary,
      items: filtered,
    };
  }

  // ==========================================
  // PROFIT MARGIN
  // ==========================================

  async getProfitMargin(query: ProfitMarginDTO) {
    const { period = 'month', startDate, endDate, productId, categoryId } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          orderDate: {
            gte: start,
            lte: end,
          },
          status: OrderStatus.DELIVERED,
        },
        ...(productId && { productId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            categoryId: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
      },
    });

    const filtered = categoryId
      ? orderItems.filter(item => item.product.categoryId === categoryId)
      : orderItems;

    const productIds = [...new Set(filtered.map(item => item.productId))];
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: {
        productId: { in: productIds },
        purchase: {
          status: PurchaseStatus.RECEIVED,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const latestPurchasePrice: { [key: string]: number } = {};
    purchaseItems.forEach(item => {
      if (!latestPurchasePrice[item.productId]) {
        latestPurchasePrice[item.productId] = Number(item.unitCost);
      }
    });

    const productMargins: {
      [key: string]: {
        product: any;
        totalSold: number;
        totalRevenue: number;
        totalCost: number;
        profit: number;
        marginPercentage: number;
      };
    } = {};

    filtered.forEach(item => {
      const pid = item.productId;
      const purchasePrice = latestPurchasePrice[pid] || 0;
      const revenue = Number(item.total);
      const cost = purchasePrice * item.quantity;

      if (!productMargins[pid]) {
        productMargins[pid] = {
          product: item.product,
          totalSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          profit: 0,
          marginPercentage: 0,
        };
      }

      productMargins[pid].totalSold += item.quantity;
      productMargins[pid].totalRevenue += revenue;
      productMargins[pid].totalCost += cost;
    });

    const results = Object.values(productMargins).map(margin => {
      margin.profit = margin.totalRevenue - margin.totalCost;
      margin.marginPercentage = margin.totalRevenue > 0
        ? (margin.profit / margin.totalRevenue) * 100
        : 0;

      return {
        ...margin,
        totalRevenue: Math.round(margin.totalRevenue * 100) / 100,
        totalCost: Math.round(margin.totalCost * 100) / 100,
        profit: Math.round(margin.profit * 100) / 100,
        marginPercentage: Math.round(margin.marginPercentage * 100) / 100,
      };
    });

    const totalRevenue = results.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalCost = results.reduce((sum, r) => sum + r.totalCost, 0);
    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      period: { start, end, label: period },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        marginPercentage: Math.round(overallMargin * 100) / 100,
      },
      products: results.sort((a, b) => b.profit - a.profit),
    };
  }

  // ==========================================
  // PURCHASES SUMMARY
  // ==========================================

  async getPurchasesSummary(query: PurchasesSummaryDTO) {
    const { period = 'month', startDate, endDate, supplierId } = query;
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const where: any = {
      purchaseDate: {
        gte: start,
        lte: end,
      },
    };

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            code: true,
          },
        },
      },
    });

    const supplierStats: {
      [key: string]: {
        supplier: any;
        totalPurchases: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
      };
    } = {};

    purchases.forEach(purchase => {
      const sid = purchase.supplierId;
      if (!supplierStats[sid]) {
        supplierStats[sid] = {
          supplier: purchase.supplier,
          totalPurchases: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
        };
      }
      supplierStats[sid].totalPurchases++;
      supplierStats[sid].totalAmount += Number(purchase.total);
      supplierStats[sid].paidAmount += Number(purchase.paidAmount);
      supplierStats[sid].pendingAmount += Number(purchase.pendingAmount);
    });

    const results = Object.values(supplierStats).map(stat => ({
      ...stat,
      totalAmount: Math.round(stat.totalAmount * 100) / 100,
      paidAmount: Math.round(stat.paidAmount * 100) / 100,
      pendingAmount: Math.round(stat.pendingAmount * 100) / 100,
    }));

    const totalPurchases = purchases.length;
    const totalAmount = results.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPaid = results.reduce((sum, r) => sum + r.paidAmount, 0);
    const totalPending = results.reduce((sum, r) => sum + r.pendingAmount, 0);

    return {
      period: { start, end, label: period },
      summary: {
        totalPurchases,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
      },
      bySupplier: results.sort((a, b) => b.totalAmount - a.totalAmount),
    };
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async getDashboard(query: DashboardDTO) {
    const { branchId } = query;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayOrders = await prisma.order.count({
      where: {
        orderDate: { gte: todayStart, lte: todayEnd },
        ...(branchId && { branchId }),
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.IN_ROUTE, OrderStatus.DELIVERED] },
      },
    });

    const todaySales = await prisma.order.aggregate({
      where: {
        orderDate: { gte: todayStart, lte: todayEnd },
        ...(branchId && { branchId }),
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.IN_ROUTE, OrderStatus.DELIVERED] },
      },
      _sum: { total: true },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        ...(branchId && { branchId }),
        status: { in: [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      },
    });

    const lowStock = await prisma.inventory.count({
      where: {
        ...(branchId && { branchId }),
        stockBoxes: { lte: 0 },
        stockPieces: { lte: 0 },
      },
    });

    const totalCustomers = await prisma.customer.count({
      where: { isActive: true },
    });

    const totalSuppliers = await prisma.supplier.count({
      where: { isActive: true },
    });

    const pendingPurchases = await prisma.purchase.count({
      where: {
        ...(branchId && { branchId }),
        status: PurchaseStatus.PENDING,
      },
    });

    return {
      date: new Date(),
      today: {
        orders: todayOrders,
        sales: Math.round(Number(todaySales._sum.total || 0) * 100) / 100,
      },
      pending: {
        orders: pendingOrders,
        purchases: pendingPurchases,
      },
      inventory: {
        lowStockItems: lowStock,
      },
      totals: {
        customers: totalCustomers,
        suppliers: totalSuppliers,
      },
    };
  }

  // ==========================================
  // LOW STOCK ALERT
  // ==========================================

  async getLowStockAlert(branchId?: string) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            piecesPerBox: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
            stockRules: {
              select: { branchId: true, minBoxes: true, minPieces: true },
            },
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
    });

    const alerts = inventory
      .map(inv => {
        const piecesPerBox = inv.product.piecesPerBox || 0;
        const totalPieces = inv.stockBoxes * piecesPerBox + inv.stockPieces;
        const rule = inv.product.stockRules.find(r => r.branchId === inv.branchId);
        const minimumStock = rule ? rule.minBoxes * piecesPerBox + rule.minPieces : 0;
        return {
          product: inv.product,
          branch: inv.branch,
          boxes: inv.stockBoxes,
          pieces: inv.stockPieces,
          totalPieces,
          minimumStock,
          shortage: minimumStock - totalPieces,
        };
      })
      .filter(item => item.totalPieces <= item.minimumStock)
      .sort((a, b) => a.totalPieces - b.totalPieces);

    return {
      total: alerts.length,
      outOfStock: alerts.filter(a => a.totalPieces === 0).length,
      lowStock: alerts.filter(a => a.totalPieces > 0).length,
      alerts,
    };
  }
}
