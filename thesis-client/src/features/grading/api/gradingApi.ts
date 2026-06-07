import api from '@/lib/axios';

export const gradingApi = {
  init: async (studentId: string, topicId: string, type: 'SUPERVISOR' | 'REVIEWER') => {
    const { data } = await api.post('/grading/init', { studentId, topicId, type });
    return data.data;
  },

  getMyGrades: async () => {
    const { data } = await api.get('/grading/my');
    return data.data;
  },

  updateScore: async (gradeId: string, criteriaId: string, score: number, generalComment?: string) => {
    const { data } = await api.patch(`/grading/${gradeId}/score`, {
      criteriaId, score, generalComment
    });
    return data.data;
  },

  submit: async (gradeId: string) => {
    const { data } = await api.patch(`/grading/${gradeId}/submit`);
    return data.data;
  },

  getStudentResult: async (studentId: string) => {
    const { data } = await api.get(`/grading/results/${studentId}`);
    return data.data;
  },

  getTopicResults: async (topicId: string) => {
    const { data } = await api.get(`/grading/topic/${topicId}/results`);
    return data.data;
  },

  assignReviewer: async (studentId: string, topicId: string, reviewerId: string) => {
    const { data } = await api.post('/grading/assign-reviewer', {
      studentId, topicId, reviewerId
    });
    return data.data;
  }
};