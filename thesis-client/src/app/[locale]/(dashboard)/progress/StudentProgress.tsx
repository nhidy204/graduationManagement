'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useMyProgress,
  useCreateProgress,
  useAddComment,
  useMarkSeen
} from '@/features/progress/hooks/useProgress';
import { useMyRegStatus } from '@/features/registrations/hooks/useRegistrations';
import { cn } from '@/lib/utils';
import type { ProgressEntry } from '@/features/progress/types/progress.types';
import { EntryCard } from './EntryCard';

const CURRENT_WEEK = 4;

interface EntryForm {
  summary: string;
  plan: string;
  percentage: number;
  fileName: string;
}

export function StudentProgress() {
  const { data: myEntries = [], isLoading } = useMyProgress();
  const { data: myReg }                     = useMyRegStatus();
  const createProgress                      = useCreateProgress();
  const addCommentMutation                  = useAddComment();
  const markSeenMutation                    = useMarkSeen();

  const topicId = myReg?.topic?._id ? String(myReg.topic._id) : '';
  const isRegApproved = myReg?.status === 'APPROVED';

  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState<EntryForm>({
    summary: '', plan: '', percentage: 0, fileName: ''
  });
  const [formErrors, setFormErrors]   = useState<Partial<EntryForm>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const hasCurrentWeek  = myEntries.some((e: ProgressEntry) => e.weekNumber === CURRENT_WEEK);
  const overallProgress = myEntries.length > 0
    ? Math.max(...myEntries.map((e: ProgressEntry) => e.percentage))
    : 0;

  const validateForm = (): Partial<EntryForm> => {
    const errors: Partial<EntryForm> = {};
    if (!form.summary.trim()) errors.summary = 'Vui lòng nhập tóm tắt công việc.';
    if (!form.plan.trim())    errors.plan    = 'Vui lòng nhập kế hoạch tuần tới.';
    return errors;
  };

  const handleSubmitEntry = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);
    createProgress.mutate(
      {
        topicId,
        weekNumber: CURRENT_WEEK,
        weekLabel:  `Tuần ${CURRENT_WEEK} (28/04 - 04/05)`,
        summary:    form.summary,
        plan:       form.plan,
        percentage: form.percentage,
        fileName:   form.fileName || undefined
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          setForm({ summary: '', plan: '', percentage: 0, fileName: '' });
          setFormErrors({});
        }
      }
    );
  };

  const handleComment = (entryId: string) => {
    const text = commentText[entryId]?.trim();
    if (!text) return;
    addCommentMutation.mutate(
      { entryId, content: text },
      { onSuccess: () => setCommentText((c) => ({ ...c, [entryId]: '' })) }
    );
  };

  const handleToggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (isLoading) return (
    <PageWrapper title="Theo dõi Tiến độ">
      <LoadingSpinner />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Theo dõi Tiến độ"
      description={myReg?.topic?.title ?? 'Chưa có đề tài'}
      action={
        !hasCurrentWeek && topicId && isRegApproved ? (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Cập nhật tuần này
          </Button>
        ) : undefined
      }
    >
      {/* Overall progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Tiến độ tổng thể</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {myEntries.length} tuần đã cập nhật
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>Bắt đầu</span>
          <span>Hoàn thành</span>
        </div>
      </div>

      {/* No topic */}
      {!topicId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm font-medium text-gray-500">Bạn chưa có đề tài</p>
          <p className="mt-1 text-xs text-gray-400">
            Hãy đăng ký đề tài để bắt đầu theo dõi tiến độ
          </p>
        </div>
      )}

      {/* Pending approval */}
      {topicId && !isRegApproved && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50 py-16">
          <p className="text-sm font-medium text-amber-900">
            Đơn đăng ký chưa được duyệt
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Chờ giảng viên phê duyệt để bắt đầu cập nhật tiến độ
          </p>
        </div>
      )}

      {/* Timeline */}
      {topicId && isRegApproved && (
        <div className="flex flex-col gap-3">
          {!hasCurrentWeek && (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              onClick={() => setModalOpen(true)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tuần {CURRENT_WEEK} (28/04 - 04/05)
                </p>
                <p className="text-xs text-gray-400">
                  Nhấn để cập nhật tiến độ tuần này
                </p>
              </div>
            </div>
          )}

          {[...myEntries].reverse().map((entry: ProgressEntry) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              expanded={expandedId === entry._id}
              onToggle={() => handleToggle(entry._id)}
              isLecturer={false}
              commentText={commentText[entry._id] ?? ''}
              onCommentChange={(text) =>
                setCommentText((c) => ({ ...c, [entry._id]: text }))
              }
              onCommentSubmit={() => handleComment(entry._id)}
              onMarkSeen={() => markSeenMutation.mutate(entry._id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setFormErrors({}); }}
        title="Cập nhật tiến độ"
        description={`Tuần ${CURRENT_WEEK} (28/04 - 04/05)`}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tóm tắt công việc đã làm <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.summary}
              onChange={(e) => {
                setForm((f) => ({ ...f, summary: e.target.value }));
                setFormErrors((fe) => ({ ...fe, summary: '' }));
              }}
              rows={3}
              placeholder="Mô tả những gì bạn đã hoàn thành trong tuần này..."
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2',
                formErrors.summary
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              )}
            />
            {formErrors.summary && (
              <p className="text-xs text-red-500">{formErrors.summary}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Kế hoạch tuần tới <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.plan}
              onChange={(e) => {
                setForm((f) => ({ ...f, plan: e.target.value }));
                setFormErrors((fe) => ({ ...fe, plan: '' }));
              }}
              rows={3}
              placeholder="Bạn dự định làm gì trong tuần tới..."
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2',
                formErrors.plan
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              )}
            />
            {formErrors.plan && (
              <p className="text-xs text-red-500">{formErrors.plan}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">% Hoàn thành</label>
              <span className="text-sm font-bold text-blue-600">{form.percentage}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={form.percentage}
              placeholder="d"
              onChange={(e) =>
                setForm((f) => ({ ...f, percentage: Number(e.target.value) }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">File báo cáo</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 text-sm text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50">
              <Upload className="h-5 w-5 text-gray-400" />
              <span>
                {form.fileName || 'Kéo thả hoặc click để chọn file PDF/DOCX (tối đa 20MB)'}
              </span>
              <input
                type="file" accept=".pdf,.docx" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm((f) => ({ ...f, fileName: file.name }));
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => { setModalOpen(false); setFormErrors({}); }}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmitEntry} loading={createProgress.isPending}>
            Lưu tiến độ
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}