import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi } from '../api/topicsApi';
import { useToast } from '@/components/ui/Toast';
import type { TopicFilters } from '../types/topic.types';
import type { ApiError } from '@/types/api.types';

export const TOPICS_KEY = 'topics';

export function useTopics(filters: Partial<TopicFilters> & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [TOPICS_KEY, filters],
    queryFn:  () => topicsApi.getAll(filters),
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true  // Refetch when reconnecting to internet
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: [TOPICS_KEY, id],
    queryFn:  () => topicsApi.getById(id),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5 // 5 minutes cache for individual topics
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: topicsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TOPICS_KEY] });
      toast('Tạo đề tài thành công!', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => {
      return topicsApi.update(id, payload as Parameters<typeof topicsApi.update>[1]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TOPICS_KEY] });
      toast('Cập nhật đề tài thành công!', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: topicsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TOPICS_KEY] });
      toast('Đã xóa đề tài', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}