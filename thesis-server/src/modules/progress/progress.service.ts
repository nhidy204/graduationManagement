import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import {
  Registration,
  RegistrationDocument,
} from '../registrations/schemas/registration.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UserDocument } from '../users/schemas/user.schema';

function toPlainProgress(
  doc: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...doc,
    _id: (doc._id as Types.ObjectId)?.toString?.() ?? String(doc._id),
    student:
      doc.student && typeof doc.student === 'object'
        ? {
            ...(doc.student as { _id: Types.ObjectId }),
            _id: (doc.student as { _id: Types.ObjectId })._id?.toString(),
          }
        : doc.student,
    topic:
      doc.topic && typeof doc.topic === 'object'
        ? {
            ...(doc.topic as { _id: Types.ObjectId }),
            _id: (doc.topic as { _id: Types.ObjectId })._id?.toString(),
          }
        : doc.topic,
    comments: Array.isArray(doc.comments)
      ? (doc.comments as Record<string, unknown>[]).map((c) => ({
          ...c,
          _id: (c._id as Types.ObjectId)?.toString?.() ?? String(c._id),
          author:
            c.author && typeof c.author === 'object'
              ? {
                  ...(c.author as { _id: Types.ObjectId }),
                  _id: (c.author as { _id: Types.ObjectId })._id?.toString(),
                }
              : c.author,
        }))
      : doc.comments,
  };
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {}

  async create(
    dto: CreateProgressDto,
    user: UserDocument,
  ): Promise<ProgressDocument> {
    const registration = await this.registrationModel.findOne({
      student: user._id,
      topic: new Types.ObjectId(dto.topicId),
    });
    if (!registration || registration.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Đơn đăng ký của bạn phải được duyệt để cập nhật tiến độ',
      );
    }

    const entry = await this.progressModel
      .findOneAndUpdate(
        {
          student: user._id,
          topic: new Types.ObjectId(dto.topicId),
          weekNumber: dto.weekNumber,
        },
        {
          $set: {
            student: user._id,
            topic: new Types.ObjectId(dto.topicId),
            weekNumber: dto.weekNumber,
            weekLabel: dto.weekLabel,
            summary: dto.summary,
            plan: dto.plan,
            percentage: dto.percentage ?? 0,
            fileUrl: dto.fileUrl,
            fileName: dto.fileName,
            updatedAt: new Date(),
          },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .populate([
        { path: 'student', select: 'name email' },
        { path: 'comments.author', select: 'name role' },
      ])
      .lean();

    if (!entry) throw new NotFoundException('Không thể tạo entry tiến độ');

    return toPlainProgress(entry as never) as unknown as ProgressDocument;
  }

  async findByTopic(topicId: string, user: UserDocument) {
    if (!Types.ObjectId.isValid(topicId)) {
      throw new BadRequestException('topicId không hợp lệ');
    }

    const filter: Record<string, unknown> = {
      topic: new Types.ObjectId(topicId),
    };

    if (user.role === 'STUDENT') {
      filter['student'] = user._id;
    }

    const docs = await this.progressModel
      .find(filter as never)
      .populate('student', 'name email avatarUrl')
      .populate('comments.author', 'name role')
      .sort({ weekNumber: -1 })
      .lean();

    return docs.map((doc) => toPlainProgress(doc as never));
  }

  async findMyProgress(user: UserDocument) {
    const docs = await this.progressModel
      .find({ student: user._id })
      .populate('topic', 'title')
      .populate('comments.author', 'name role')
      .sort({ weekNumber: -1 })
      .lean();

    return docs.map((doc) => toPlainProgress(doc as never));
  }

  async addComment(
    entryId: string,
    dto: AddCommentDto,
    user: UserDocument,
  ): Promise<ProgressDocument> {
    const entry = await this.progressModel.findById(entryId);
    if (!entry) throw new NotFoundException('Không tìm thấy entry tiến độ');

    if (
      user.role === 'STUDENT' &&
      entry.student.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền comment vào entry này');
    }

    entry.comments.push({
      _id: new Types.ObjectId(),
      author: user._id,
      content: dto.content,
      createdAt: new Date(),
    });

    await entry.save();

    const populated = await this.progressModel
      .findById(entryId)
      .populate([
        { path: 'student', select: 'name email' },
        { path: 'comments.author', select: 'name role' },
      ])
      .lean();

    if (!populated)
      throw new NotFoundException(
        'Không tìm thấy entry tiến độ sau khi cập nhật',
      );

    return toPlainProgress(entry as never) as unknown as ProgressDocument;
  }

  async markSeen(entryId: string, user: UserDocument): Promise<void> {
    if (user.role === 'STUDENT') {
      throw new ForbiddenException('Chỉ giảng viên mới có thể đánh dấu đã xem');
    }

    const entry = await this.progressModel.findById(entryId);
    if (!entry) throw new NotFoundException('Không tìm thấy entry tiến độ');

    entry.seenByLecturer = true;
    await entry.save();
  }

  async deleteComment(
    entryId: string,
    commentId: string,
    user: UserDocument,
  ): Promise<ProgressDocument> {
    const entry = await this.progressModel.findById(entryId);
    if (!entry) throw new NotFoundException('Không tìm thấy entry tiến độ');

    const comment = entry.comments.find((c) => c._id.toString() === commentId);
    if (!comment) throw new NotFoundException('Không tìm thấy comment');

    if (comment.author.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền xóa comment này');
    }

    entry.comments = entry.comments.filter(
      (c) => c._id.toString() !== commentId,
    );
    await entry.save();

    const populated = await this.progressModel
      .findById(entryId)
      .populate([
        { path: 'student', select: 'name email' },
        { path: 'comments.author', select: 'name role' },
      ])
      .lean();

    if (!populated)
      throw new NotFoundException(
        'Không tìm thấy entry tiến độ sau khi cập nhật',
      );

    return toPlainProgress(entry as never) as unknown as ProgressDocument;
  }

  async getTopicProgressSummary(topicId: string) {
    if (!Types.ObjectId.isValid(topicId)) {
      throw new BadRequestException('topicId không hợp lệ');
    }

    return this.progressModel.aggregate([
      { $match: { topic: new Types.ObjectId(topicId) } },
      {
        $group: {
          _id: '$student',
          latestPercentage: { $max: '$percentage' },
          totalWeeks: { $sum: 1 },
          lastUpdated: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          'student.name': 1,
          'student.email': 1,
          latestPercentage: 1,
          totalWeeks: 1,
          lastUpdated: 1,
        },
      },
    ]);
  }
}
