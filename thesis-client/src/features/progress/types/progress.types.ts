export interface ProgressEntry {
  _id: string;
  weekNumber: number;
  weekLabel: string;
  summary: string;
  plan: string;
  percentage: number;
  fileUrl?: string;
  fileName?: string;
  comments: ProgressComment[];
  createdAt: string;
  seenByLecturer: boolean;
}

export interface ProgressComment {
  _id: string;
  author: { _id: string; name: string; role: 'STUDENT' | 'LECTURER' }
  content: string;
  createdAt: string;
}

export interface ProgressEntry {
  _id: string;
  weekNumber: number;
  weekLabel: string;
  summary: string;
  plan: string;
  percentage: number;
  fileUrl?: string;
  fileName?: string;
  comments: ProgressComment[];
  createdAt: string;
  seenByLecturer: boolean;
  student?: { _id: string; name: string; email: string };
}

export interface ProgressComment {
  _id: string;
  author: { _id: string; name: string; role: 'STUDENT' | 'LECTURER' };
  content: string;
  createdAt: string;
}