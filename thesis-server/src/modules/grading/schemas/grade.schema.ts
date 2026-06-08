import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type GradeDocument = Grade & Document;
export type GradeType = 'SUPERVISOR' | 'REVIEWER';

@Schema({ timestamps: false, _id: false })
export class GradeCriteria {
  @ApiProperty()
  @Prop({ required: true })
  criteriaId!: string;

  @ApiProperty()
  @Prop({ required: true })
  name!: string;

  @ApiProperty()
  @Prop({ required: true, min: 0, max: 1 })
  weight!: number;

  @ApiProperty({ required: false, nullable: true })
  @Prop({ type: Number, default: null })
  score: number | null = null;

  @ApiProperty()
  @Prop({ default: '' })
  description!: string;
}

const GradeCriteriaSchema = SchemaFactory.createForClass(GradeCriteria);

@Schema({ timestamps: true, versionKey: false })
export class Grade {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student!: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true })
  topic!: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  grader!: Types.ObjectId;

  @ApiProperty({ enum: ['SUPERVISOR', 'REVIEWER'] })
  @Prop({ required: true, enum: ['SUPERVISOR', 'REVIEWER'] })
  type!: GradeType;

  @ApiProperty({ type: [GradeCriteria] })
  @Prop({ type: [GradeCriteriaSchema], default: [] })
  criteria!: GradeCriteria[];

  @ApiProperty({ required: false, nullable: true })
  @Prop({ type: Number, default: null })
  totalScore: number | null = null;

  @ApiProperty()
  @Prop({ default: '' })
  generalComment!: string;

  @ApiProperty({ default: false })
  @Prop({ default: false })
  submitted!: boolean;

  @ApiProperty({ required: false })
  @Prop()
  submittedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);

// Mỗi grader chỉ chấm 1 lần / type / topic
GradeSchema.index({ student: 1, topic: 1, type: 1 }, { unique: true });
GradeSchema.index({ grader: 1, submitted: 1 });
GradeSchema.index({ topic: 1 });
