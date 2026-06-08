import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProgressDto {
  @ApiProperty({ example: '664f1b2c8e1a2b3c4d5e6f7a' })
  @IsMongoId()
  topicId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  weekNumber!: number;

  @ApiProperty({ example: 'Tuần 1 (07/04 - 13/04)' })
  @IsString()
  @IsNotEmpty()
  weekLabel!: string;

  @ApiProperty({ example: 'Đã hoàn thành phần thiết kế database' })
  @IsString()
  @MinLength(10, { message: 'Tóm tắt tối thiểu 10 ký tự' })
  summary!: string;

  @ApiProperty({ example: 'Tuần tới sẽ implement API' })
  @IsString()
  @MinLength(10, { message: 'Kế hoạch tối thiểu 10 ký tự' })
  plan!: string;

  @ApiPropertyOptional({ example: 25, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;
}
