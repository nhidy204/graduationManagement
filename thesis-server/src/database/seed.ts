import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserDocument } from '../modules/users/schemas/user.schema';
import { TopicsService } from '../modules/topics/topics.service';
import { GradingService } from '../modules/grading/grading.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Registration,
  RegistrationDocument,
} from '../modules/registrations/schemas/registration.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const topicsService = app.get(TopicsService);
  const gradingService = app.get(GradingService);
  const registrationModel = app.get<Model<RegistrationDocument>>(
    getModelToken(Registration.name),
  );

  const accounts = [
    {
      name: 'Admin Hệ thống',
      email: 'admin@university.edu.vn',
      password: 'Admin123!',
      role: 'ADMIN' as const,
    },
    {
      name: 'TS. Nguyễn Văn An',
      email: 'an.nv@university.edu.vn',
      password: 'Lecturer123!',
      role: 'LECTURER' as const,
    },
    {
      name: 'PGS. Trần Thị Bình',
      email: 'binh.tt@university.edu.vn',
      password: 'Lecturer123!',
      role: 'LECTURER' as const,
    },
    {
      name: 'ThS. Lê Minh Cường',
      email: 'cuong.lm@university.edu.vn',
      password: 'Lecturer123!',
      role: 'LECTURER' as const,
    },
    {
      name: 'TS. Phạm Đức Dũng',
      email: 'dung.pd@university.edu.vn',
      password: 'Lecturer123!',
      role: 'LECTURER' as const,
    },
    {
      name: 'Nguyễn Văn Hùng',
      email: 'hung.nv@student.edu.vn',
      password: 'Student123!',
      role: 'STUDENT' as const,
    },
    {
      name: 'Trần Thị Mai',
      email: 'mai.tt@student.edu.vn',
      password: 'Student123!',
      role: 'STUDENT' as const,
    },
  ];

  const createdUsers: Record<string, UserDocument> = {};

  for (const acc of accounts) {
    try {
      const user = await usersService.create(acc);
      createdUsers[acc.email] = user;
      console.log(`✅ Created: ${acc.email}`);
    } catch {
      console.log(`⚠️  Skipped (exists): ${acc.email}`);
      const user = await usersService.findByEmail(acc.email);
      if (user) createdUsers[acc.email] = user;
    }
  }

  const topics: Array<{
    title: string;
    description: string;
    requirements: string;
    major: string;
    skills: string[];
    maxStudents: number;
    status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CLOSED';
    supervisorEmail: string;
  }> = [
    {
      title: 'Xây dựng hệ thống quản lý kho hàng thông minh với IoT',
      description:
        'Nghiên cứu và phát triển hệ thống quản lý kho hàng tích hợp cảm biến IoT, theo dõi hàng hóa realtime và tự động hóa quy trình nhập xuất kho.',
      requirements: 'Có kiến thức về Node.js, React, MQTT protocol',
      major: 'Kỹ thuật phần mềm',
      skills: ['React', 'Node.js', 'IoT', 'MongoDB'],
      maxStudents: 2,
      status: 'PUBLISHED',
      supervisorEmail: 'an.nv@university.edu.vn',
    },
    {
      title:
        'Ứng dụng Machine Learning trong phát hiện gian lận giao dịch ngân hàng',
      description:
        'Xây dựng mô hình ML để phát hiện các giao dịch bất thường trong hệ thống ngân hàng, sử dụng các thuật toán như Random Forest, XGBoost.',
      requirements: 'Python, Scikit-learn, Pandas, kiến thức thống kê cơ bản',
      major: 'Khoa học dữ liệu',
      skills: ['Python', 'Machine Learning', 'Pandas', 'SQL'],
      maxStudents: 1,
      status: 'FULL',
      supervisorEmail: 'binh.tt@university.edu.vn',
    },
    {
      title: 'Phát triển ứng dụng di động hỗ trợ học tiếng Anh với AI',
      description:
        'Xây dựng app mobile tích hợp AI để cá nhân hóa lộ trình học tiếng Anh, nhận diện giọng nói và đưa ra phản hồi realtime.',
      requirements: 'React Native hoặc Flutter, kiến thức về NLP cơ bản',
      major: 'Kỹ thuật phần mềm',
      skills: ['React Native', 'TypeScript', 'NLP', 'Firebase'],
      maxStudents: 2,
      status: 'PUBLISHED',
      supervisorEmail: 'cuong.lm@university.edu.vn',
    },
    {
      title: 'Hệ thống phân tích cảm xúc người dùng trên mạng xã hội',
      description:
        'Xây dựng pipeline thu thập, xử lý và phân tích sentiment từ dữ liệu mạng xã hội sử dụng các mô hình NLP hiện đại như BERT.',
      requirements: 'Python, PyTorch hoặc TensorFlow, kiến thức NLP',
      major: 'Khoa học dữ liệu',
      skills: ['Python', 'PyTorch', 'BERT', 'FastAPI'],
      maxStudents: 1,
      status: 'PUBLISHED',
      supervisorEmail: 'binh.tt@university.edu.vn',
    },
    {
      title: 'Xây dựng Blockchain cho hệ thống xác thực bằng cấp đại học',
      description:
        'Ứng dụng công nghệ Blockchain để tạo hệ thống lưu trữ và xác thực bằng cấp, chứng chỉ học thuật không thể giả mạo.',
      requirements: 'Solidity, Web3.js, kiến thức Blockchain cơ bản',
      major: 'An toàn thông tin',
      skills: ['Solidity', 'Web3.js', 'Ethereum', 'Node.js'],
      maxStudents: 2,
      status: 'PUBLISHED',
      supervisorEmail: 'dung.pd@university.edu.vn',
    },
    {
      title: 'Ứng dụng AR hỗ trợ thiết kế nội thất',
      description:
        'Phát triển ứng dụng Augmented Reality cho phép người dùng xem trước nội thất trong không gian thực trước khi mua.',
      requirements: 'Unity, ARCore/ARKit, C#',
      major: 'Kỹ thuật phần mềm',
      skills: ['Unity', 'C#', 'ARCore', '3D Modeling'],
      maxStudents: 2,
      status: 'FULL',
      supervisorEmail: 'cuong.lm@university.edu.vn',
    },
  ];

  for (const topicData of topics) {
    try {
      const supervisor = createdUsers[topicData.supervisorEmail];
      if (!supervisor) {
        console.log(
          `⚠️  Skipped topic (supervisor not found): ${topicData.title}`,
        );
        continue;
      }
      await topicsService.create(
        {
          title: topicData.title,
          description: topicData.description,
          requirements: topicData.requirements,
          major: topicData.major,
          skills: topicData.skills,
          maxStudents: topicData.maxStudents,
          status: topicData.status,
        },
        supervisor,
      );
      console.log(`✅ Created topic: ${topicData.title}`);
    } catch {
      console.log(`⚠️  Skipped topic (exists or error): ${topicData.title}`);
    }
  }

  // ── Seed grading: tạo phiếu SUPERVISOR cho mọi registration APPROVED ──
  console.log('\n📋 Seeding grading...');
  const approvedRegs = await registrationModel
    .find({ status: 'APPROVED' })
    .populate('topic', 'supervisor')
    .lean();

  for (const reg of approvedRegs) {
    try {
      const studentId = reg.student.toString();
      const topic = reg.topic as unknown as {
        _id: { toString(): string };
        supervisor: { toString(): string };
      };
      const topicId = topic._id.toString();
      const supervisorId = topic.supervisor.toString();

      await gradingService.initGrade(
        studentId,
        topicId,
        'SUPERVISOR',
        supervisorId,
      );
      console.log(`✅ Created SUPERVISOR grade for student ${studentId}`);
    } catch {
      console.log(`⚠️  Skipped grade (exists or error)`);
    }
  }

  await app.close();
  console.log('\n🌱 Seed completed!\n');
}

void seed();
