'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Star, Eye } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from '@/features/grading/api/gradingApi';
import { formatDate, cn } from '@/lib/utils';

interface SubmittedGrade {
  _id: string;
  student: { _id: string; name: string; email: string };
  topic: { _id: string; title: string; major: string };
  grader: string | { _id: string; name: string; email: string };
  type: 'SUPERVISOR' | 'REVIEWER';
  totalScore: number | null;
  submitted: boolean;
  published: boolean;
  submittedAt?: string;
}

export default function AdminGradingPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['admin-grades'],
    queryFn: () => gradingApi.getAllSubmitted(),
  });

  const publishMutation = useMutation({
    mutationFn: (gradeId: string) => gradingApi.publishGrade(gradeId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-grades'] });
      toast('Đã công bố điểm thành công!', 'success');
    },
    onError: () => {
      toast('Có lỗi xảy ra khi công bố điểm', 'error');
    },
  });

  const pending  = (grades as SubmittedGrade[]).filter((g) => !g.published).length;
  const published = (grades as SubmittedGrade[]).filter((g) => g.published).length;

  return (
    <PageWrapper
      title="Duyệt điểm"
      description={`${pending} phiếu chờ duyệt · ${published} đã công bố`}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (grades as SubmittedGrade[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20">
          <p className="text-sm text-gray-500">Chưa có phiếu chấm nào được submit</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(grades as SubmittedGrade[]).map((grade) => {
            const isExpanded = expandedId === grade._id;
            const graderName = typeof grade.grader === 'object'
              ? grade.grader.name
              : 'Giảng viên';

            return (
              <div
                key={grade._id}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-4 p-4">
                  {/* Student */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {grade.student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{grade.student.name}</p>
                      <p className="text-xs text-gray-400">{grade.student.email}</p>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-sm text-gray-700">{grade.topic.title}</p>
                    <p className="text-xs text-gray-400">{grade.topic.major}</p>
                  </div>

                  {/* Type badge */}
                  <span className={cn(
                    'shrink-0 rounded-md px-2 py-1 text-xs font-medium',
                    grade.type === 'SUPERVISOR'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  )}>
                    {grade.type === 'SUPERVISOR' ? 'Hướng dẫn' : 'Phản biện'}
                  </span>

                  {/* Score */}
                  {grade.totalScore !== null && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-800">
                        {grade.totalScore.toFixed(2)}/10
                      </span>
                    </div>
                  )}

                  {/* Status */}
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0',
                    grade.published
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  )}>
                    {grade.published
                      ? <><CheckCircle2 className="h-3 w-3" /> Đã công bố</>
                      : <><Clock className="h-3 w-3" /> Chờ duyệt</>
                    }
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : grade._id)}
                      title="Xem chi tiết"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!grade.published && (
                      <Button
                        size="sm"
                        loading={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(grade._id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Công bố
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Giảng viên chấm</p>
                        <p className="mt-1 text-sm text-gray-700">{graderName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Ngày submit</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {grade.submittedAt ? formatDate(grade.submittedAt) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Điểm tổng</p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {grade.totalScore !== null ? `${grade.totalScore.toFixed(2)}/10` : 'Chưa có'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}