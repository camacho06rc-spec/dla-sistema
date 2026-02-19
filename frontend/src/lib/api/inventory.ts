import apiClient from './client';

export const inventoryApi = {
  getAll: async (params?: { productId?: string; branchId?: string; lowStock?: boolean }) => {
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  },

  adjust: async (data: {
    productId: string;
    branchId: string;
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
    boxesDelta?: number;
    piecesDelta?: number;
    reason: string;
    referenceId?: string;
  }) => {
    const response = await apiClient.post('/inventory/adjust', data);
    return response.data;
  },

  openBox: async (data: { productId: string; branchId: string; quantity: number }) => {
    const response = await apiClient.post('/inventory/open-box', data);
    return response.data;
  },

  getStockRules: async () => {
    const response = await apiClient.get('/inventory/stock-rules');
    return response.data;
  },

  createStockRule: async (data: {
    productId: string;
    branchId: string;
    minBoxes: number;
    minPieces: number;
  }) => {
    const response = await apiClient.post('/inventory/stock-rules', data);
    return response.data;
  },

  updateStockRule: async (id: string, data: { minBoxes?: number; minPieces?: number }) => {
    const response = await apiClient.put(`/inventory/stock-rules/${id}`, data);
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiClient.get('/inventory/alerts');
    return response.data;
  },

  getMovements: async (productId: string, branchId: string) => {
    const response = await apiClient.get(`/inventory/${productId}/${branchId}/movements`);
    return response.data;
  },
};
