import apiClient from './client';
import { Order, PaginatedResponse, ApiResponse } from '@/types';

export const ordersApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  create: async (data: Partial<Order>) => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status, notes });
    return response.data;
  },
};
