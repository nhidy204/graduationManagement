'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface RejectModalProps {
  open: boolean;
  studentName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectModal({ open, studentName, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return setError('Vui lòng nhập lý do từ chối.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm(reason.trim());
    setReason('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Từ chối đăng ký"
      description={`Sinh viên: ${studentName}`}
      size="sm"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Lý do từ chối <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          rows={4}
          placeholder="Nhập lý do để sinh viên biết và cải thiện..."
          className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm
            placeholder:text-gray-400 focus:outline-none focus:ring-2
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Huỷ
        </Button>
        <Button variant="danger" onClick={handleConfirm} loading={loading}>
          Xác nhận từ chối
        </Button>
      </div>
    </Modal>
  );
}