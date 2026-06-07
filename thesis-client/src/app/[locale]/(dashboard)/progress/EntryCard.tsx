'use client';

import {
  CheckCircle2, MessageSquare, FileText,
  ChevronDown, ChevronUp, Send, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatDateTime } from '@/lib/utils';
import type { ProgressEntry } from '@/features/progress/types/progress.types';

interface EntryCardProps {
  entry: ProgressEntry;
  expanded: boolean;
  onToggle: () => void;
  isLecturer: boolean;
  commentText: string;
  onCommentChange: (text: string) => void;
  onCommentSubmit: () => void;
  onMarkSeen: () => void;
}

export function EntryCard({
  entry, expanded, onToggle, isLecturer,
  commentText, onCommentChange, onCommentSubmit, onMarkSeen
}: EntryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          entry.seenByLecturer ? 'bg-green-100' : 'bg-orange-100'
        )}>
          <CheckCircle2 className={cn(
            'h-4 w-4',
            entry.seenByLecturer ? 'text-green-600' : 'text-orange-500'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{entry.weekLabel}</p>
            {isLecturer && entry.student?.name && (
  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
    {entry.student.name}
  </span>
)}
            {!entry.seenByLecturer && !isLecturer && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                Chưa có nhận xét
              </span>
            )}
            {entry.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageSquare className="h-3 w-3" />
                {entry.comments.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400 truncate">{entry.summary}</p>
        </div>

        <div className="hidden items-center gap-3 md:flex shrink-0">
          <div className="w-24 h-1.5 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-blue-500"
              style={{ width: `${entry.percentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 w-8">
            {entry.percentage}%
          </span>
        </div>

        {expanded
          ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        }
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Đã làm</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{entry.summary}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Kế hoạch tới</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{entry.plan}</p>
            </div>
          </div>

          {entry.fileName && (
            <div className="mt-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              
                href={entry.fileUrl ?? '#'}
              <a href={entry.fileUrl} className="text-sm text-blue-600 hover:underline">
  {entry.fileName}
</a>
            </div>
          )}

          {isLecturer && !entry.seenByLecturer && (
            <button
              onClick={onMarkSeen}
              className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Đánh dấu đã xem
            </button>
          )}
          {isLecturer && entry.seenByLecturer && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
              <EyeOff className="h-3.5 w-3.5" />
              Đã xem
            </p>
          )}

          {entry.comments.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-400">Nhận xét</p>
              {entry.comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    c.author.role === 'LECTURER'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  )}>
                    {c.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">
                        {c.author.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onCommentSubmit();
                }
              }}
              placeholder={
                isLecturer
                  ? 'Thêm nhận xét cho sinh viên...'
                  : 'Hỏi hoặc trả lời giảng viên...'
              }
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Button
              size="sm"
              variant={commentText.trim() ? 'primary' : 'outline'}
              onClick={onCommentSubmit}
              disabled={!commentText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}