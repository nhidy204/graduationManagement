import { create } from 'zustand';
import type { AdminUser, ReviewerAssignment, TimelineMilestone } from '../types/admin.types';
import { MOCK_USERS, MOCK_ASSIGNMENTS, MOCK_MILESTONES } from '../mock/admin.mock';

interface AdminStore {
  users: AdminUser[];
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;

  assignments: ReviewerAssignment[];
  setReviewer: (topicId: string, reviewerId: string | null) => void;

  milestones: TimelineMilestone[];
  updateMilestone: (id: string, data: Partial<TimelineMilestone>) => void;
  addMilestone: (m: Omit<TimelineMilestone, '_id'>) => void;
  deleteMilestone: (id: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  users: MOCK_USERS,
  toggleUserStatus: (id) =>
    set((s) => ({
      users: s.users.map((u) =>
        u._id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : u
      )
    })),
  deleteUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u._id !== id) })),

  assignments: MOCK_ASSIGNMENTS,
  setReviewer: (topicId, reviewerId) =>
    set((s) => ({
      assignments: s.assignments.map((a) =>
        a.topicId === topicId ? { ...a, reviewerId } : a
      )
    })),

  milestones: MOCK_MILESTONES,
  updateMilestone: (id, data) =>
    set((s) => ({
      milestones: s.milestones.map((m) => (m._id === id ? { ...m, ...data } : m))
    })),
  addMilestone: (m) =>
    set((s) => ({
      milestones: [...s.milestones, { ...m, _id: `m${Date.now()}` }]
    })),
  deleteMilestone: (id) =>
    set((s) => ({ milestones: s.milestones.filter((m) => m._id !== id) }))
}));