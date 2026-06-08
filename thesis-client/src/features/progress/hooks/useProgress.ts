import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';
import { useToast } from '@/components/ui/Toast';
import type { ApiError } from '@/types/api.types';

export const PROGRESS_KEY = 'progress';

export function useMyProgress() {
  return useQuery({
    queryKey: [PROGRESS_KEY, 'my'],
    queryFn:  progressApi.getMyProgress,
    staleTime: 0, // Data is immediately stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true  // Refetch when reconnecting to internet
  });
}

export function useTopicProgress(topicId: string) {
  return useQuery({
    queryKey: [PROGRESS_KEY, 'topic', topicId],
    queryFn:  () => progressApi.getByTopic(topicId),
    enabled:  !!topicId,
    staleTime: 0, // Data is immediately stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true  // Refetch when reconnecting to internet
  });
}

export function useCreateProgress() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: progressApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRESS_KEY], refetchType: 'all' });
      toast('Cập nhật tiến độ thành công!', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}

export function useAddComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, content }: { entryId: string; content: string }) =>
      progressApi.addComment(entryId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRESS_KEY], refetchType: 'all' });
    }
  });
}

export function useMarkSeen() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: progressApi.markSeen,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRESS_KEY], refetchType: 'all' });
    }
  });
}