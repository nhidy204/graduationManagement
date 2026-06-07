'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto close sau 3.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg',
      'transition-all duration-300',
      visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      type === 'success' ? 'border-green-200' : 'border-red-200'
    )}>
      {type === 'success'
        ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      }
      <p className="text-sm text-gray-700">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Hook dùng Toast dễ hơn ──
import { useCallback } from 'react';
import { create } from 'zustand';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'success',
  visible: false,
  show: (message, type = 'success') => set({ message, type, visible: true }),
  hide: () => set({ visible: false })
}));

export function useToast() {
  const { show } = useToastStore();
  const toast = useCallback((message: string, type: ToastType = 'success') => {
    show(message, type);
  }, [show]);
  return { toast };
}