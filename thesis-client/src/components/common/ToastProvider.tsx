'use client';

import { Toast, useToastStore } from '@/components/ui/Toast';

export function ToastProvider() {
  const { message, type, visible, hide } = useToastStore();
  if (!visible) return null;
  return <Toast message={message} type={type} onClose={hide} />;
}