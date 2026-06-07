import type { User } from '@/types/api.types';

export type TopicStatus = 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CLOSED';

export interface Topic {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  major: string;
  skills: string[];
  maxStudents: number;
  currentStudents: number;
  status: TopicStatus;
  supervisor: Pick<User, '_id' | 'name' | 'email' | 'avatarUrl'>;
  createdAt: string;
}

export interface CreateTopicDto {
  title: string;
  description: string;
  requirements?: string;
  major: string;
  skills?: string[];
  maxStudents: number;
}

export interface TopicFilters {
  search: string;
  major: string;
  status: string;
  supervisorId: string;
}