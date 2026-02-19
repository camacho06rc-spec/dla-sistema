import apiClient from './client';

export const deliveriesApi = {
  getAll: async (params?: { driverId?: string; status?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/deliveries', { params });
    return response.data;
  },

  getRoutes: async (params?: { branchId?: string; date?: string }) => {
    const response = await apiClient.get('/deliveries/routes', { params });
    return response.data;
  },

  createRoute: async (data: {
    name: string;
    branchId: string;
    routeDate: string;
    driverId?: string;
    vehicle?: string;
  }) => {
    const response = await apiClient.post('/deliveries/routes', data);
    return response.data;
  },

  getRoute: async (id: string) => {
    const response = await apiClient.get(`/deliveries/routes/${id}`);
    return response.data;
  },

  assignOrders: async (routeId: string, data: { orderIds: string[] }) => {
    const response = await apiClient.post(`/deliveries/routes/${routeId}/orders`, data);
    return response.data;
  },

  getDrivers: async () => {
    const response = await apiClient.get('/deliveries/drivers');
    return response.data;
  },

  updateDeliveryStatus: async (id: string, data: { status: string; notes?: string }) => {
    const response = await apiClient.patch(`/deliveries/${id}/status`, data);
    return response.data;
  },
};
