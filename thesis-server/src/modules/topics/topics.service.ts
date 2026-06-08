import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { UserDocument } from '../users/schemas/user.schema';

export interface PaginatedTopics {
  data: TopicDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SupervisorPopulated = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatarUrl?: string;
};

@Injectable()
export class TopicsService {
  private readonly logger = new Logger(TopicsService.name);

  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async create(
    dto: CreateTopicDto,
    user: UserDocument,
  ): Promise<TopicDocument> {
    try {
      this.logger.log(
        `Creating topic for user ${String(user._id)}: ${dto.title}`,
      );
      const topic = new this.topicModel({
        ...dto,
        supervisor: user._id,
        status: dto.status ?? 'DRAFT',
      });

      const saved = await topic.save();
      this.logger.log(`Topic saved with ID: ${String(saved._id)}`);

      const populated = await this.topicModel
        .findById(saved._id)
        .populate({ path: 'supervisor', select: 'name email avatarUrl' })
        .lean();

      if (!populated) {
        throw new Error('Failed to populate created topic');
      }

      this.logger.log(`Topic created successfully`);
      return populated as TopicDocument;
    } catch (error) {
      this.logger.error(`Error creating topic:`, error);
      throw error;
    }
  }

  async findAll(
    query: QueryTopicDto,
    user: UserDocument,
  ): Promise<PaginatedTopics> {
    try {
      const {
        search,
        major,
        status,
        supervisorId,
        page = 1,
        limit = 12,
      } = query;
      const filter: Record<string, unknown> = {};

      this.logger.log(
        `[findAll] User ${String(user._id)} (${user.role}) fetching topics`,
      );
      this.logger.log(`[findAll] Query: ${JSON.stringify(query)}`);

      if (user.role === 'STUDENT') {
        filter['status'] = { $in: ['PUBLISHED', 'FULL'] };
      } else if (user.role === 'LECTURER') {
        if (supervisorId && Types.ObjectId.isValid(supervisorId)) {
          // Có supervisorId → filter chính xác theo supervisor đó
          filter['supervisor'] = new Types.ObjectId(supervisorId);
        } else {
          // Không có supervisorId → hiện topic của mình + published của người khác
          filter['$or'] = [
            { supervisor: new Types.ObjectId(user._id.toString()) },
            { status: { $in: ['PUBLISHED', 'FULL', 'CLOSED'] } },
          ];
        }
      } else if (user.role === 'ADMIN') {
        if (supervisorId && Types.ObjectId.isValid(supervisorId)) {
          filter['supervisor'] = new Types.ObjectId(supervisorId);
        }
      }

      if (status && user.role !== 'STUDENT') filter['status'] = status;
      if (major) filter['major'] = { $regex: major, $options: 'i' };
      if (search) filter['$text'] = { $search: search };

      this.logger.log(`[findAll] Final filter: ${JSON.stringify(filter)}`);

      const [data, total] = await Promise.all([
        this.topicModel
          .find(filter as never)
          .populate('supervisor', 'name email avatarUrl _id')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean()
          .then((docs) =>
            docs.map((doc) => {
              const sup =
                doc.supervisor as unknown as SupervisorPopulated | null;
              return {
                ...doc,
                _id: doc._id.toString(),
                supervisor: sup
                  ? { ...sup, _id: sup._id.toString() }
                  : doc.supervisor,
              };
            }),
          ),
        this.topicModel.countDocuments(filter as never),
      ]);

      this.logger.log(
        `[findAll] Found ${total} topics, returning ${data.length} items`,
      );
      this.logger.debug(`[findAll] Data: ${JSON.stringify(data)}`);

      return {
        data: data as unknown as TopicDocument[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`[findAll] Error:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<TopicDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID không hợp lệ');
      }

      const topic = await this.topicModel
        .findById(id)
        .populate({
          path: 'supervisor',
          select: 'name email avatarUrl _id role',
        })
        .lean();

      if (!topic) {
        throw new NotFoundException('Không tìm thấy đề tài');
      }

      this.logger.log(`[findById] Topic found: ${id}`);

      // Map _id sang string giống findAll
      const sup = topic.supervisor as unknown as {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatarUrl?: string;
        role?: string;
      } | null;
      return {
        ...topic,
        _id: topic._id.toString(),
        supervisor: sup
          ? { ...sup, _id: sup._id.toString() }
          : topic.supervisor,
      } as unknown as TopicDocument;
    } catch (error) {
      this.logger.error(`[findById] Error finding topic ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateTopicDto,
    user: UserDocument,
  ): Promise<TopicDocument> {
    const topic = await this.findById(id);

    const supervisorAsPopulated =
      topic.supervisor as unknown as SupervisorPopulated;
    const supervisorId =
      supervisorAsPopulated?._id ??
      (topic.supervisor as unknown as Types.ObjectId);

    if (
      user.role !== 'ADMIN' &&
      supervisorId?.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đề tài này');
    }

    if (
      user.role !== 'ADMIN' &&
      !['DRAFT', 'PUBLISHED'].includes(topic.status)
    ) {
      throw new BadRequestException(
        'Không thể chỉnh sửa đề tài ở trạng thái này',
      );
    }

    Object.assign(topic, dto);

    try {
      const saved = await topic.save();

      const populated = await this.topicModel
        .findById(saved._id)
        .populate({ path: 'supervisor', select: 'name email avatarUrl' })
        .lean();

      if (!populated) {
        throw new Error('Failed to populate updated topic');
      }

      this.logger.log(`Topic updated successfully: ${id}`);
      return populated as TopicDocument;
    } catch (error) {
      this.logger.error(`Error updating topic:`, error);
      throw error;
    }
  }

  async remove(id: string, user: UserDocument): Promise<void> {
    const topic = await this.findById(id);

    const supervisorAsPopulated =
      topic.supervisor as unknown as SupervisorPopulated;
    const supervisorId =
      supervisorAsPopulated?._id ??
      (topic.supervisor as unknown as Types.ObjectId);

    if (
      user.role !== 'ADMIN' &&
      supervisorId?.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa đề tài này');
    }

    if (topic.currentStudents > 0) {
      throw new BadRequestException(
        'Không thể xóa đề tài đã có sinh viên đăng ký',
      );
    }

    await this.topicModel.findByIdAndDelete(id);
  }

  async incrementStudents(id: string, value: 1 | -1): Promise<void> {
    await this.topicModel.findByIdAndUpdate(id, {
      $inc: { currentStudents: value },
    });

    const topic = await this.topicModel.findById(id);
    if (!topic) return;

    if (topic.currentStudents >= topic.maxStudents) {
      topic.status = 'FULL';
    } else if (topic.status === 'FULL') {
      topic.status = 'PUBLISHED';
    }

    await topic.save();
  }

  async getStats(): Promise<Record<string, number>> {
    const [total, published, full, draft, closed] = await Promise.all([
      this.topicModel.countDocuments(),
      this.topicModel.countDocuments({ status: 'PUBLISHED' }),
      this.topicModel.countDocuments({ status: 'FULL' }),
      this.topicModel.countDocuments({ status: 'DRAFT' }),
      this.topicModel.countDocuments({ status: 'CLOSED' }),
    ]);
    return { total, published, full, draft, closed };
  }
}
