'use client';

import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Star, Lock } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { gradingApi } from '@/features/grading/api/gradingApi';
import { cn } from '@/lib/utils';
import type { GradeCriteria } from '@/features/grading/types/grading.types';

export default function ResultsPage() {
  const user = useAuthStore((s) => s.user);
  const [expandedSection, setExpandedSection] = useState<'supervisor' | 'reviewer' | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['student-result', user?._id],
    queryFn: () => gradingApi.getStudentResult(String(user!._id)),
    enabled: !!user?._id,
  });

  if (isLoading) return <PageWrapper title="Kết quả điểm"><LoadingSpinner /></PageWrapper>;

  if (!result?.published) {
    return (
      <PageWrapper title="Kết quả điểm">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-28">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Kết quả chưa được công bố</p>
          <p className="mt-1 text-xs text-gray-400">
            Điểm sẽ hiển thị sau khi hội đồng phê duyệt và admin công bố kết quả
          </p>
        </div>
      </PageWrapper>
    );
  }

  const getGrade = (score: number) => {
    if (score >= 9) return { label: 'Xuất sắc', color: 'text-emerald-600' };
    if (score >= 8) return { label: 'Giỏi', color: 'text-blue-600' };
    if (score >= 7) return { label: 'Khá', color: 'text-indigo-600' };
    if (score >= 5) return { label: 'Trung bình', color: 'text-yellow-600' };
    return { label: 'Không đạt', color: 'text-red-600' };
  };

  const final = result.finalScore ?? result.supervisorScore;
  const grade = getGrade(final ?? 0);

  return (
    <PageWrapper title="Kết quả Khóa luận">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-300" />
              <p className="text-sm font-medium text-blue-200">Điểm tổng kết</p>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-6xl font-bold">
                {final !== null && final !== undefined ? final.toFixed(2) : '—'}
              </span>
              <span className="mb-2 text-xl text-blue-200">/10</span>
            </div>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              {grade.label}
            </span>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            <ScoreRow
              label="Điểm hướng dẫn (60%)"
              value={result.supervisorScore}
              weighted={result.supervisorScore !== null ? result.supervisorScore * 0.6 : null}
            />
            <div className="h-px bg-white/20" />
            <ScoreRow
              label="Điểm phản biện (40%)"
              value={result.reviewerScore}
              weighted={result.reviewerScore !== null ? result.reviewerScore * 0.4 : null}
            />
            <div className="h-px bg-white/20" />
            <ScoreRow label="Tổng" value={final ?? null} weighted={null} bold />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {result.supervisorCriteria.length > 0 && (
          <DetailSection
            title="Chi tiết điểm Hướng dẫn"
            score={result.supervisorScore ?? 0}
            criteria={result.supervisorCriteria}
            type="supervisor"
            expanded={expandedSection === 'supervisor'}
            onToggle={() => setExpandedSection(expandedSection === 'supervisor' ? null : 'supervisor')}
          />
        )}
        {result.reviewerCriteria.length > 0 && (
          <DetailSection
            title="Chi tiết điểm Phản biện"
            score={result.reviewerScore ?? 0}
            criteria={result.reviewerCriteria}
            type="reviewer"
            expanded={expandedSection === 'reviewer'}
            onToggle={() => setExpandedSection(expandedSection === 'reviewer' ? null : 'reviewer')}
          />
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Liên hệ phòng đào tạo để nhận phiếu điểm chính thức có chữ ký.
      </p>
    </PageWrapper>
  );
}

function ScoreRow({ label, value, weighted, bold = false }: {
  label: string;
  value: number | null;
  weighted: number | null;
  bold?: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4', bold && 'font-bold')}>
      <span className={cn('text-xs text-blue-200', bold && 'text-white')}>{label}</span>
      <span className={cn('text-sm text-white tabular-nums', bold && 'text-lg')}>
        {value === null
          ? '—'
          : weighted !== null
          ? `${value.toFixed(1)} → ${weighted.toFixed(2)}`
          : value.toFixed(2)
        }
      </span>
    </div>
  );
}

function DetailSection({ title, score, criteria, type, expanded, onToggle }: {
  title: string;
  score: number;
  criteria: GradeCriteria[];
  type: 'supervisor' | 'reviewer';
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg',
            type === 'supervisor' ? 'bg-blue-100' : 'bg-purple-100'
          )}>
            <Star className={cn('h-4 w-4',
              type === 'supervisor' ? 'text-blue-600' : 'text-purple-600'
            )} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className={cn('text-xs font-medium',
              type === 'supervisor' ? 'text-blue-600' : 'text-purple-600'
            )}>
              {score.toFixed(2)}/10
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-24 md:block">
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={cn('h-1.5 rounded-full transition-all',
                  type === 'supervisor' ? 'bg-blue-500' : 'bg-purple-500'
                )}
                style={{ width: `${(score / 10) * 100}%` }}
              />
            </div>
          </div>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex flex-col gap-2">
            {criteria.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500">
                      {Math.round(c.weight * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="w-16 h-1.5 rounded-full bg-gray-200">
                    <div
                      className={cn('h-1.5 rounded-full',
                        type === 'supervisor' ? 'bg-blue-500' : 'bg-purple-500'
                      )}
                      style={{ width: `${((c.score ?? 0) / 10) * 100}%` }}
                    />
                  </div>
                  <div className="text-right min-w-[52px]">
                    <p className="text-sm font-bold text-gray-900">{c.score?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-gray-400">→ {((c.score ?? 0) * c.weight).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className={cn('flex items-center justify-between rounded-xl p-3 mt-1',
              type === 'supervisor' ? 'bg-blue-50' : 'bg-purple-50'
            )}>
              <p className={cn('text-sm font-semibold',
                type === 'supervisor' ? 'text-blue-800' : 'text-purple-800'
              )}>
                Tổng điểm
              </p>
              <p className={cn('text-lg font-bold',
                type === 'supervisor' ? 'text-blue-700' : 'text-purple-700'
              )}>
                {score.toFixed(2)}/10
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}