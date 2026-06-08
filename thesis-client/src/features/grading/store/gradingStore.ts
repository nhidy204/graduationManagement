import { create } from 'zustand';
import type { GradeSubmission } from '../types/grading.types';
import { MOCK_GRADE_SUBMISSIONS } from '../mock/grading.mock';

interface GradingStore {
  submissions: GradeSubmission[];
  updateScore: (submissionId: string, criteriaId: string, score: number) => void;
  updateComment: (submissionId: string, comment: string) => void;
  submitGrade: (submissionId: string) => void;
}

export const useGradingStore = create<GradingStore>((set) => ({
  submissions: MOCK_GRADE_SUBMISSIONS,

  updateScore: (submissionId, criteriaId, score) =>
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub._id === submissionId
          ? {
              ...sub,
              criteria: sub.criteria.map((c) =>
                c._id === criteriaId ? { ...c, score } : c
              )
            }
          : sub
      )
    })),

  updateComment: (submissionId, comment) =>
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub._id === submissionId ? { ...sub, generalComment: comment } : sub
      )
    })),

  submitGrade: (submissionId) =>
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub._id === submissionId
          ? { ...sub, submitted: true, submittedAt: new Date().toISOString() }
          : sub
      )
    }))
}));