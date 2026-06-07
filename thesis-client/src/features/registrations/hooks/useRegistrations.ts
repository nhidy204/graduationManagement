import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '../api/registrationsApi';
import { useToast } from '@/components/ui/Toast';
import type { ApiError } from '@/types/api.types';

export const REG_KEY = 'registrations';

export function useRegistrations(params?: {
  status?: string;
  topicId?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: [REG_KEY, params],
    queryFn:  () => registrationsApi.getAll(params),
    staleTime: 0, // Data is immediately stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true  // Refetch when reconnecting to internet
  });
}

export function useMyRegStatus() {
  return useQuery({
    queryKey: [REG_KEY, 'my-status'],
    queryFn:  registrationsApi.getMyStatus,
    staleTime: 0, // Data is immediately stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true  // Refetch when reconnecting to internet
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ topicId, note }: { topicId: string; note?: string }) =>
      registrationsApi.create(topicId, note),
    onSuccess: () => {
      // Invalidate both registrations and topics queries
      qc.invalidateQueries({ queryKey: [REG_KEY], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['topics'], refetchType: 'all' });
      toast('Đã nộp đơn đăng ký! Chờ giảng viên duyệt.', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}

export function useReviewRegistration() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id, action, rejectReason
    }: { id: string; action: 'APPROVED' | 'REJECTED'; rejectReason?: string }) =>
      registrationsApi.review(id, action, rejectReason),
    onSuccess: (_, vars) => {
      // Invalidate both registrations and topics queries
      qc.invalidateQueries({ queryKey: [REG_KEY], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['topics'], refetchType: 'all' });
      toast(
        vars.action === 'APPROVED' ? 'Đã duyệt đăng ký!' : 'Đã từ chối đăng ký.',
        'success'
      );
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: registrationsApi.cancel,
    onSuccess: () => {
      // Invalidate both registrations and topics queries
      qc.invalidateQueries({ queryKey: [REG_KEY], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['topics'], refetchType: 'all' });
      toast('Đã huỷ đơn đăng ký.', 'success');
    }
  });
}