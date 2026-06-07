import type { Role } from '@/types/api.types';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  topicCount?: number;
}

export interface ReviewerAssignment {
  topicId: string;
  topicTitle: string;
  supervisorName: string;
  studentName: string;
  reviewerId: string | null;
}

export interface TimelineMilestone {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  type: 'REGISTRATION' | 'MIDTERM' | 'FINAL' | 'DEFENSE' | 'RESULT';
}