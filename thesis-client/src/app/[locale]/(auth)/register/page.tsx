'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/api/authApi';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'LECTURER';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const locale          = useLocale();
  const router          = useRouter();
  const t               = useTranslations('auth');
  const { setAuth, setLoading, isLoading } = useAuth();
  const { toast }       = useToast();

  const [form, setForm] = useState<FormState>({
    name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT'
  });
  const [errors, setErrors]         = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim())
      next.name = t('errors.requiredName');
    if (!form.email)
      next.email = t('errors.requiredEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t('errors.invalidEmail');
    if (!form.password)
      next.password = t('errors.requiredPassword');
    else if (form.password.length < 6)
      next.password = t('errors.minPassword');
    if (!form.confirmPassword)
      next.confirmPassword = t('errors.requiredPassword');
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = t('errors.passwordMismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { accessToken, user } = await authApi.register({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role
      });
      setAuth(user, accessToken);
      toast(t('registerSuccess'), 'success');
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({
        general: error?.response?.data?.message ?? t('errorOccurred')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-600 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">TMS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Bắt đầu<br />hành trình<br />của bạn
          </h1>
          <p className="mt-4 text-blue-200 text-base leading-relaxed">
            Tạo tài khoản để đăng ký đề tài,
            theo dõi tiến độ và nhận phản hồi từ giảng viên.
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

      {/* ── Right panel ── */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">TMS</span>
          </div>
          <div className="hidden lg:block" />
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('registerTitle')}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href={`/${locale}/login`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {t('loginNow')}
                </Link>
              </p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">{t('role')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['STUDENT', 'LECTURER'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role }))}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all',
                        form.role === role
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {role === 'STUDENT' ? '🎓 ' + t('student') : '👨‍🏫 ' + t('lecturer')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <Input
                label={t('fullName')}
                type="text"
                placeholder={t('fullNamePlaceholder')}
                value={form.name}
                error={errors.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
                }}
                autoComplete="name"
              />

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">{t('password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={form.password}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, password: e.target.value }));
                      if (errors.password) setErrors((err) => ({ ...err, password: undefined }));
                    }}
                    className={cn(
                      'h-10 w-full rounded-lg border px-3 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2',
                      errors.password
                        ? 'border-red-400 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    )}
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) setErrors((err) => ({ ...err, confirmPassword: undefined }));
                    }}
                    className={cn(
                      'h-10 w-full rounded-lg border px-3 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2',
                      errors.confirmPassword
                        ? 'border-red-400 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                loading={isLoading}
                className="mt-2 w-full"
              >
                {t('registerButton')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}