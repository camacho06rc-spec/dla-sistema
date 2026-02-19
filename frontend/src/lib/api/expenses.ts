import apiClient from './client';

export const expensesApi = {
  getAll: async (params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    branchId?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: {
    branchId: string;
    category: string;
    amount: number;
    description: string;
    receiptUrl?: string;
    expenseDate: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{
    category: string;
    amount: number;
    description: string;
    receiptUrl: string;
    expenseDate: string;
    notes: string;
  }>) => {
    const response = await apiClient.patch(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  getByCategory: async (params?: { startDate?: string; endDate?: string; branchId?: string }) => {
    const response = await apiClient.get('/expenses/by-category', { params });
    return response.data;
  },

  getTotal: async (params?: { startDate?: string; endDate?: string; branchId?: string }) => {
    const response = await apiClient.get('/expenses/total', { params });
    return response.data;
  },

  getByBranch: async (branchId: string, params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get(`/expenses/branch/${branchId}`, { params });
    return response.data;
  },
};
