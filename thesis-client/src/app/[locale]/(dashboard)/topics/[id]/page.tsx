'use client';

import { use, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, Users, BookOpen, Tag,
  Mail, Calendar, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { RegisterModal } from '@/features/registrations/components/RegisterModal';
import { useTopic } from '@/features/topics/hooks/useTopics';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRegistrationStore } from '@/features/registrations/store/registrationStore';
import { formatDate } from '@/lib/utils';
import type { TopicStatus } from '@/features/topics/types/topic.types';

const STATUS_MAP: Record<TopicStatus, { label: string; variant: 'available' | 'full' | 'closed' | 'draft' }> = {
  PUBLISHED: { label: 'Còn nhận sinh viên', variant: 'available' },
  FULL:      { label: 'Đã đủ sinh viên',    variant: 'full' },
  CLOSED:    { label: 'Đã đóng',            variant: 'closed' },
  DRAFT:     { label: 'Nháp',               variant: 'draft' }
};

const REG_STATUS_UI = {
  PENDING:  { label: 'Đang chờ duyệt', icon: Clock,         color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  APPROVED: { label: 'Đã được duyệt',  icon: CheckCircle2,  color: 'text-green-600 bg-green-50 border-green-200' },
  REJECTED: { label: 'Bị từ chối',     icon: XCircle,       color: 'text-red-600 bg-red-50 border-red-200' }
};

export default function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const myRegistrations = useRegistrationStore((s) => s.myRegistrations);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch the topic from API
  const { data: topic, isLoading, error } = useTopic(id);

  if (isLoading) {
    return (
      <PageWrapper title="">
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  if (error || !topic) {
    return (
      <PageWrapper title="Không tìm thấy đề tài">
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-gray-500">Đề tài không tồn tại hoặc đã bị xóa.</p>
          <Link href={`/${locale}/topics`}>
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const status = STATUS_MAP[topic.status];
  const spotsLeft = topic.maxStudents - topic.currentStudents;
  const myRegStatus = myRegistrations[topic._id];

  const canRegister =
    user?.role === 'STUDENT' &&
    topic.status === 'PUBLISHED' &&
    spotsLeft > 0 &&
    !myRegStatus;

  return (
    <PageWrapper title="">
      {/* Back */}
      <Link
        href={`/${locale}/topics`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách đề tài
      </Link>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-5">

          {/* Title card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(topic.createdAt)}
              </span>
            </div>

            <h1 className="mt-4 text-xl font-bold leading-snug text-gray-900">
              {topic.title}
            </h1>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap gap-4">
              <MetaItem icon={Tag} label={topic.major} />
              <MetaItem
                icon={Users}
                label={`${topic.currentStudents}/${topic.maxStudents} sinh viên`}
                highlight={spotsLeft > 0}
              />
            </div>
          </div>

          {/* Description */}
          <Section title="Mô tả đề tài">
            <p className="text-sm leading-relaxed text-gray-700">{topic.description}</p>
          </Section>

          {/* Requirements */}
          <Section title="Yêu cầu sinh viên">
            <p className="text-sm leading-relaxed text-gray-700">{topic.requirements}</p>
          </Section>

          {/* Skills */}
          <Section title="Kỹ năng cần có">
            <div className="flex flex-wrap gap-2">
              {topic.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4 lg:w-72 shrink-0">

          {/* Register card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Đăng ký đề tài</p>
              <div className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                spotsLeft > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                Còn {spotsLeft} chỗ
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${(topic.currentStudents / topic.maxStudents) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {topic.currentStudents}/{topic.maxStudents} vị trí đã được đăng ký
            </p>

            <div className="mt-4">
              {/* Hiển thị trạng thái đăng ký nếu có */}
              {myRegStatus ? (
                <RegStatusBanner status={myRegStatus} />
              ) : (
                <Button
                  className="w-full"
                  disabled={!canRegister}
                  onClick={() => setModalOpen(true)}
                >
                  {user?.role !== 'STUDENT'
                    ? 'Chỉ sinh viên mới đăng ký được'
                    : topic.status !== 'PUBLISHED'
                    ? 'Đề tài không mở đăng ký'
                    : spotsLeft === 0
                    ? 'Đã đủ sinh viên'
                    : 'Đăng ký ngay'}
                </Button>
              )}
            </div>
          </div>

          {/* Supervisor card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Giảng viên hướng dẫn
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {topic.supervisor.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{topic.supervisor.name}</p>
                <a
                  href={`mailto:${topic.supervisor.email}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                >
                  <Mail className="h-3 w-3" />
                  {topic.supervisor.email}
                </a>
              </div>
            </div>
          </div>

          {/* Timeline hint */}
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-medium text-orange-700">Deadline đăng ký</p>
            </div>
            <p className="mt-1 text-sm font-bold text-orange-800">30/05/2026</p>
            <p className="text-xs text-orange-500">Còn 22 ngày</p>
          </div>
        </div>
      </div>

      {/* Register modal */}
      <RegisterModal
        topic={topic}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </PageWrapper>
  );
}

// ── Sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function MetaItem({
  icon: Icon, label, highlight = false
}: { icon: React.ElementType; label: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className={`text-sm ${highlight ? 'font-medium text-green-600' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

function RegStatusBanner({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const ui = REG_STATUS_UI[status];
  const Icon = ui.icon;
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${ui.color}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{ui.label}</span>
    </div>
  );
}