export type Role = 'STUDENT' | 'LECTURER' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string>;
  response?: {
    data?: {
      message?: string;
    };
  };
}