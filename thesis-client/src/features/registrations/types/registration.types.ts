import type { Topic } from '@/features/topics/types/topic.types';
import type { User } from '@/types/api.types';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Registration {
  _id: string;
  topic: Topic;
  student: Pick<User, '_id' | 'name' | 'email'>;
  status: RegistrationStatus;
  note?: string;
  rejectReason?: string;
  createdAt: string;
}