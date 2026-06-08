'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { registrationsApi } from '@/features/registrations/api/registrationsApi';
import { usersApi } from '@/features/admin/api/usersApi';
import { gradingApi } from '@/features/grading/api/gradingApi';
import { cn } from '@/lib/utils';

interface ApprovedReg {
  _id: string;
  student: { _id: string; name: string };
  topic: { _id: string; title: string; supervisor?: { _id: string; name: string } };
}

interface Lecturer {
  _id: string;
  name: string;
}

interface ExistingGrade {
  _id: string;
  student: { _id: string; name: string };
  type: 'SUPERVISOR' | 'REVIEWER';
  grader: string | { _id: string; name: string };
}

export default function AssignReviewerPage() {
  const { toast } = useToast();
  const [localAssign, setLocalAssign] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: regData, isLoading: regLoading } = useQuery({
    queryKey: ['registrations-approved'],
    queryFn: () => registrationsApi.getAll({ status: 'APPROVED', limit: 100 }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['lecturers'],
    queryFn: () => usersApi.getAll({ role: 'LECTURER', limit: 100 }),
  });

  const { data: existingGrades } = useQuery({
    queryKey: ['existing-grades'],
    queryFn: () => gradingApi.getAllSubmitted(),
  });

  const registrations: ApprovedReg[] = regData?.data ?? [];
  const lecturers: Lecturer[] = usersData?.data ?? [];

  // Pre-populate localAssign từ existing reviewer grades
 useEffect(() => {
  if (!registrations.length || !existingGrades) return;

  const initial: Record<string, string> = {};
  for (const reg of registrations) {
    const reviewerGrade = (existingGrades as ExistingGrade[]).find(
      (g) => g.student._id === reg.student._id && g.type === 'REVIEWER'
    );
    if (reviewerGrade) {
      const graderId = typeof reviewerGrade.grader === 'object'
        ? reviewerGrade.grader._id
        : reviewerGrade.grader;
      if (graderId) initial[reg._id] = graderId;
    }
  }

  setTimeout(() => setLocalAssign(initial), 0);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [regData, existingGrades]);

  const assigned = Object.values(localAssign).filter(Boolean).length;
  const total = registrations.length;

  const handleSave = async () => {
    setSaving(true);
    let success = 0;
    let failed = 0;

    for (const [regId, reviewerId] of Object.entries(localAssign)) {
      if (!reviewerId) continue;
      const reg = registrations.find((r) => r._id === regId);
      if (!reg) continue;

      try {
        await gradingApi.assignReviewer(reg.student._id, reg.topic._id, reviewerId);
        success++;
      } catch {
        failed++;
      }
    }

    setSaving(false);
    if (failed > 0) {
      toast(`Lưu thành công ${success}, thất bại ${failed}`, 'error');
    } else {
      toast(`Đã phân công phản biện cho ${success} đề tài`, 'success');
    }
  };

  if (regLoading || usersLoading) {
    return (
      <PageWrapper title="Phân công Phản biện">
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Phân công Phản biện"
      description={`${assigned}/${total} đề tài đã được phân công`}
      action={
        <Button onClick={handleSave} loading={saving} disabled={assigned === 0}>
          <Save className="h-4 w-4" />
          Lưu tất cả
        </Button>
      }
    >
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Tiến độ phân công</p>
          <span className="text-sm font-bold text-blue-600">{assigned}/{total}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: total > 0 ? `${(assigned / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
            <p className="text-sm text-gray-500">Chưa có đăng ký nào được duyệt</p>
          </div>
        ) : (
          registrations.map((reg) => {
            const reviewerId = localAssign[reg._id] ?? '';
            const isAssigned = !!reviewerId;
            const supervisorId = reg.topic.supervisor?._id;
            const availableLecturers = lecturers.filter((l) => l._id !== supervisorId);

            return (
              <div
                key={reg._id}
                className={cn(
                  'rounded-xl border bg-white p-5 transition-all',
                  isAssigned ? 'border-green-200' : 'border-orange-200'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isAssigned
                        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        : <AlertCircle className="h-4 w-4 shrink-0 text-orange-400" />
                      }
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {reg.topic.title}
                      </p>
                    </div>
                    <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-gray-500">
                        <span className="font-medium">SV:</span> {reg.student.name}
                      </span>
                      {reg.topic.supervisor && (
                        <span className="text-xs text-gray-500">
                          <span className="font-medium">GVHD:</span> {reg.topic.supervisor.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0 min-w-[220px]">
                    <label className="text-xs font-medium text-gray-500">
                      Giảng viên phản biện
                    </label>
                    <select
                      value={reviewerId}
                      onChange={(e) =>
                        setLocalAssign((prev) => ({ ...prev, [reg._id]: e.target.value }))
                      }
                      aria-label={`Chọn giảng viên phản biện cho ${reg.topic.title}`}
                      className={cn(
                        'h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2',
                        isAssigned
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                          : 'border-orange-300 focus:border-orange-500 focus:ring-orange-500/20'
                      )}
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
          })
        )}
      </div>
    </PageWrapper>
  );
}