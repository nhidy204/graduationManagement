'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/features/admin/store/adminStore';
import { useToast } from '@/components/ui/Toast';
import { LECTURERS_FOR_REVIEW } from '@/features/admin/mock/admin.mock';
import { cn } from '@/lib/utils';

export default function AssignReviewerPage() {
  const { assignments, setReviewer } = useAdminStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [localAssign, setLocalAssign] = useState<Record<string, string | null>>(
    Object.fromEntries(assignments.map((a) => [a.topicId, a.reviewerId]))
  );

  const assigned = Object.values(localAssign).filter(Boolean).length;
  const total = assignments.length;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    Object.entries(localAssign).forEach(([topicId, reviewerId]) => {
      setReviewer(topicId, reviewerId);
    });
    setSaving(false);
    toast(`Đã lưu phân công phản biện cho ${assigned}/${total} đề tài.`, 'success');
  };

  return (
    <PageWrapper
      title="Phân công Phản biện"
      description={`${assigned}/${total} đề tài đã được phân công`}
      action={
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          Lưu tất cả
        </Button>
      }
    >
      {/* Progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Tiến độ phân công</p>
          <span className="text-sm font-bold text-blue-600">{assigned}/{total}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div /* stylelint-disable-line */
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: total > 0 ? `${(assigned / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Assignment cards */}
      <div className="flex flex-col gap-3">
        {assignments.map((a) => {
          const currentReviewerId = localAssign[a.topicId];
          const isAssigned = !!currentReviewerId;

          // Lấy danh sách GV hợp lệ (loại GVHD ra)
          const availableLecturers = LECTURERS_FOR_REVIEW.filter(
            (l) => !a.supervisorName.includes(l.name.split('. ')[1]?.split(' ')[0] ?? '__')
          );

          return (
            <div
              key={a.topicId}
              className={cn(
                'rounded-xl border bg-white p-5 transition-all',
                isAssigned ? 'border-green-200' : 'border-orange-200'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isAssigned
                      ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      : <AlertCircle className="h-4 w-4 shrink-0 text-orange-400" />
                    }
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {a.topicTitle}
                    </p>
                  </div>
                  <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs text-gray-500">
                      <span className="font-medium">SV:</span> {a.studentName}
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="font-medium">GVHD:</span> {a.supervisorName}
                    </span>
                  </div>
                </div>

                {/* Reviewer select */}
                <div className="flex flex-col gap-1 shrink-0 min-w-[220px]">
                  <label className="text-xs font-medium text-gray-500">
                    Giảng viên phản biện
                  </label>
                  <select
                    value={currentReviewerId ?? ''}
                    onChange={(e) =>
                      setLocalAssign((prev) => ({
                        ...prev,
                        [a.topicId]: e.target.value || null
                      }))
                    }
                    className={cn(
                      'h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2',
                      isAssigned
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                        : 'border-orange-300 focus:border-orange-500 focus:ring-orange-500/20'
                    )}
                    aria-label={`Chọn giảng viên phản biện cho ${a.topicTitle}`}
                  >
                    <option value="">— Chưa phân công —</option>
                    {availableLecturers.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                  {isAssigned && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã phân công
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}