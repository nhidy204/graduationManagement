import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { useToast } from '@/components/ui/Toast';
import type { ApiError } from '@/types/api.types';

export const USERS_KEY = 'users';

export function useUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn:  () => usersApi.getAll(params)
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: [USERS_KEY, 'stats'],
    queryFn:  usersApi.getStats
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.toggleStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast('Đã cập nhật trạng thái tài khoản', 'success');
    }
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast('Đã xóa tài khoản', 'success');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast(error?.response?.data?.message ?? 'Có lỗi xảy ra', 'error');
    }
  });
}