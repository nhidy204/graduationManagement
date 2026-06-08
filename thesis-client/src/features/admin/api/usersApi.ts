import api from '@/lib/axios';

export const usersApi = {
  getAll: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/users', { params });
    return data.data;
  },

  getStats: async () => {
    const { data } = await api.get('/users/stats');
    return data.data;
  },

  create: async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const { data } = await api.post('/users', payload);
    return data.data;
  },

  toggleStatus: async (id: string) => {
    const { data } = await api.patch(`/users/${id}/toggle-status`);
    return data.data;
  },

  remove: async (id: string) => {
    await api.delete(`/users/${id}`);
  }
};