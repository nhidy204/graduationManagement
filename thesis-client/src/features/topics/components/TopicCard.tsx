import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Users, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Topic, TopicStatus } from '../types/topic.types';

const STATUS_MAP: Record<TopicStatus, { label: string; variant: 'available' | 'full' | 'closed' | 'draft' }> = {
  PUBLISHED: { label: 'Còn nhận', variant: 'available' },
  FULL:      { label: 'Đã đủ',    variant: 'full' },
  CLOSED:    { label: 'Đã đóng',  variant: 'closed' },
  DRAFT:     { label: 'Nháp',     variant: 'draft' }
};

export function TopicCard({ topic }: { topic: Topic }) {
  const locale  = useLocale();
  const status  = STATUS_MAP[topic.status];
  const spotsLeft = topic.maxStudents - topic.currentStudents;
  const topicId = String(topic._id);

  return (
    <Link href={`/${locale}/topics/${topicId}`}>
      <div className={cn(
        'group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5',
        'transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-sm font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2 flex-1">
          {topic.description}
        </p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {skill}
            </span>
          ))}
          {topic.skills.length > 3 && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              +{topic.skills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {topic.supervisor.name.charAt(0)}
            </div>
            <span className="max-w-[130px] truncate text-xs text-gray-500">
              {topic.supervisor.name}
            </span>
          </div>

          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            spotsLeft > 0 ? 'text-green-600' : 'text-gray-400'
          )}>
            <Users className="h-3.5 w-3.5" />
            <span>{topic.currentStudents}/{topic.maxStudents}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}