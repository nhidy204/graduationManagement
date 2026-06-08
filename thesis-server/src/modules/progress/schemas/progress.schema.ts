import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: false, _id: true })
export class ProgressComment {
  @ApiProperty()
  _id!: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true, trim: true })
  content!: string;

  @ApiProperty()
  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

const ProgressCommentSchema = SchemaFactory.createForClass(ProgressComment);

@Schema({ timestamps: true, versionKey: false })
export class Progress {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student!: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true })
  topic!: Types.ObjectId;

  @ApiProperty({ example: 1 })
  @Prop({ required: true, min: 1 })
  weekNumber!: number;

  @ApiProperty({ example: 'Tuần 1 (07/04 - 13/04)' })
  @Prop({ required: true })
  weekLabel!: string;

  @ApiProperty()
  @Prop({ required: true })
  summary!: string;

  @ApiProperty()
  @Prop({ required: true })
  plan!: string;

  @ApiProperty({ example: 25 })
  @Prop({ default: 0, min: 0, max: 100 })
  percentage!: number;

  @ApiProperty({ required: false })
  @Prop()
  fileUrl?: string;

  @ApiProperty({ required: false })
  @Prop()
  fileName?: string;

  @ApiProperty({ type: [ProgressComment] })
  @Prop({ type: [ProgressCommentSchema], default: [] })
  comments!: ProgressComment[];

  @ApiProperty({ default: false })
  @Prop({ default: false })
  seenByLecturer!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Unique: mỗi student chỉ có 1 entry mỗi tuần cho 1 topic
ProgressSchema.index({ student: 1, topic: 1, weekNumber: 1 }, { unique: true });
ProgressSchema.index({ student: 1, topic: 1 });
ProgressSchema.index({ topic: 1 });
