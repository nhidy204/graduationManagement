'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAJORS, SUPERVISORS } from '../mock/topics.mock';
import type { TopicFilters } from '../types/topic.types';

const STATUSES = [
  { value: 'PUBLISHED', label: 'Còn nhận' },
  { value: 'FULL',      label: 'Đã đủ' },
  { value: 'CLOSED',    label: 'Đã đóng' }
];

interface TopicFilterProps {
  filters: TopicFilters;
  onChange: (filters: TopicFilters) => void;
}

export function TopicFilter({ filters, onChange }: TopicFilterProps) {
  const set = (key: keyof TopicFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasActiveFilter =
    filters.major || filters.status || filters.supervisorId;

  const reset = () =>
    onChange({ search: filters.search, major: '', status: '', supervisorId: '' });

  return (
    <aside className="flex w-full flex-col gap-5 lg:w-56 shrink-0">
      {/* Search — mobile only (desktop search is in FilterBar) */}
      <div className="relative lg:hidden">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm đề tài..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Bộ lọc</p>
          {hasActiveFilter && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <X className="h-3 w-3" /> Xóa lọc
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {/* Major */}
          <FilterSection title="Ngành">
            {MAJORS.map((m) => (
              <FilterChip
                key={m}
                label={m}
                active={filters.major === m}
                onClick={() => set('major', filters.major === m ? '' : m)}
              />
            ))}
          </FilterSection>

          {/* Status */}
          <FilterSection title="Trạng thái">
            {STATUSES.map((s) => (
              <FilterChip
                key={s.value}
                label={s.label}
                active={filters.status === s.value}
                onClick={() => set('status', filters.status === s.value ? '' : s.value)}
              />
            ))}
          </FilterSection>

          {/* Supervisor */}
          <FilterSection title="Giảng viên">
            {SUPERVISORS.map((sv) => (
              <FilterChip
                key={sv._id}
                label={sv.name}
                active={filters.supervisorId === sv._id}
                onClick={() => set('supervisorId', filters.supervisorId === sv._id ? '' : sv._id)}
              />
            ))}
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-left text-xs transition-colors',
        active
          ? 'bg-blue-50 font-medium text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {label}
    </button>
  );
}