'use client';

import { useState } from 'react';
import { Search, UserX, UserCheck, Trash2, Plus, Users } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useUsers,
  useUserStats,
  useToggleUserStatus,
  useDeleteUser
} from '@/features/admin/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { formatDate, cn } from '@/lib/utils';
import type { Role, User } from '@/types/api.types';

interface UserWithStatus extends User {
  status: 'ACTIVE' | 'INACTIVE';
}

const ROLE_TABS: { value: Role | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'Tất cả' },
  { value: 'STUDENT',  label: 'Sinh viên' },
  { value: 'LECTURER', label: 'Giảng viên' },
  { value: 'ADMIN',    label: 'Admin' },
];

const ROLE_UI: Record<Role, { label: string; color: string }> = {
  STUDENT:  { label: 'Sinh viên',  color: 'bg-blue-50 text-blue-700' },
  LECTURER: { label: 'Giảng viên', color: 'bg-purple-50 text-purple-700' },
  ADMIN:    { label: 'Admin',      color: 'bg-red-50 text-red-700' },
};

export default function AdminUsersPage() {
  const { toast } = useToast();

  const [roleTab, setRoleTab]       = useState<Role | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserWithStatus | null>(null);

  // ── API hooks ──
  const { data: userData, isLoading } = useUsers({
    role:   roleTab === 'ALL' ? undefined : roleTab,
    search: search || undefined
  });
  const { data: stats }      = useUserStats();
  const toggleMutation       = useToggleUserStatus();
  const deleteMutation       = useDeleteUser();

  const users = userData?.data ?? [];

  const statCards = [
    { label: 'Tổng tài khoản', value: stats?.total     ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Sinh viên',      value: stats?.students   ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Giảng viên',     value: stats?.lecturers  ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Đã khoá',        value: stats?.inactive   ?? 0, icon: UserX, color: 'text-red-600 bg-red-50' },
  ];

  const handleToggle = (user: UserWithStatus) => {
    toggleMutation.mutate(user._id, {
      onSuccess: () => {
        toast(
          user.status === 'ACTIVE'
            ? `Đã khoá tài khoản ${user.name}`
            : `Đã mở khoá tài khoản ${user.name}`,
          'success'
        );
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast(`Đã xóa tài khoản ${deleteTarget.name}`, 'success');
        setDeleteTarget(null);
      }
    });
  };

  const columns = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (u: UserWithStatus) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            u.role === 'STUDENT'  ? 'bg-blue-100 text-blue-700' :
            u.role === 'LECTURER' ? 'bg-purple-100 text-purple-700' :
            'bg-red-100 text-red-700'
          )}>
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Vai trò',
      width: '120px',
      render: (u: UserWithStatus) => (
        <span className={cn('rounded-md px-2 py-1 text-xs font-medium', ROLE_UI[u.role].color)}>
          {ROLE_UI[u.role].label}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      render: (u: UserWithStatus) => (
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
          )} />
          {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khoá'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: '120px',
      render: (u: UserWithStatus) => (
        <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (u: UserWithStatus) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleToggle(u)}
            disabled={toggleMutation.isPending}
            title={u.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở khoá'}
            className={cn(
              'rounded-lg p-1.5 transition-colors disabled:opacity-50',
              u.status === 'ACTIVE'
                ? 'text-gray-400 hover:bg-orange-50 hover:text-orange-600'
                : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
            )}
          >
            {u.status === 'ACTIVE'
              ? <UserX className="h-4 w-4" />
              : <UserCheck className="h-4 w-4" />
            }
          </button>
          <button
            onClick={() => setDeleteTarget(u)}
            title="Xóa tài khoản"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <PageWrapper
      title="Quản lý Người dùng"
      description={`${stats?.total ?? 0} tài khoản trong hệ thống`}
      action={
        <Button size="md">
          <Plus className="h-4 w-4" />
          Thêm tài khoản
        </Button>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={cn('mb-2 inline-flex rounded-lg p-2', s.color)}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role tabs */}
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleTab(tab.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                roleTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table
          columns={columns}
          data={users}
          keyExtractor={(u: UserWithStatus) => u._id}
          emptyText="Không tìm thấy tài khoản nào"
        />
      )}

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xóa tài khoản"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Bạn có chắc muốn xóa tài khoản{' '}
          <span className="font-semibold text-gray-900">{deleteTarget?.name || ''}</span>?
          Hành động này không thể hoàn tác.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Xóa tài khoản
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}