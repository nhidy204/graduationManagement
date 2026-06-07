import api from '@/lib/axios';
import type { Topic, TopicFilters } from '../types/topic.types';
import type { PaginatedResponse, ApiResponse } from '@/types/api.types';

export const topicsApi = {
  getAll: async (
    filters: Partial<TopicFilters> & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Topic>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Topic>>>('/topics', {
      params: {
        search:       filters.search       || undefined,
        major:        filters.major        || undefined,
        status:       filters.status       || undefined,
        supervisorId: filters.supervisorId || undefined,
        page:         filters.page  ?? 1,
        limit:        filters.limit ?? 12
      }
    });
    return data.data;
  },

  getById: async (id: string): Promise<Topic> => {
    const { data } = await api.get<ApiResponse<Topic>>(`/topics/${id}`);
    return data.data;
  },

  create: async (payload: Partial<Topic>): Promise<Topic> => {
    const { data } = await api.post<ApiResponse<Topic>>('/topics', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<Topic>): Promise<Topic> => {
    const { data } = await api.put<ApiResponse<Topic>>(`/topics/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },

  getStats: async () => {
    const { data } = await api.get<ApiResponse<unknown>>('/topics/stats');
    return data.data;
  }
};