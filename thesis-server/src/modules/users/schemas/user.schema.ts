import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;
export type Role = 'STUDENT' | 'LECTURER' | 'ADMIN';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @ApiProperty({ example: '664f1b2c8e1a2b3c4d5e6f7a' })
  _id!: string;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @Prop({ required: true, trim: true })
  name!: string;

  @ApiProperty({ example: 'an.nv@university.edu.vn' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Exclude()
  @Prop({ required: true })
  password!: string;

  @ApiProperty({ enum: ['STUDENT', 'LECTURER', 'ADMIN'], example: 'STUDENT' })
  @Prop({ required: true, enum: ['STUDENT', 'LECTURER', 'ADMIN'], default: 'STUDENT' })
  role!: Role;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  status!: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ required: false })
  @Prop({ trim: true })
  avatarUrl?: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @Exclude()
  @Prop()
  resetPasswordToken?: string;

  @Exclude()
  @Prop()
  resetPasswordExpires?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index
UserSchema.index({ role: 1 });
