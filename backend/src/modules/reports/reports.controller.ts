import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import {
  salesReportSchema,
  topProductsSchema,
  topCustomersSchema,
  inventoryStatusSchema,
  profitMarginSchema,
  purchasesSummarySchema,
  dashboardSchema,
} from './reports.dto';
import { successResponse } from '../../utils/response';

const service = new ReportsService();

export const getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = salesReportSchema.parse(req.query);
    const report = await service.getSalesReport(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = topProductsSchema.parse(req.query);
    const report = await service.getTopProducts(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getTopCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = topCustomersSchema.parse(req.query);
    const report = await service.getTopCustomers(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getInventoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = inventoryStatusSchema.parse(req.query);
    const report = await service.getInventoryStatus(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getProfitMargin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = profitMarginSchema.parse(req.query);
    const report = await service.getProfitMargin(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getPurchasesSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = purchasesSummarySchema.parse(req.query);
    const report = await service.getPurchasesSummary(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = dashboardSchema.parse(req.query);
    const report = await service.getDashboard(query);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.query;
    const report = await service.getLowStockAlert(branchId as string | undefined);
    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getSalesByPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days, startDate, endDate } = req.query as Record<string, string | undefined>;
    const data = await service.getSalesByPeriod({ days, startDate, endDate });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

export const getSalesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as Record<string, string | undefined>;
    const data = await service.getSalesByCategory({ startDate, endDate });
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

export const getCustomersByTier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCustomersByTier();
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};
