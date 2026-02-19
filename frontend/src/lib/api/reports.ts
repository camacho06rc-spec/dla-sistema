import apiClient from './client';

export const reportsApi = {
  getSalesByPeriod: async (params?: { days?: number; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/reports/sales-by-period', { params });
    return response.data;
  },

  getTopProducts: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/reports/top-products', { params });
    return response.data;
  },

  getSalesByCategory: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/reports/sales-by-category', { params });
    return response.data;
  },

  getCustomersByTier: async () => {
    const response = await apiClient.get('/reports/customers-by-tier');
    return response.data;
  },

  getSales: async (params?: {
    startDate?: string;
    endDate?: string;
    branchId?: string;
    customerId?: string;
    productId?: string;
  }) => {
    const response = await apiClient.get('/reports/sales', { params });
    return response.data;
  },

  getInventory: async (params?: { branchId?: string; categoryId?: string }) => {
    const response = await apiClient.get('/reports/inventory', { params });
    return response.data;
  },

  getCustomers: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/reports/customers', { params });
    return response.data;
  },
};
