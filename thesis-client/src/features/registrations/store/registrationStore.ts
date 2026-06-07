import { create } from 'zustand';
import type { Registration } from '../types/registration.types';
import { MOCK_REGISTRATIONS } from '../mock/registrations.mock';

interface RegistrationStore {
  // Student side
  myRegistrations: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'>;
  register: (topicId: string) => void;

  // Lecturer side
  registrations: Registration[];
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  myRegistrations: {},
  register: (topicId) =>
    set((s) => ({
      myRegistrations: { ...s.myRegistrations, [topicId]: 'PENDING' }
    })),

  registrations: MOCK_REGISTRATIONS,
  approve: (id) =>
    set((s) => ({
      registrations: s.registrations.map((r) =>
        r._id === id ? { ...r, status: 'APPROVED' } : r
      )
    })),
  reject: (id, reason) =>
    set((s) => ({
      registrations: s.registrations.map((r) =>
        r._id === id ? { ...r, status: 'REJECTED', rejectReason: reason } : r
      )
    }))
}));