'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { RejectModal } from '@/features/registrations/components/RejectModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useRegistrations,
  useReviewRegistration
} from '@/features/registrations/hooks/useRegistrations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatDate, cn } from '@/lib/utils';
import type { RegistrationStatus, Registration } from '@/features/registrations/types/registration.types';

const STATUS_TABS: { value: RegistrationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'Tất cả' },
  { value: 'PENDING',  label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' }
];

const STATUS_UI: Record<RegistrationStatus, { label: string; icon: React.ElementType; badge: string }> = {
  PENDING:  { label: 'Chờ duyệt',  icon: Clock,        badge: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  APPROVED: { label: 'Đã duyệt',   icon: CheckCircle2, badge: 'bg-green-50 text-green-700 ring-green-200' },
  REJECTED: { label: 'Đã từ chối', icon: XCircle,      badge: 'bg-red-50 text-red-700 ring-red-200' }
};

export default function RegistrationsPage() {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab]       = useState<RegistrationStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: regData, isLoading } = useRegistrations({
    status: activeTab === 'ALL' ? undefined : activeTab
  });
  const reviewMutation = useReviewRegistration();

  const registrations = regData?.data ?? [];
  const pendingCount  = activeTab === 'ALL'
    ? registrations.filter((r: Registration) => r.status === 'PENDING').length
    : regData?.total ?? 0;

  const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';

  const handleApprove = (id: string) => {
    reviewMutation.mutate({ id, action: 'APPROVED' });
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    reviewMutation.mutate(
      { id: rejectTarget.id, action: 'REJECTED', rejectReason: reason },
      { onSuccess: () => setRejectTarget(null) }
    );
  };

  return (
    <PageWrapper
      title="Quản lý Đăng ký"
      description={
        pendingCount > 0
          ? `${pendingCount} đơn đang chờ duyệt`
          : 'Tất cả đơn đã được xử lý'
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.value === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20">
          <p className="text-sm text-gray-500">Không có đơn đăng ký nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registrations.map((reg: Registration) => {
            const regId      = String(reg._id);
            const ui         = STATUS_UI[reg.status as RegistrationStatus];
            const Icon       = ui.icon;
            const isExpanded = expandedId === regId;

            return (
              <div
                key={regId}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                {/* Row */}
                <div className="flex flex-wrap items-center gap-4 p-4">
                  {/* Avatar + Student */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {reg.student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{reg.student.name}</p>
                      <p className="text-xs text-gray-400">{reg.student.email}</p>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-sm text-gray-700">{reg.topic.title}</p>
                    <p className="text-xs text-gray-400">{reg.topic.major}</p>
                  </div>

                  {/* Date */}
                  <p className="hidden text-xs text-gray-400 lg:block shrink-0">
                    {formatDate(reg.createdAt)}
                  </p>

                  {/* Status badge */}
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 shrink-0',
                    ui.badge
                  )}>
                    <Icon className="h-3 w-3" />
                    {ui.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : regId)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {isLecturer && reg.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectTarget({ id: regId, name: reg.student.name })}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={reviewMutation.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          loading={reviewMutation.isPending}
                          onClick={() => handleApprove(regId)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Duyệt
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:hidden">
                        <p className="text-xs font-medium text-gray-400">Đề tài</p>
                        <p className="mt-1 text-sm text-gray-700">{reg.topic.title}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">Lý do đăng ký</p>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                          {reg.note || (
                            <span className="italic text-gray-400">Không có</span>
                          )}
                        </p>
                      </div>

                      {reg.status === 'REJECTED' && reg.rejectReason && (
                        <div>
                          <p className="text-xs font-medium text-red-400">Lý do từ chối</p>
                          <p className="mt-1 text-sm text-red-600 leading-relaxed">
                            {reg.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RejectModal
        open={!!rejectTarget}
        studentName={rejectTarget?.name ?? ''}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </PageWrapper>
  );
}