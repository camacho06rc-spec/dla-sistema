import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import categoryRoutes from './modules/categories/categories.routes';
import brandRoutes from './modules/brands/brands.routes';
import productRoutes from './modules/products/products.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import customersRoutes from './modules/customers/customers.routes';
import ordersRoutes from './modules/orders/orders.routes';
import suppliersRoutes from './modules/suppliers/suppliers.routes';
import purchasesRoutes from './modules/purchases/purchases.routes';
import reportsRoutes from './modules/reports/reports.routes';
import deliveriesRoutes from './modules/deliveries/deliveries.routes';
import creditRoutes from './modules/credit/credit.routes';
import returnablesRoutes from './modules/returnables/returnables.routes';
import promotionsRoutes from './modules/promotions/promotions.routes';
import loyaltyRoutes from './modules/loyalty/loyalty.routes';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/suppliers', suppliersRoutes);
  app.use('/api/purchases', purchasesRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/deliveries', deliveriesRoutes);
  app.use('/api/credit', creditRoutes);
  app.use('/api/returnables', returnablesRoutes);
  app.use('/api/promotions', promotionsRoutes);
  app.use('/api/loyalty', loyaltyRoutes);

  // Error handling
  app.use(errorMiddleware);

  return app;
}
