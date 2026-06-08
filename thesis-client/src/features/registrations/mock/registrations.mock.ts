import type { Registration } from '../types/registration.types';
import { MOCK_TOPICS } from '@/features/topics/mock/topics.mock';

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    _id: 'r1',
    topic: MOCK_TOPICS[0],
    student: { _id: 's1', name: 'Nguyễn Văn Hùng', email: 'hung.nv@student.edu.vn' },
    status: 'PENDING',
    note: 'Em có kinh nghiệm làm việc với Node.js và React 1 năm, rất muốn được nghiên cứu về IoT.',
    createdAt: '2026-04-01T08:00:00Z'
  },
  {
    _id: 'r2',
    topic: MOCK_TOPICS[0],
    student: { _id: 's2', name: 'Trần Thị Mai', email: 'mai.tt@student.edu.vn' },
    status: 'PENDING',
    note: 'Em đã tìm hiểu về MQTT protocol và muốn phát triển thêm trong lĩnh vực này.',
    createdAt: '2026-04-02T09:30:00Z'
  },
  {
    _id: 'r3',
    topic: MOCK_TOPICS[2],
    student: { _id: 's3', name: 'Lê Quang Minh', email: 'minh.lq@student.edu.vn' },
    status: 'APPROVED',
    note: 'Em có kinh nghiệm React Native và đam mê AI.',
    createdAt: '2026-03-25T10:00:00Z'
  },
  {
    _id: 'r4',
    topic: MOCK_TOPICS[4],
    student: { _id: 's4', name: 'Phạm Thị Lan', email: 'lan.pt@student.edu.vn' },
    status: 'REJECTED',
    note: '',
    rejectReason: 'Sinh viên chưa có đủ nền tảng về Blockchain theo yêu cầu đề tài.',
    createdAt: '2026-03-20T14:00:00Z'
  },
  {
    _id: 'r5',
    topic: MOCK_TOPICS[2],
    student: { _id: 's5', name: 'Hoàng Đức Anh', email: 'anh.hd@student.edu.vn' },
    status: 'PENDING',
    note: 'Em đã có project Flutter cá nhân và muốn kết hợp với NLP.',
    createdAt: '2026-04-03T11:00:00Z'
  }
];