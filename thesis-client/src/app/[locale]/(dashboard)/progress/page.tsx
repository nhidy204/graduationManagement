'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTopicProgress, useAddComment, useMarkSeen } from '@/features/progress/hooks/useProgress';
import { useTopics } from '@/features/topics/hooks/useTopics';
import { useAuthStore } from '@/features/auth/store/authStore';
import { StudentProgress } from './StudentProgress';
import { EntryCard } from './EntryCard';
import type { ProgressEntry } from '@/features/progress/types/progress.types';
import type { Topic } from '@/features/topics/types/topic.types';

// ── Lecturer: progress từng topic ──
function LecturerTopicProgress({
  topicId,
  commentText,
  expandedId,
  onToggle,
  onCommentChange,
  onCommentSubmit,
  onMarkSeen,
}: {
  topicId: string;
  commentText: Record<string, string>;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onCommentChange: (id: string, text: string) => void;
  onCommentSubmit: (id: string) => void;
  onMarkSeen: (id: string) => void;
}) {
  const { data: entries = [], isLoading } = useTopicProgress(topicId);

  if (isLoading) return <LoadingSpinner />;

  if (entries.length === 0) return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
      <p className="text-xs text-gray-400">Chưa có cập nhật tiến độ nào</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {[...entries].reverse().map((entry: ProgressEntry) => (
        <EntryCard
          key={entry._id}
          entry={entry}
          expanded={expandedId === entry._id}
          onToggle={() => onToggle(entry._id)}
          isLecturer={true}
          commentText={commentText[entry._id] ?? ''}
          onCommentChange={(text) => onCommentChange(entry._id, text)}
          onCommentSubmit={() => onCommentSubmit(entry._id)}
          onMarkSeen={() => onMarkSeen(entry._id)}
        />
      ))}
    </div>
  );
}

// ── Lecturer: tất cả topics ──
function LecturerProgress({ lecturerId }: { lecturerId: string }) {
  const { data: topicsData, isLoading } = useTopics({
    supervisorId: lecturerId,
    limit: 100
  });

  const addCommentMutation = useAddComment();
  const markSeenMutation   = useMarkSeen();

  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const topicList: Topic[] = topicsData?.data ?? [];

  const handleComment = (entryId: string) => {
    const text = commentText[entryId]?.trim();
    if (!text) return;
    addCommentMutation.mutate(
      { entryId, content: text },
      { onSuccess: () => setCommentText((c) => ({ ...c, [entryId]: '' })) }
    );
  };

  const handleToggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (isLoading) return (
    <PageWrapper title="Theo dõi Tiến độ">
      <LoadingSpinner />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Theo dõi Tiến độ"
      description="Tiến độ sinh viên theo từng đề tài"
    >
      {topicList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">Bạn chưa có đề tài nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {topicList.map((topic: Topic) => (
            <div key={topic._id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{topic.title}</h3>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  {topic.major}
                </span>
              </div>
              <LecturerTopicProgress
                topicId={topic._id}
                commentText={commentText}
                expandedId={expandedId}
                onToggle={handleToggle}
                onCommentChange={(id, text) =>
                  setCommentText((c) => ({ ...c, [id]: text }))
                }
                onCommentSubmit={handleComment}
                onMarkSeen={(id) => markSeenMutation.mutate(id)}
              />
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

// ── Main page — chỉ routing theo role ──
export default function ProgressPage() {
  const user       = useAuthStore((s) => s.user);
  const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';

  if (isLecturer) {
    return <LecturerProgress lecturerId={user?._id as string ?? ''} />;
  }

  return <StudentProgress />;
}