'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateTopic } from '@/features/topics/hooks/useTopics';
import type { CreateTopicDto } from '@/features/topics/types/topic.types';

export default function NewTopicPage() {
  const router = useRouter();
  const locale = useLocale();
  const createTopicMutation = useCreateTopic();
  const { mutate: createTopic, isPending: loading } = createTopicMutation;
  
  const [formData, setFormData] = useState<Partial<CreateTopicDto>>({
    title: '',
    description: '',
    major: '',
    maxStudents: 2,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxStudents' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createTopic(formData as CreateTopicDto, {
      onSuccess: () => {
        router.push(`/${locale}/topics`);
      },
    });
  };

  return (
    <PageWrapper title="Tạo đề tài mới">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}/topics`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề đề tài
              </label>
              <Input
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề đề tài"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Nhập mô tả chi tiết về đề tài"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngành học
              </label>
              <Input
                name="major"
                value={formData.major || ''}
                onChange={handleInputChange}
                placeholder="Ví dụ: Công nghệ thông tin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng sinh viên tối đa
              </label>
              <Input
                type="number"
                name="maxStudents"
                value={formData.maxStudents || 2}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" loading={loading}>
                Tạo đề tài
              </Button>
              <Link href={`/${locale}/topics`}>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
