export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  brandId: string;
  piecesPerBox: number;
  isActive: boolean;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  prices?: {
    priceEventual: number;
    priceFrecuente: number;
    priceVip: number;
  };
}

export interface Customer {
  id: string;
  code: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tier: 'EVENTUAL' | 'FRECUENTE' | 'VIP';
  type: 'B2B' | 'EVENT';
  isActive: boolean;
  isBlocked: boolean;
  creditLimit: number;
  creditDays: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: 'CREATED' | 'CONFIRMED' | 'PREPARING' | 'IN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  total: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
