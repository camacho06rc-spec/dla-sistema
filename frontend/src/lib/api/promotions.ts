import apiClient from './client';

export const promotionsApi = {
  getAll: async (params?: { type?: string; isActive?: boolean }) => {
    const response = await apiClient.get('/promotions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/promotions/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    type: string;
    discountValue?: number;
    minPurchaseAmount?: number;
    validFrom: string;
    validTo: string;
    maxUses?: number;
    maxUsesPerCustomer?: number;
    applicableProductIds?: string[];
  }) => {
    const response = await apiClient.post('/promotions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    type: string;
    discountValue: number;
    minPurchaseAmount: number;
    validFrom: string;
    validTo: string;
    maxUses: number;
    maxUsesPerCustomer: number;
    applicableProductIds: string[];
  }>) => {
    const response = await apiClient.put(`/promotions/${id}`, data);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await apiClient.patch(`/promotions/${id}/toggle`);
    return response.data;
  },

  getStatistics: async (id: string) => {
    const response = await apiClient.get(`/promotions/${id}/statistics`);
    return response.data;
  },

  validate: async (code: string, orderId: string) => {
    const response = await apiClient.post('/promotions/validate', { code, orderId });
    return response.data;
  },
};
