import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import type { TopicStatus } from '../schemas/topic.schema';

export class CreateTopicDto {
  @ApiProperty({ example: 'Xây dựng hệ thống quản lý kho hàng với IoT' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Tiêu đề tối thiểu 10 ký tự' })
  title!: string;

  @ApiProperty({ example: 'Nghiên cứu và phát triển hệ thống...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Mô tả tối thiểu 50 ký tự' })
  description!: string;

  @ApiPropertyOptional({ example: 'Có kiến thức về Node.js, React' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({ example: 'Kỹ thuật phần mềm' })
  @IsString()
  @IsNotEmpty()
  major!: string;

  @ApiPropertyOptional({ type: [String], example: ['React', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ example: 2, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  maxStudents!: number;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED'])
  status?: TopicStatus;
}
