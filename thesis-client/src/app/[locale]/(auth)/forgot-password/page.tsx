'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, GraduationCap, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { authApi } from '@/features/auth/api/authApi';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError(t('errors.requiredEmail'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError(t('errors.invalidEmail'));

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">TMS</span>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <MailCheck className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Email đã được gửi</h2>
              <p className="mt-2 text-sm text-gray-500">{t('resetEmailSent')}</p>
              <Link
                href={`/${locale}/login`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToLogin')}
              </Link>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('resetPassword')}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Nhập email để nhận link đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label={t('email')}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  error={error}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  autoComplete="email"
                />
                <Button type="submit" size="lg" loading={loading} className="w-full">
                  {t('sendResetLink')}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}