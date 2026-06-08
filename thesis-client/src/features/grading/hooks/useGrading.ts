import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from '../api/gradingApi';
import { useToast } from '@/components/ui/Toast';
import type { ApiError } from '@/types/api.types';

export const GRADING_KEY = 'grading';

export function useMyGrades() {
  return useQuery({
    queryKey: [GRADING_KEY, 'my'],
    queryFn: gradingApi.getMyGrades,
    staleTime: 1000 * 60,
  });
}

export function useUpdateScore() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      gradeId, criteriaId, score, generalComment
    }: {
      gradeId: string;
      criteriaId: string;
      score: number;
      generalComment?: string;
    }) => gradingApi.updateScore(gradeId, criteriaId, score, generalComment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GRADING_KEY, 'my'] });
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    },
  });
}

export function useSubmitGrade() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gradeId: string) => gradingApi.submit(gradeId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GRADING_KEY, 'my'] });
      toast('Đã gửi điểm chính thức!', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    },
  });
}