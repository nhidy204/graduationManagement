'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const { login, isLoading } = useAuth();

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.email) next.email = t('errors.requiredEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t('errors.invalidEmail');
    if (!form.password) next.password = t('errors.requiredPassword');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(form.email, form.password);
    } catch {
      setErrors({ general: t('errors.invalidCredentials') });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-600 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">TMS</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Quản lý<br />Khóa luận<br />Tốt nghiệp
          </h1>
          <p className="mt-4 text-blue-200 text-base leading-relaxed">
            Nền tảng số hóa toàn bộ quy trình từ đăng ký đề tài,
            theo dõi tiến độ đến chấm điểm và phản biện.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { value: '500+', label: 'Đề tài' },
            { value: '1,200+', label: 'Sinh viên' },
            { value: '80+', label: 'Giảng viên' }
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">TMS</span>
          </div>
          <div className="hidden lg:block" />
          <LanguageSwitcher />
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('login')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('noAccount')}{' '}
                <Link
                  href={`/${locale}/register`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {t('registerNow')}
                </Link>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {t('loginDescription')}
              </p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label={t('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                error={errors.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
                }}
                autoComplete="email"
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {t('password')}
                  </label>
                  <Link
                    href={`/${locale}/forgot-password`}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={form.password}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, password: e.target.value }));
                      if (errors.password)
                        setErrors((err) => ({ ...err, password: undefined }));
                    }}
                    autoComplete="current-password"
                    className={`h-10 w-full rounded-lg border px-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400
                      transition-colors focus:outline-none focus:ring-2
                      ${errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                loading={isLoading}
                className="mt-2 w-full"
              >
                {t('loginButton')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}