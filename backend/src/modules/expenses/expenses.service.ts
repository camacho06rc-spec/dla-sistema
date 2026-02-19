import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

const round2 = (n: number) => Math.round(n * 100) / 100;

export class ExpensesService {
  async createExpense(data: any, userId: string) {
    const { branchId, categoryId, amount, description, receiptUrl, expenseDate } = data;

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new AppError(404, 'Sucursal no encontrada');

    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError(404, 'Categoría no encontrada');

    const expense = await prisma.expense.create({
      data: {
        branchId,
        categoryId,
        amount: round2(amount),
        description,
        receiptUrl,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        recordedBy: userId,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        category: true,
        recordedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return expense;
  }

  async updateExpense(id: string, data: any) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Gasto no encontrado');

    if (data.categoryId) {
      const category = await prisma.expenseCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new AppError(404, 'Categoría no encontrada');
    }

    const updateData: any = { ...data };
    if (data.amount !== undefined) updateData.amount = round2(data.amount);
    if (data.expenseDate) updateData.expenseDate = new Date(data.expenseDate);

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        category: true,
        recordedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return expense;
  }

  async deleteExpense(id: string) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Gasto no encontrado');

    await prisma.expense.delete({ where: { id } });
    return { id };
  }

  async getExpenses(query: any) {
    const { page = 1, limit = 20, branchId, categoryId, fromDate, toDate, minAmount, maxAmount } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (categoryId) where.categoryId = categoryId;

    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate.gte = new Date(fromDate);
      if (toDate) where.expenseDate.lte = new Date(toDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          branch: { select: { id: true, name: true, code: true } },
          category: true,
          recordedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExpenseById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        category: true,
        recordedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!expense) throw new AppError(404, 'Gasto no encontrado');
    return expense;
  }

  async getExpensesByBranch(branchId: string, fromDate?: string, toDate?: string) {
    const where: any = { branchId };
    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate.gte = new Date(fromDate);
      if (toDate) where.expenseDate.lte = new Date(toDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        category: true,
        recordedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return expenses;
  }

  async getExpensesByCategory(fromDate?: string, toDate?: string) {
    const where: any = {};
    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate.gte = new Date(fromDate);
      if (toDate) where.expenseDate.lte = new Date(toDate);
    }

    const groups = await prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    // Fetch category names
    const categoryIds = groups.map((g) => g.categoryId);
    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return groups.map((g) => ({
      category: categoryMap[g.categoryId] ?? { id: g.categoryId, name: 'Unknown' },
      count: g._count,
      total: Number(g._sum.amount ?? 0),
    }));
  }

  async getTotalExpenses(branchId?: string, fromDate?: string, toDate?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate.gte = new Date(fromDate);
      if (toDate) where.expenseDate.lte = new Date(toDate);
    }

    const result = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: Number(result._sum.amount ?? 0),
      count: result._count,
    };
  }
}
