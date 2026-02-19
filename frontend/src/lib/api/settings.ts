import apiClient from './client';

export const settingsApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: string;
    branchId?: string;
  }) => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    branchId: string;
  }>) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  toggleUserActive: async (id: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/toggle`);
    return response.data;
  },

  getRoles: async () => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },

  createRole: async (data: { name: string; description?: string; permissionIds?: string[] }) => {
    const response = await apiClient.post('/admin/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: { name?: string; description?: string }) => {
    const response = await apiClient.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  assignPermissions: async (id: string, data: { permissionIds: string[] }) => {
    const response = await apiClient.post(`/admin/roles/${id}/permissions`, data);
    return response.data;
  },

  getPermissions: async () => {
    const response = await apiClient.get('/admin/permissions');
    return response.data;
  },
};
