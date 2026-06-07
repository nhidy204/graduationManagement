import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = new this.userModel({ ...dto, password: hashed });
    return user.save();
  }

  async findAll(query: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 20 } = query;
    const filter: Record<string, any> = {};

    if (role && role !== 'ALL') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          '-password -refreshToken -resetPasswordToken -resetPasswordExpires',
        )
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select(
        '-password -refreshToken -resetPasswordToken -resetPasswordExpires',
      );
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select(
        '-password -refreshToken -resetPasswordToken -resetPasswordExpires',
      );
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async toggleStatus(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return user.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy người dùng');
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.userModel.findByIdAndUpdate(id, { refreshToken: hashed });
  }

  async setResetToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
    );
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async getStats() {
    const [total, students, lecturers, inactive] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'STUDENT' }),
      this.userModel.countDocuments({ role: 'LECTURER' }),
      this.userModel.countDocuments({ status: 'INACTIVE' }),
    ]);
    return { total, students, lecturers, inactive };
  }
}
