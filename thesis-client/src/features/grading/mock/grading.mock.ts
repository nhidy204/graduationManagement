import type { GradeSubmission, StudentResult } from '../types/grading.types';

const SUPERVISOR_CRITERIA = [
  { _id: 'sc1', name: 'Nội dung kỹ thuật', weight: 0.4, score: null, description: 'Độ sâu kỹ thuật, tính đúng đắn của giải pháp' },
  { _id: 'sc2', name: 'Trình bày & văn phong', weight: 0.2, score: null, description: 'Chất lượng báo cáo, hình thức trình bày' },
  { _id: 'sc3', name: 'Tiến độ thực hiện', weight: 0.2, score: null, description: 'Mức độ đúng hạn, chủ động trong quá trình làm' },
  { _id: 'sc4', name: 'Demo / Sản phẩm', weight: 0.2, score: null, description: 'Chất lượng sản phẩm hoàn thiện, khả năng demo' },
];

const REVIEWER_CRITERIA = [
  { _id: 'rc1', name: 'Tính khoa học', weight: 0.35, score: null, description: 'Phương pháp nghiên cứu, tính logic' },
  { _id: 'rc2', name: 'Đóng góp mới', weight: 0.3, score: null, description: 'Tính mới, sáng tạo của giải pháp' },
  { _id: 'rc3', name: 'Kết quả thực nghiệm', weight: 0.2, score: null, description: 'Dữ liệu thực nghiệm, đánh giá kết quả' },
  { _id: 'rc4', name: 'Tài liệu tham khảo', weight: 0.15, score: null, description: 'Chất lượng và độ phù hợp tài liệu tham khảo' },
];

export const MOCK_GRADE_SUBMISSIONS: GradeSubmission[] = [
  {
    _id: 'gs1',
    studentId: 's3',
    studentName: 'Lê Quang Minh',
    topicTitle: 'Phát triển ứng dụng di động hỗ trợ học tiếng Anh với AI',
    type: 'SUPERVISOR',
    criteria: SUPERVISOR_CRITERIA.map((c) => ({ ...c })),
    generalComment: '',
    submitted: false
  },
  {
    _id: 'gs2',
    studentId: 's1',
    studentName: 'Nguyễn Văn Hùng',
    topicTitle: 'Xây dựng hệ thống quản lý kho hàng thông minh với IoT',
    type: 'REVIEWER',
    criteria: REVIEWER_CRITERIA.map((c) => ({ ...c })),
    generalComment: '',
    submitted: false
  },
  {
    _id: 'gs3',
    studentId: 's2',
    studentName: 'Trần Thị Mai',
    topicTitle: 'Xây dựng hệ thống quản lý kho hàng thông minh với IoT',
    type: 'SUPERVISOR',
    criteria: SUPERVISOR_CRITERIA.map((c) => ({
      ...c,
      score: [8.5, 7, 9, 8][Number(c._id.replace('sc', '')) - 1]
    })),
    generalComment: 'Sinh viên thực hiện tốt, bám sát yêu cầu đề tài.',
    submitted: true,
    submittedAt: '2026-04-28T10:00:00Z'
  }
];

export const MOCK_STUDENT_RESULTS: StudentResult[] = [
  {
    _id: 'sr1',
    studentName: 'Lê Quang Minh',
    topicTitle: 'Phát triển ứng dụng di động hỗ trợ học tiếng Anh với AI',
    supervisorScore: 8.4,
    reviewerScore: 7.9,
    finalScore: 8.19,
    supervisorCriteria: SUPERVISOR_CRITERIA.map((c, i) => ({
      ...c, score: [8, 9, 8.5, 8][i]
    })),
    reviewerCriteria: REVIEWER_CRITERIA.map((c, i) => ({
      ...c, score: [8, 7.5, 8, 8][i]
    })),
    published: true
  }
];