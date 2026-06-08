'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateTopic } from '@/features/topics/hooks/useTopics';
import { cn } from '@/lib/utils';
import type { CreateTopicDto } from '@/features/topics/types/topic.types';

const MAJOR_OPTIONS = [
  'Kỹ thuật phần mềm',
  'Khoa học dữ liệu',
  'An toàn thông tin',
  'Mạng máy tính',
  'Công nghệ thông tin',
  'Trí tuệ nhân tạo',
];

export default function NewTopicPage() {
  const router = useRouter();
  const locale = useLocale();
  const { mutate: createTopic, isPending: loading } = useCreateTopic();

  const [form, setForm] = useState<Partial<CreateTopicDto>>({
    title: '',
    description: '',
    requirements: '',
    major: '',
    skills: [],
    maxStudents: 2,
    status: 'DRAFT',
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof CreateTopicDto, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (!(form.skills ?? []).includes(s)) {
      set('skills', [...(form.skills ?? []), s]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) =>
    set('skills', (form.skills ?? []).filter((s) => s !== skill));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Vui lòng nhập tiêu đề';
    if (!form.description?.trim()) e.description = 'Vui lòng nhập mô tả';
    if (!form.major?.trim()) e.major = 'Vui lòng chọn ngành';
    if (!form.maxStudents || form.maxStudents < 1) e.maxStudents = 'Số sinh viên tối thiểu là 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createTopic(form as CreateTopicDto, {
      onSuccess: () => router.push(`/${locale}/topics`),
    });
  };

  return (
    <PageWrapper title="Tạo đề tài mới">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${locale}/topics`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tiêu đề đề tài <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={form.title ?? ''}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Nhập tiêu đề đề tài"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Mô tả nội dung, mục tiêu của đề tài..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Requirements */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Yêu cầu sinh viên</label>
              <textarea
                value={form.requirements ?? ''}
                onChange={(e) => set('requirements', e.target.value)}
                placeholder="Các kiến thức, kỹ năng yêu cầu..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Major */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ngành học <span className="text-red-500">*</span>
              </label>
              <select
                value={form.major ?? ''}
                onChange={(e) => set('major', e.target.value)}
                aria-label="Chọn ngành học"
                className={cn(
                  'h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                  !form.major && 'text-gray-400'
                )}
              >
                <option value="">— Chọn ngành —</option>
                {MAJOR_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__custom">Khác (nhập thủ công)</option>
              </select>
              {form.major === '__custom' && (
                <Input
                  placeholder="Nhập tên ngành..."
                  onChange={(e) => set('major', e.target.value)}
                />
              )}
              {errors.major && <p className="text-xs text-red-500">{errors.major}</p>}
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Kỹ năng cần có</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Nhập kỹ năng rồi Enter..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(form.skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {(form.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {skill}
                      <button
  type="button"
  title={`Xóa ${skill}`}
  onClick={() => removeSkill(skill)}
  className="hover:text-red-500"
>
  <X className="h-3 w-3" />
</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Max students + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Số sinh viên tối đa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={form.maxStudents ?? 2}
                  onChange={(e) => set('maxStudents', parseInt(e.target.value, 10))}
                  min="1"
                  max="10"
                />
                {errors.maxStudents && <p className="text-xs text-red-500">{errors.maxStudents}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={form.status ?? 'DRAFT'}
                  onChange={(e) => set('status', e.target.value)}
                  aria-label="Chọn trạng thái"
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Công bố</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button type="submit" loading={loading}>
                Tạo đề tài
              </Button>
              <Link href={`/${locale}/topics`}>
                <Button type="button" variant="outline">Hủy</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}