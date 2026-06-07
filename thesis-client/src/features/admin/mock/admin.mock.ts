import type { AdminUser, ReviewerAssignment, TimelineMilestone } from '../types/admin.types';

export const MOCK_USERS: AdminUser[] = [
  { _id: 'u1', name: 'Nguyễn Văn Hùng',   email: 'hung.nv@student.edu.vn',   role: 'STUDENT',  status: 'ACTIVE',   createdAt: '2026-01-10T00:00:00Z' },
  { _id: 'u2', name: 'Trần Thị Mai',       email: 'mai.tt@student.edu.vn',    role: 'STUDENT',  status: 'ACTIVE',   createdAt: '2026-01-11T00:00:00Z' },
  { _id: 'u3', name: 'Lê Quang Minh',      email: 'minh.lq@student.edu.vn',   role: 'STUDENT',  status: 'ACTIVE',   createdAt: '2026-01-12T00:00:00Z' },
  { _id: 'u4', name: 'Phạm Thị Lan',       email: 'lan.pt@student.edu.vn',    role: 'STUDENT',  status: 'INACTIVE', createdAt: '2026-01-13T00:00:00Z' },
  { _id: 'u5', name: 'Hoàng Đức Anh',      email: 'anh.hd@student.edu.vn',    role: 'STUDENT',  status: 'ACTIVE',   createdAt: '2026-01-14T00:00:00Z' },
  { _id: 'l1', name: 'TS. Nguyễn Văn An',  email: 'an.nv@university.edu.vn',  role: 'LECTURER', status: 'ACTIVE',   createdAt: '2025-08-01T00:00:00Z', topicCount: 3 },
  { _id: 'l2', name: 'PGS. Trần Thị Bình', email: 'binh.tt@university.edu.vn',role: 'LECTURER', status: 'ACTIVE',   createdAt: '2025-08-02T00:00:00Z', topicCount: 2 },
  { _id: 'l3', name: 'ThS. Lê Minh Cường', email: 'cuong.lm@university.edu.vn',role:'LECTURER', status: 'ACTIVE',   createdAt: '2025-08-03T00:00:00Z', topicCount: 2 },
  { _id: 'l4', name: 'TS. Phạm Đức Dũng',  email: 'dung.pd@university.edu.vn', role:'LECTURER', status: 'ACTIVE',   createdAt: '2025-08-04T00:00:00Z', topicCount: 1 },
  { _id: 'a1', name: 'Admin Hệ thống',      email: 'admin@university.edu.vn',  role: 'ADMIN',    status: 'ACTIVE',   createdAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_ASSIGNMENTS: ReviewerAssignment[] = [
  { topicId: '1', topicTitle: 'Xây dựng hệ thống quản lý kho hàng thông minh với IoT',        supervisorName: 'TS. Nguyễn Văn An',  studentName: 'Nguyễn Văn Hùng', reviewerId: 'l2' },
  { topicId: '3', topicTitle: 'Phát triển ứng dụng di động hỗ trợ học tiếng Anh với AI',       supervisorName: 'ThS. Lê Minh Cường', studentName: 'Lê Quang Minh',   reviewerId: null },
  { topicId: '4', topicTitle: 'Hệ thống phân tích cảm xúc người dùng trên mạng xã hội',       supervisorName: 'PGS. Trần Thị Bình', studentName: 'Trần Thị Mai',    reviewerId: null },
  { topicId: '5', topicTitle: 'Xây dựng Blockchain cho hệ thống xác thực bằng cấp đại học',   supervisorName: 'TS. Phạm Đức Dũng', studentName: 'Hoàng Đức Anh',   reviewerId: 'l1' },
];

export const MOCK_MILESTONES: TimelineMilestone[] = [
  { _id: 'm1', name: 'Đăng ký đề tài',      startDate: '2026-04-01', endDate: '2026-05-15', description: 'Sinh viên xem và đăng ký đề tài, giảng viên duyệt đăng ký.', type: 'REGISTRATION' },
  { _id: 'm2', name: 'Nộp báo cáo giữa kỳ', startDate: '2026-05-20', endDate: '2026-06-05', description: 'Sinh viên nộp báo cáo tiến độ 50% và nhận phản hồi.', type: 'MIDTERM' },
  { _id: 'm3', name: 'Nộp báo cáo cuối kỳ', startDate: '2026-07-01', endDate: '2026-07-20', description: 'Nộp báo cáo hoàn chỉnh, slide và demo sản phẩm.', type: 'FINAL' },
  { _id: 'm4', name: 'Bảo vệ khóa luận',    startDate: '2026-07-28', endDate: '2026-08-05', description: 'Hội đồng phản biện và bảo vệ trước hội đồng chấm điểm.', type: 'DEFENSE' },
  { _id: 'm5', name: 'Công bố kết quả',      startDate: '2026-08-10', endDate: '2026-08-10', description: 'Admin công bố điểm chính thức cho toàn bộ sinh viên.', type: 'RESULT' },
];

export const LECTURERS_FOR_REVIEW = [
  { _id: 'l1', name: 'TS. Nguyễn Văn An' },
  { _id: 'l2', name: 'PGS. Trần Thị Bình' },
  { _id: 'l3', name: 'ThS. Lê Minh Cường' },
  { _id: 'l4', name: 'TS. Phạm Đức Dũng' },
];