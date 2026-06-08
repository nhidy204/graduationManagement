export interface GradeCriteria {
  _id: string;
  name: string;
  weight: number;
  score: number | null;
  description: string;
}

export type GradeType = 'SUPERVISOR' | 'REVIEWER';

export interface GradeSubmission {
  _id: string;
  student: { _id: string; name: string; email: string };
  topic: { _id: string; title: string; major: string };
  grader: string;
  type: GradeType;
  criteria: GradeCriteria[];
  generalComment: string;
  submitted: boolean;
  submittedAt?: string;
  totalScore: number | null;
}

export interface StudentResult {
  studentId: string;
  supervisorScore: number | null;
  reviewerScore: number | null;
  finalScore: number | null;
  supervisorCriteria: GradeCriteria[];
  reviewerCriteria: GradeCriteria[];
  supervisorComment: string;
  reviewerComment: string;
  published: boolean;
}