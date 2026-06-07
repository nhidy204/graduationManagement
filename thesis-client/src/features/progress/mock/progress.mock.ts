import type { ProgressEntry } from '../types/progress.types';

export const MOCK_PROGRESS: ProgressEntry[] = [
  {
    _id: 'p1',
    weekNumber: 1,
    weekLabel: 'Tuần 1 (07/04 - 13/04)',
    summary: 'Tìm hiểu tổng quan về đề tài, đọc các tài liệu liên quan đến IoT và MQTT protocol. Cài đặt môi trường phát triển.',
    plan: 'Tuần tới sẽ thiết kế sơ đồ kiến trúc hệ thống và bắt đầu xây dựng prototype.',
    percentage: 10,
    fileName: 'baocao_tuan1.pdf',
    fileUrl: '#',
    seenByLecturer: true,
    comments: [
      {
        _id: 'c1',
        author: { _id: 'l1', name: 'TS. Nguyễn Văn An', role: 'LECTURER' },
        content: 'Tiến độ ổn, em chú ý đọc thêm bài báo về MQTT v5 nhé, có nhiều cải tiến so với v3.',
        createdAt: '2026-04-14T09:00:00Z'
      }
    ],
    createdAt: '2026-04-13T20:00:00Z'
  },
  {
    _id: 'p2',
    weekNumber: 2,
    weekLabel: 'Tuần 2 (14/04 - 20/04)',
    summary: 'Thiết kế kiến trúc hệ thống gồm 3 tầng: Sensor Layer, Gateway Layer, Application Layer. Vẽ sơ đồ ERD database.',
    plan: 'Bắt đầu implement backend API với Node.js và kết nối MQTT broker.',
    percentage: 22,
    fileName: 'kientruc_hethong.pdf',
    fileUrl: '#',
    seenByLecturer: true,
    comments: [],
    createdAt: '2026-04-20T21:00:00Z'
  },
  {
    _id: 'p3',
    weekNumber: 3,
    weekLabel: 'Tuần 3 (21/04 - 27/04)',
    summary: 'Implement REST API cơ bản, kết nối MongoDB, setup Docker Compose cho dev environment. Test kết nối MQTT broker.',
    plan: 'Tuần tới xây dựng dashboard frontend và realtime chart.',
    percentage: 38,
    seenByLecturer: false,
    comments: [],
    createdAt: '2026-04-27T19:30:00Z'
  }
];