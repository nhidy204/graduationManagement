import api from '@/lib/axios';

export const progressApi = {
  create: async (payload: {
    topicId: string;
    weekNumber: number;
    weekLabel: string;
    summary: string;
    plan: string;
    percentage?: number;
    fileUrl?: string;
    fileName?: string;
  }) => {
    console.log('progressApi.create payload:', payload);
    const { data } = await api.post('/progress', payload);
    return data.data;
  },

  getMyProgress: async () => {
    const { data } = await api.get('/progress/my');
    return data.data;
  },

  getByTopic: async (topicId: string) => {
    const { data } = await api.get(`/progress/topic/${topicId}`);
    return data.data;
  },

  addComment: async (entryId: string, content: string) => {
    const { data } = await api.post(`/progress/${entryId}/comments`, { content });
    return data.data;
  },

  markSeen: async (entryId: string) => {
    const { data } = await api.patch(`/progress/${entryId}/seen`);
    return data.data;
  },

  deleteComment: async (entryId: string, commentId: string) => {
    const { data } = await api.delete(`/progress/${entryId}/comments/${commentId}`);
    return data.data;
  }
};