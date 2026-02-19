import apiClient from './client';

export const loyaltyApi = {
  getRules: async () => {
    const response = await apiClient.get('/loyalty/rules');
    return response.data;
  },

  createRule: async (data: {
    name: string;
    pointsPerAmountSpent: number;
    minPurchase?: number;
    tier?: string;
    isActive: boolean;
  }) => {
    const response = await apiClient.post('/loyalty/rules', data);
    return response.data;
  },

  getWallets: async (params?: { customerId?: string; search?: string }) => {
    const response = await apiClient.get('/loyalty/wallets', { params });
    return response.data;
  },

  getWallet: async (id: string) => {
    const response = await apiClient.get(`/loyalty/wallets/${id}`);
    return response.data;
  },

  getMovements: async (id: string) => {
    const response = await apiClient.get(`/loyalty/wallets/${id}/movements`);
    return response.data;
  },

  adjustPoints: async (id: string, data: { points: number; reason: string }) => {
    const response = await apiClient.post(`/loyalty/wallets/${id}/adjust`, data);
    return response.data;
  },

  redeem: async (data: {
    customerId: string;
    points: number;
    redemptionOptionId?: string;
    orderId?: string;
  }) => {
    const response = await apiClient.post('/loyalty/redeem', data);
    return response.data;
  },

  getRedemptions: async () => {
    const response = await apiClient.get('/loyalty/redemptions');
    return response.data;
  },
};
