import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RegistrationDocument = Registration & Document;
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Schema({ timestamps: true, versionKey: false })
export class Registration {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student!: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true })
  topic!: Types.ObjectId;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Prop({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status!: RegistrationStatus;

  @ApiProperty({ required: false })
  @Prop({ default: '' })
  note!: string;

  @ApiProperty({ required: false })
  @Prop({ default: '' })
  rejectReason!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Một sinh viên chỉ đăng ký một đề tài (unique compound index)
RegistrationSchema.index(
  { student: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['PENDING', 'APPROVED'] } },
  },
);
RegistrationSchema.index({ topic: 1, status: 1 });
