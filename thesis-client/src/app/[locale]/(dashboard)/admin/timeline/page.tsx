'use client';

import { useState } from 'react';
import {
  Calendar, Plus, Trash2, Edit3,
  CheckCircle2, Clock, CalendarDays
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAdminStore } from '@/features/admin/store/adminStore';
import { useToast } from '@/components/ui/Toast';
import { formatDate, cn } from '@/lib/utils';
import type { TimelineMilestone } from '@/features/admin/types/admin.types';

const TYPE_UI: Record<TimelineMilestone['type'], { label: string; color: string; bg: string }> = {
  REGISTRATION: { label: 'Đăng ký',      color: 'text-blue-700',   bg: 'bg-blue-100' },
  MIDTERM:      { label: 'Giữa kỳ',      color: 'text-indigo-700', bg: 'bg-indigo-100' },
  FINAL:        { label: 'Cuối kỳ',      color: 'text-purple-700', bg: 'bg-purple-100' },
  DEFENSE:      { label: 'Bảo vệ',       color: 'text-orange-700', bg: 'bg-orange-100' },
  RESULT:       { label: 'Kết quả',      color: 'text-green-700',  bg: 'bg-green-100' },
};

const EMPTY_FORM: Omit<TimelineMilestone, '_id'> = {
  name: '', startDate: '', endDate: '',
  description: '', type: 'REGISTRATION'
};

export default function TimelinePage() {
  const { milestones, updateMilestone, addMilestone, deleteMilestone } = useAdminStore();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TimelineMilestone | null>(null);
  const [form, setForm] = useState<Omit<TimelineMilestone, '_id'>>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<TimelineMilestone | null>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const getMilestoneStatus = (m: TimelineMilestone) => {
    if (today > m.endDate) return 'done';
    if (today >= m.startDate) return 'active';
    return 'upcoming';
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (m: TimelineMilestone) => {
    setEditTarget(m);
    setForm({ name: m.name, startDate: m.startDate, endDate: m.endDate, description: m.description, type: m.type });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      updateMilestone(editTarget._id, form);
      toast('Đã cập nhật mốc thời gian.', 'success');
    } else {
      addMilestone(form);
      toast('Đã thêm mốc thời gian mới.', 'success');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMilestone(deleteTarget._id);
    setDeleteTarget(null);
    toast('Đã xóa mốc thời gian.', 'success');
  };

  const sorted = [...milestones].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <PageWrapper
      title="Quản lý Timeline"
      description="Thiết lập các mốc thời gian trong học kỳ"
      action={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Thêm mốc
        </Button>
      }
    >
      {/* Calendar overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">Tổng quan học kỳ</p>
        </div>

        {/* Visual timeline bar */}
        <div className="relative">
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {sorted.map((m, i) => {
              const status = getMilestoneStatus(m);
              const ui = TYPE_UI[m.type];
              return (
                <div key={m._id} className="flex items-center">
                  {i > 0 && (
                    <div className={cn(
                      'h-0.5 w-8 shrink-0',
                      status === 'done' ? 'bg-green-300' : 'bg-gray-200'
                    )} />
                  )}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      status === 'done'    ? 'bg-green-100' :
                      status === 'active'  ? 'bg-blue-100 ring-2 ring-blue-400 ring-offset-2' :
                      ui.bg
                    )}>
                      {status === 'done'
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : status === 'active'
                        ? <Clock className="h-4 w-4 text-blue-600" />
                        : <Calendar className={cn('h-4 w-4', ui.color)} />
                      }
                    </div>
                    <span className="max-w-[72px] text-center text-xs text-gray-500 leading-tight">
                      {m.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((m) => {
          const status = getMilestoneStatus(m);
          const ui = TYPE_UI[m.type];

          return (
            <div
              key={m._id}
              className={cn(
                'rounded-xl border bg-white p-5 transition-all',
                status === 'active'   ? 'border-blue-300 shadow-sm' :
                status === 'done'     ? 'border-gray-200 opacity-70' :
                'border-gray-200'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status icon */}
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5',
                    status === 'done'   ? 'bg-green-100' :
                    status === 'active' ? 'bg-blue-100' : ui.bg
                  )}>
                    {status === 'done'
                      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                      : status === 'active'
                      ? <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                      : <Calendar className={cn('h-4 w-4', ui.color)} />
                    }
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', ui.bg, ui.color)}>
                        {ui.label}
                      </span>
                      {status === 'active' && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                          Đang diễn ra
                        </span>
                      )}
                      {status === 'done' && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          Đã kết thúc
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{m.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(m.startDate)}</span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(m.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(m)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    aria-label="Edit milestone"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Chỉnh sửa mốc thời gian' : 'Thêm mốc thời gian'}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên mốc"
            placeholder="VD: Nộp báo cáo cuối kỳ"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="milestone-type" className="text-sm font-medium text-gray-700">Loại mốc</label>
            <select
              id="milestone-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TimelineMilestone['type'] }))}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Object.entries(TYPE_UI).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Mô tả ngắn về mốc thời gian này..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!form.name || !form.startDate || !form.endDate}
          >
            {editTarget ? 'Cập nhật' : 'Thêm mốc'}
          </Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xóa mốc thời gian"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Xóa mốc{' '}
          <span className="font-semibold text-gray-900">&quot;{deleteTarget?.name}&quot;</span>?
          Hành động này không thể hoàn tác.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}