'use client';

import { useState } from 'react';
import {
  CheckCircle2, Clock, ChevronRight,
  AlertTriangle, Star, Send
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMyGrades, useUpdateScore, useSubmitGrade } from '@/features/grading/hooks/useGrading';
import { formatDate, cn } from '@/lib/utils';
import type { GradeSubmission, GradeCriteria } from '@/features/grading/types/grading.types';

export default function GradingPage() {
  const { data: submissions = [], isLoading } = useMyGrades();
  const updateScoreMutation = useUpdateScore();
  const submitGradeMutation = useSubmitGrade();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const active = submissions.find((s: GradeSubmission) => s._id === activeId) ?? null;

  const calcTotal = (sub: GradeSubmission) => {
    const filled = sub.criteria.filter((c) => c.score !== null);
    if (filled.length === 0) return null;
    return sub.criteria.reduce((acc, c) => acc + (c.score ?? 0) * c.weight, 0);
  };

  const allFilled = (sub: GradeSubmission) =>
    sub.criteria.every((c) => c.score !== null);

  const handleUpdateScore = (criteriaId: string, score: number) => {
    if (!activeId) return;
    updateScoreMutation.mutate({ gradeId: activeId, criteriaId, score });
  };

  const handleSubmit = () => {
    if (!activeId) return;
    submitGradeMutation.mutate(activeId, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <PageWrapper
      title="Chấm điểm"
      description="Quản lý điểm hướng dẫn và phản biện"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* ── Left: submission list ── */}
          <div className="flex flex-col gap-2 lg:w-72 shrink-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 px-1">
              Danh sách chấm điểm
            </p>
            {submissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center">
                <p className="text-sm text-gray-400">Chưa có phiếu chấm nào</p>
              </div>
            ) : (
              submissions.map((sub: GradeSubmission) => {
                const total = calcTotal(sub);
                const isActive = activeId === sub._id;

                return (
                  <button
                    key={sub._id}
                    onClick={() => setActiveId(sub._id)}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border p-4 text-left transition-all',
                      isActive
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-medium',
                          sub.type === 'SUPERVISOR'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        )}>
                          {sub.type === 'SUPERVISOR' ? 'Hướng dẫn' : 'Phản biện'}
                        </span>
                        {sub.submitted
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          : <Clock className="h-3.5 w-3.5 text-yellow-500" />
                        }
                      </div>
                      <ChevronRight className={cn(
                        'h-4 w-4 shrink-0 text-gray-300 transition-transform',
                        isActive && 'rotate-90 text-blue-500'
                      )} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {sub.student?.name}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {sub.topic?.title}
                      </p>
                    </div>

                    {total !== null && (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-800">
                          {total.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ── Right: grade form ── */}
          <div className="flex-1">
            {!active ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24">
                <Star className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Chọn một sinh viên để bắt đầu chấm điểm
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-start justify-between border-b border-gray-100 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-medium',
                        active.type === 'SUPERVISOR'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      )}>
                        {active.type === 'SUPERVISOR' ? 'Điểm hướng dẫn' : 'Điểm phản biện'}
                      </span>
                      {active.submitted && (
                        <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Đã gửi {active.submittedAt ? formatDate(active.submittedAt) : ''}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-base font-bold text-gray-900">
                      {active.student?.name}
                    </p>
                    <p className="text-sm text-gray-500">{active.topic?.title}</p>
                  </div>

                  {calcTotal(active) !== null && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Điểm dự tính</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {calcTotal(active)!.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">/ 10.00</p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Tiêu chí chấm điểm
                  </p>

                  <div className="flex flex-col gap-3">
                    {active.criteria.map((criteria: GradeCriteria) => (
                      <div
                        key={criteria._id}
                        className={cn(
                          'rounded-xl border p-4 transition-colors',
                          active.submitted
                            ? 'border-gray-100 bg-gray-50'
                            : criteria.score !== null
                            ? 'border-blue-100 bg-blue-50/50'
                            : 'border-gray-200'
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {criteria.name}
                              </p>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                {Math.round(criteria.weight * 100)}%
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {criteria.description}
                            </p>
                            {criteria.score !== null && (
                              <p className="mt-1 text-xs text-blue-600 font-medium">
                                Điểm thành phần: {(criteria.score * criteria.weight).toFixed(2)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {active.submitted ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-lg font-bold text-gray-800">
                                  {criteria.score?.toFixed(1) ?? '—'}
                                </span>
                                <span className="text-sm text-gray-400">/10</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min={0} max={10} step={0.5}
                                    value={criteria.score ?? 0}
                                    onChange={(e) =>
                                      handleUpdateScore(criteria._id, Number(e.target.value))
                                    }
                                    className="w-28 accent-blue-600"
                                    aria-label="Score slider"
                                  />
                                  <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white">
                                    <input
                                      type="number"
                                      min={0} max={10} step={0.5}
                                      value={criteria.score ?? ''}
                                      placeholder="—"
                                      onChange={(e) => {
                                        const v = Math.min(10, Math.max(0, Number(e.target.value)));
                                        handleUpdateScore(criteria._id, v);
                                      }}
                                      className="w-full bg-transparent text-center text-sm font-bold text-gray-900 focus:outline-none"
                                      aria-label="Score input"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {[6, 7, 8, 9, 10].map((v) => (
                                    <button
                                      key={v}
                                      onClick={() => handleUpdateScore(criteria._id, v)}
                                      className={cn(
                                        'rounded-md px-2 py-0.5 text-xs transition-colors',
                                        criteria.score === v
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      )}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {calcTotal(active) !== null && (
                    <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-800">Tổng điểm có trọng số</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {calcTotal(active)!.toFixed(2)}
                          <span className="text-sm font-normal text-blue-500">/10</span>
                        </p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all"
                          style={{ width: `${(calcTotal(active)! / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Nhận xét tổng quan
                    </label>
                    {active.submitted ? (
                      <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600 leading-relaxed">
                        {active.generalComment || <span className="italic text-gray-400">Không có nhận xét</span>}
                      </p>
                    ) : (
                      <textarea
                        value={active.generalComment}
                        onChange={(e) => {
                          if (!activeId) return;
                          const lastCriteria = active.criteria[active.criteria.length - 1];
                          if (lastCriteria?.score !== null) {
                            updateScoreMutation.mutate({
                              gradeId: activeId,
                              criteriaId: lastCriteria._id,
                              score: lastCriteria.score ?? 0,
                              generalComment: e.target.value,
                            });
                          }
                        }}
                        rows={3}
                        placeholder="Nhận xét chung về kết quả của sinh viên..."
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                          placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {!active.submitted && (
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                        Sau khi gửi, điểm không thể chỉnh sửa
                      </div>
                      <Button
                        size="sm"
                        disabled={!allFilled(active)}
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Gửi điểm chính thức
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận gửi điểm"
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Hành động không thể hoàn tác</p>
              <p className="mt-1 text-sm text-orange-700">
                Sau khi gửi, điểm sẽ được ghi nhận chính thức và bạn không thể chỉnh sửa.
              </p>
            </div>
          </div>

          {active && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Sinh viên</p>
              <p className="text-sm font-semibold text-gray-900">{active.student?.name}</p>
              <p className="mt-2 text-xs text-gray-500">Điểm tổng kết</p>
              <p className="text-2xl font-bold text-blue-600">
                {calcTotal(active)?.toFixed(2)}/10
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={submitGradeMutation.isPending}>
            Xác nhận gửi điểm
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}