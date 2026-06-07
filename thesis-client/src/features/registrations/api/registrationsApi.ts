import api from '@/lib/axios';

export const registrationsApi = {
  create: async (topicId: string, note?: string) => {
    console.log('registrationsApi.create topicId:', topicId, typeof topicId);
    const { data } = await api.post('/registrations', { topicId, note });
    return data.data;
  },

  getAll: async (params?: {
    status?: string;
    topicId?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/registrations', { params });
    return data.data;
  },

  getMyStatus: async () => {
    const { data } = await api.get('/registrations/my-status');
    return data.data;
  },

  review: async (id: string, action: 'APPROVED' | 'REJECTED', rejectReason?: string) => {
    const { data } = await api.patch(`/registrations/${id}/review`, {
      action,
      rejectReason
    });
    return data.data;
  },

  cancel: async (id: string) => {
    await api.delete(`/registrations/${id}`);
  }
};