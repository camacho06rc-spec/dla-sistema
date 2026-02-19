import apiClient from './client';
import { Product, PaginatedResponse, ApiResponse } from '@/types';

export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/catalog/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/catalog/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await apiClient.post<ApiResponse<Product>>('/catalog/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/catalog/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/catalog/products/${id}`);
    return response.data;
  },
};
