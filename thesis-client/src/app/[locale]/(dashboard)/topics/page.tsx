'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { TopicCard } from '@/features/topics/components/TopicCard';
import { TopicFilter } from '@/features/topics/components/TopicFilter';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTopics } from '@/features/topics/hooks/useTopics';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Topic, TopicFilters } from '@/features/topics/types/topic.types';

export default function TopicsPage() {
  const locale = useLocale();
  const user   = useAuthStore((s) => s.user);

  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters]       = useState<TopicFilters>({
    search: '', major: '', status: '', supervisorId: ''
  });

  const { data: topicsData, isLoading } = useTopics({
    search:       filters.search       || undefined,
    major:        filters.major        || undefined,
    status:       filters.status       || undefined,
    supervisorId: filters.supervisorId || undefined
  });

  const topics: Topic[] = topicsData?.data ?? [];
  const total: number   = topicsData?.total ?? 0;

  return (
    <PageWrapper
      title="Danh sách Đề tài"
      description={`${total} đề tài`}
      action={
        (user?.role === 'LECTURER' || user?.role === 'ADMIN') && (
          <Link href={`/${locale}/topics/new`}>
            <Button size="md">
              <Plus className="h-4 w-4" />
              Tạo đề tài
            </Button>
          </Link>
        )
      }
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên đề tài..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => setShowFilter((v) => !v)}
          className="shrink-0 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Lọc
        </Button>
      </div>

      <div className="flex gap-6">
        <div className={showFilter ? 'block' : 'hidden lg:block'}>
          <TopicFilter filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1">
          {isLoading ? (
            <LoadingSpinner />
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <p className="text-sm font-medium text-gray-500">Không tìm thấy đề tài nào</p>
              <p className="mt-1 text-xs text-gray-400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}