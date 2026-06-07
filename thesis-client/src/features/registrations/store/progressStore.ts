import { create } from 'zustand';
import type { ProgressEntry, ProgressComment } from '@/features/progress/types/progress.types';
import { MOCK_PROGRESS } from '@/features/progress/mock/progress.mock';

interface ProgressStore {
  entries: ProgressEntry[];
  addEntry: (entry: Omit<ProgressEntry, '_id' | 'comments' | 'seenByLecturer' | 'createdAt'>) => void;
  addComment: (entryId: string, comment: Omit<ProgressComment, '_id' | 'createdAt'>) => void;
  markSeen: (entryId: string) => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  entries: MOCK_PROGRESS,

  addEntry: (entry) =>
    set((s) => ({
      entries: [
        ...s.entries,
        {
          ...entry,
          _id: `p${Date.now()}`,
          comments: [],
          seenByLecturer: false,
          createdAt: new Date().toISOString()
        }
      ]
    })),

  addComment: (entryId, comment) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e._id === entryId
          ? {
              ...e,
              comments: [
                ...e.comments,
                { ...comment, _id: `c${Date.now()}`, createdAt: new Date().toISOString() }
              ]
            }
          : e
      )
    })),

  markSeen: (entryId) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e._id === entryId ? { ...e, seenByLecturer: true } : e
      )
    }))
}));