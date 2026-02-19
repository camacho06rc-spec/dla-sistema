import apiClient from './client';

export const cashRegisterApi = {
  getAll: async (params?: {
    branchId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/cash-register', { params });
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get('/cash-register/active');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/cash-register/${id}`);
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await apiClient.get(`/cash-register/${id}/stats`);
    return response.data;
  },

  open: async (data: { branchId: string; initialCash: number; notes?: string }) => {
    const response = await apiClient.post('/cash-register/open', data);
    return response.data;
  },

  close: async (id: string, data: { finalCash: number; notes?: string }) => {
    const response = await apiClient.post(`/cash-register/${id}/close`, data);
    return response.data;
  },

  getByBranch: async (branchId: string) => {
    const response = await apiClient.get(`/cash-register/branch/${branchId}`);
    return response.data;
  },
};
