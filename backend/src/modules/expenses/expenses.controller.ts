import { Request, Response, NextFunction } from 'express';
import { ExpensesService } from './expenses.service';
import { createExpenseSchema, updateExpenseSchema, getExpensesQuerySchema } from './expenses.dto';
import { successResponse } from '../../utils/response';

const service = new ExpensesService();

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createExpenseSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const expense = await service.createExpense(data, userId);
    res.status(201).json(successResponse(expense, 'Gasto creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getExpensesQuerySchema.parse(req.query);
    const result = await service.getExpenses(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getExpensesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    const result = await service.getExpensesByCategory(fromDate, toDate);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getTotalExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, fromDate, toDate } = req.query as {
      branchId?: string;
      fromDate?: string;
      toDate?: string;
    };
    const result = await service.getTotalExpenses(branchId, fromDate, toDate);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getExpensesByBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.params;
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    const expenses = await service.getExpensesByBranch(branchId, fromDate, toDate);
    res.json(successResponse(expenses));
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await service.getExpenseById(req.params.id);
    res.json(successResponse(expense));
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateExpenseSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const expense = await service.updateExpense(req.params.id, data);
    res.json(successResponse(expense, 'Gasto actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteExpense(req.params.id);
    res.json(successResponse(result, 'Gasto eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
};
