'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRegistrationStore } from '../store/registrationStore';
import { registrationsApi } from '../api/registrationsApi';
import type { Topic } from '@/features/topics/types/topic.types';
import type { ApiError } from '@/types/api.types';

interface RegisterModalProps {
  topic: Topic;
  open: boolean;
  onClose: () => void;
}

export function RegisterModal({ topic, open, onClose }: RegisterModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useRegistrationStore();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Call the actual API to create registration
      await registrationsApi.create(String(topic._id), note);
      // Update local state
      register(String(topic._id));
      onClose();
      toast('Đã nộp đơn đăng ký! Chờ giảng viên duyệt.', 'success');
    } catch (error) {
      const err = error as ApiError;
      const message = err?.response?.data?.message ?? 'Có lỗi xảy ra';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng ký Đề tài"
      description="Xác nhận đăng ký đề tài bên dưới"
      size="md"
    >
      {/* Topic summary */}
      <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-500">Đề tài</p>
        <p className="mt-1 text-sm font-semibold text-gray-900 leading-snug">
          {topic.title}
        </p>
        <p className="mt-1 text-xs text-gray-500">{topic.supervisor.name}</p>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Lý do đăng ký
          <span className="ml-1 text-xs font-normal text-gray-400">(không bắt buộc)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Chia sẻ mục tiêu và lý do bạn chọn đề tài này..."
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="text-right text-xs text-gray-400">{note.length}/500</p>
      </div>

      {/* Notice */}
      <p className="mt-3 text-xs text-gray-400">
        Lưu ý: Bạn chỉ được đăng ký một đề tài. Đơn có thể huỷ trước khi giảng viên duyệt.
      </p>

      {/* Actions */}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Huỷ
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          Xác nhận đăng ký
        </Button>
      </div>
    </Modal>
  );
}