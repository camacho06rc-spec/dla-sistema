import apiClient from './client';

export const collectionsApi = {
  getPending: async (params?: { customerId?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/collections/pending', { params });
    return response.data;
  },

  getAccounts: async (params?: { customerId?: string; status?: string }) => {
    const response = await apiClient.get('/collections/accounts', { params });
    return response.data;
  },

  getPayments: async (params?: { customerId?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/collections/payments', { params });
    return response.data;
  },

  recordPayment: async (data: {
    customerId: string;
    accountId: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    reference?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/collections/payments', data);
    return response.data;
  },

  verifyPayment: async (id: string, data: { verified: boolean; notes?: string }) => {
    const response = await apiClient.patch(`/collections/payments/${id}/verify`, data);
    return response.data;
  },

  getCustomerBalance: async (customerId: string) => {
    const response = await apiClient.get(`/collections/customer/${customerId}/balance`);
    return response.data;
  },
};
