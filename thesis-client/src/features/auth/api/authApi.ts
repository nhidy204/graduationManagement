import api from '@/lib/axios';
import type { LoginPayload, LoginResponse } from '../types/auth.types';
import type { User } from '@/types/api.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<{ data: LoginResponse }>('/auth/login', payload);
    return data.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'LECTURER';
  }): Promise<LoginResponse> => {
    const { data } = await api.post<{ data: LoginResponse }>('/auth/register', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
    return { accessToken: data.data?.accessToken || '' };
  }
};