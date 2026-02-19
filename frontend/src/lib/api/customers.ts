import apiClient from './client';
import { Customer, PaginatedResponse, ApiResponse } from '@/types';

export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Customer>>>('/customers', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Customer>) => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Customer>) => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },
};
