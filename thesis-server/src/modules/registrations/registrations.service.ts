import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Registration,
  RegistrationDocument,
} from './schemas/registration.schema';
import { Topic, TopicDocument } from '../topics/schemas/topic.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';
import { TopicsService } from '../topics/topics.service';
import { UserDocument } from '../users/schemas/user.schema';

interface PopulatedTopic {
  _id: Types.ObjectId;
  supervisor: Types.ObjectId | { _id: Types.ObjectId; toString(): string };
  title?: string;
  major?: string;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

function toPlainReg(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    ...doc,
    _id: (doc._id as Types.ObjectId)?.toString?.() ?? String(doc._id),
    student:
      doc.student && typeof doc.student === 'object'
        ? {
            ...(doc.student as PopulatedUser),
            _id: (doc.student as PopulatedUser)._id?.toString(),
          }
        : doc.student,
    topic:
      doc.topic && typeof doc.topic === 'object'
        ? {
            ...(doc.topic as PopulatedTopic),
            _id: (doc.topic as PopulatedTopic)._id?.toString(),
          }
        : doc.topic,
  };
}

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Topic.name)
    private topicModel: Model<TopicDocument>,
    private topicsService: TopicsService,
  ) {}

  async create(
    dto: CreateRegistrationDto,
    user: UserDocument,
  ): Promise<RegistrationDocument> {
    const topic = await this.topicsService.findById(dto.topicId);

    if (topic.status !== 'PUBLISHED') {
      throw new BadRequestException('Đề tài không mở đăng ký');
    }
    if (topic.currentStudents >= topic.maxStudents) {
      throw new BadRequestException('Đề tài đã đủ sinh viên');
    }

    const existing = await this.registrationModel.findOne({
      student: user._id,
      status: { $in: ['PENDING', 'APPROVED'] },
    });
    if (existing) {
      throw new ConflictException('Bạn đã có đề tài hoặc đang chờ duyệt');
    }

    const reg = new this.registrationModel({
      student: user._id,
      topic: new Types.ObjectId(dto.topicId),
      note: dto.note ?? '',
      status: 'PENDING',
    });

    return await reg.save();
  }

  async findAll(
    query: {
      status?: string;
      topicId?: string;
      page?: number;
      limit?: number;
    },
    user: UserDocument,
  ) {
    const { status, topicId, page = 1, limit = 20 } = query;
    const filter: Record<string, unknown> = {};

    if (user.role === 'STUDENT') {
      filter['student'] = user._id;
    } else if (user.role === 'LECTURER') {
      const myTopics = await this.topicModel
        .find({ supervisor: user._id }, { _id: 1 })
        .lean();
      const myTopicIds = myTopics.map((t) => t._id);
      filter['topic'] = { $in: myTopicIds };
    }

    if (status && status !== 'ALL') filter['status'] = status;
    if (topicId && Types.ObjectId.isValid(topicId)) {
      filter['topic'] = new Types.ObjectId(topicId);
    }

    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter as never)
        .populate('student', 'name email avatarUrl')
        .populate('topic', 'title major supervisor')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .then((docs) => docs.map((doc) => toPlainReg(doc as never))),
      this.registrationModel.countDocuments(filter as never),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async review(
    id: string,
    dto: ReviewRegistrationDto,
    user: UserDocument,
  ): Promise<RegistrationDocument> {
    const reg = await this.registrationModel.findById(id).populate([
      { path: 'student', select: 'name email' },
      { path: 'topic', select: 'title major supervisor _id' },
    ]);

    if (!reg) throw new NotFoundException('Không tìm thấy đơn đăng ký');

    // Idempotent
    if (reg.status === dto.action) {
      const result = await this.registrationModel
        .findById(id)
        .populate([
          { path: 'student', select: 'name email' },
          { path: 'topic', select: 'title major supervisor _id' },
        ])
        .lean();

      if (!result) throw new NotFoundException('Không tìm thấy đơn đăng ký');
      return toPlainReg(result as never) as unknown as RegistrationDocument;
    }

    if (reg.status !== 'PENDING') {
      throw new BadRequestException('Đơn đã được xử lý trước đó');
    }

    const topic = reg.topic as unknown as PopulatedTopic;

    if (
      user.role !== 'ADMIN' &&
      topic.supervisor?.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền duyệt đơn này');
    }

    if (dto.action === 'REJECTED' && !dto.rejectReason?.trim()) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối');
    }

    reg.status = dto.action;
    if (dto.action === 'REJECTED' && dto.rejectReason) {
      reg.rejectReason = dto.rejectReason;
    }

    if (dto.action === 'APPROVED') {
      const topicId = topic._id?.toString();
      if (topicId) {
        await this.topicsService.incrementStudents(topicId, 1);
      }
    }

    try {
      await reg.save();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        throw new ConflictException(
          'Bạn đã có đề tài khác ở trạng thái được duyệt',
        );
      }
      throw err;
    }

    const updated = await this.registrationModel
      .findById(id)
      .populate([
        { path: 'student', select: 'name email' },
        { path: 'topic', select: 'title major supervisor _id' },
      ])
      .lean();

    if (!updated)
      throw new NotFoundException('Không tìm thấy đơn sau khi cập nhật');
    return toPlainReg(updated as never) as unknown as RegistrationDocument;
  }

  async cancel(id: string, user: UserDocument): Promise<void> {
    const reg = await this.registrationModel.findById(id);
    if (!reg) throw new NotFoundException('Không tìm thấy đơn đăng ký');

    if (reg.student.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền huỷ đơn này');
    }
    if (reg.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể huỷ đơn đang chờ duyệt');
    }

    await this.registrationModel.findByIdAndDelete(id);
  }

  async getMyStatus(user: UserDocument) {
    const doc = await this.registrationModel
      .findOne({
        student: user._id,
        status: { $in: ['PENDING', 'APPROVED'] },
      })
      .populate('topic', 'title major supervisor')
      .lean();

    if (!doc) return null;

    return {
      ...doc,
      _id: doc._id.toString(),
      topic:
        doc.topic && typeof doc.topic === 'object'
          ? {
              ...(doc.topic as object),
              _id: (doc.topic as { _id: Types.ObjectId })._id?.toString(),
            }
          : doc.topic,
    };
  }
}
