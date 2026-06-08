import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export type TopicDocument = Topic & Document;
export type TopicStatus = 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CLOSED';

@Schema({ timestamps: true, versionKey: false })
export class Topic {
  @ApiProperty()
  _id!: string;

  @ApiProperty({ example: 'Xây dựng hệ thống quản lý kho hàng với IoT' })
  @Prop({ required: true, trim: true })
  title!: string;

  @ApiProperty()
  @Prop({ required: true })
  description!: string;

  @ApiProperty()
  @Prop({ default: '' })
  requirements!: string;

  @ApiProperty({ example: 'Kỹ thuật phần mềm' })
  @Prop({ required: true, trim: true })
  major!: string;

  @ApiProperty({ type: [String], example: ['React', 'Node.js'] })
  @Prop({ type: [String], default: [] })
  skills!: string[];

  @ApiProperty({ example: 2 })
  @Prop({ required: true, min: 1, max: 10 })
  maxStudents!: number;

  @ApiProperty({ example: 0 })
  @Prop({ default: 0, min: 0 })
  currentStudents!: number;

  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'FULL', 'CLOSED'] })
  @Prop({
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'FULL', 'CLOSED'],
    default: 'DRAFT',
  })
  status!: TopicStatus;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  supervisor!: Types.ObjectId | User;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);

// Indexes
TopicSchema.index({ status: 1 });
TopicSchema.index({ major: 1 });
TopicSchema.index({ supervisor: 1 });
TopicSchema.index({ title: 'text', description: 'text' });
