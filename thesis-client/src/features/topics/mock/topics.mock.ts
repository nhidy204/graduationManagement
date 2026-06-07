import type { Topic } from '../types/topic.types';

export const MOCK_TOPICS: Topic[] = [
  {
    _id: '1',
    title: 'Xây dựng hệ thống quản lý kho hàng thông minh với IoT',
    description: 'Nghiên cứu và phát triển hệ thống quản lý kho hàng tích hợp cảm biến IoT, theo dõi hàng hóa realtime và tự động hóa quy trình nhập xuất kho.',
    requirements: 'Có kiến thức về Node.js, React, MQTT protocol',
    major: 'Kỹ thuật phần mềm',
    skills: ['React', 'Node.js', 'IoT', 'MongoDB'],
    maxStudents: 2,
    currentStudents: 1,
    status: 'PUBLISHED',
    supervisor: { _id: 'l1', name: 'TS. Nguyễn Văn An', email: 'an.nv@university.edu.vn' },
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    _id: '2',
    title: 'Ứng dụng Machine Learning trong phát hiện gian lận giao dịch ngân hàng',
    description: 'Xây dựng mô hình ML để phát hiện các giao dịch bất thường trong hệ thống ngân hàng, sử dụng các thuật toán như Random Forest, XGBoost.',
    requirements: 'Python, Scikit-learn, Pandas, kiến thức thống kê cơ bản',
    major: 'Khoa học dữ liệu',
    skills: ['Python', 'Machine Learning', 'Pandas', 'SQL'],
    maxStudents: 1,
    currentStudents: 1,
    status: 'FULL',
    supervisor: { _id: 'l2', name: 'PGS. Trần Thị Bình', email: 'binh.tt@university.edu.vn' },
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    _id: '3',
    title: 'Phát triển ứng dụng di động hỗ trợ học tiếng Anh với AI',
    description: 'Xây dựng app mobile tích hợp AI để cá nhân hóa lộ trình học tiếng Anh, nhận diện giọng nói và đưa ra phản hồi realtime.',
    requirements: 'React Native hoặc Flutter, kiến thức về NLP cơ bản',
    major: 'Kỹ thuật phần mềm',
    skills: ['React Native', 'TypeScript', 'NLP', 'Firebase'],
    maxStudents: 2,
    currentStudents: 0,
    status: 'PUBLISHED',
    supervisor: { _id: 'l3', name: 'ThS. Lê Minh Cường', email: 'cuong.lm@university.edu.vn' },
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    _id: '4',
    title: 'Hệ thống phân tích cảm xúc người dùng trên mạng xã hội',
    description: 'Xây dựng pipeline thu thập, xử lý và phân tích sentiment từ dữ liệu mạng xã hội sử dụng các mô hình NLP hiện đại như BERT.',
    requirements: 'Python, PyTorch hoặc TensorFlow, kiến thức NLP',
    major: 'Khoa học dữ liệu',
    skills: ['Python', 'PyTorch', 'BERT', 'FastAPI'],
    maxStudents: 1,
    currentStudents: 0,
    status: 'PUBLISHED',
    supervisor: { _id: 'l2', name: 'PGS. Trần Thị Bình', email: 'binh.tt@university.edu.vn' },
    createdAt: '2026-02-10T00:00:00Z'
  },
  {
    _id: '5',
    title: 'Xây dựng Blockchain cho hệ thống xác thực bằng cấp đại học',
    description: 'Ứng dụng công nghệ Blockchain để tạo hệ thống lưu trữ và xác thực bằng cấp, chứng chỉ học thuật không thể giả mạo.',
    requirements: 'Solidity, Web3.js, kiến thức Blockchain cơ bản',
    major: 'An toàn thông tin',
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'Node.js'],
    maxStudents: 2,
    currentStudents: 0,
    status: 'PUBLISHED',
    supervisor: { _id: 'l4', name: 'TS. Phạm Đức Dũng', email: 'dung.pd@university.edu.vn' },
    createdAt: '2026-02-15T00:00:00Z'
  },
  {
    _id: '6',
    title: 'Ứng dụng AR hỗ trợ thiết kế nội thất',
    description: 'Phát triển ứng dụng Augmented Reality cho phép người dùng xem trước nội thất trong không gian thực trước khi mua.',
    requirements: 'Unity, ARCore/ARKit, C#',
    major: 'Kỹ thuật phần mềm',
    skills: ['Unity', 'C#', 'ARCore', '3D Modeling'],
    maxStudents: 2,
    currentStudents: 2,
    status: 'FULL',
    supervisor: { _id: 'l3', name: 'ThS. Lê Minh Cường', email: 'cuong.lm@university.edu.vn' },
    createdAt: '2026-03-01T00:00:00Z'
  }
];

export const MAJORS = ['Kỹ thuật phần mềm', 'Khoa học dữ liệu', 'An toàn thông tin', 'Mạng máy tính'];
export const SUPERVISORS = [
  { _id: 'l1', name: 'TS. Nguyễn Văn An' },
  { _id: 'l2', name: 'PGS. Trần Thị Bình' },
  { _id: 'l3', name: 'ThS. Lê Minh Cường' },
  { _id: 'l4', name: 'TS. Phạm Đức Dũng' },
];