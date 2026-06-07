import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { GradeType } from '../schemas/grade.schema';

export class GradeCriteriaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  criteriaId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  weight!: number;

  @ApiProperty()
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class SubmitGradeDto {
  @ApiProperty()
  @IsMongoId()
  studentId!: string;

  @ApiProperty()
  @IsMongoId()
  topicId!: string;

  @ApiProperty({ enum: ['SUPERVISOR', 'REVIEWER'] })
  @IsEnum(['SUPERVISOR', 'REVIEWER'])
  type!: GradeType;

  @ApiProperty({ type: [GradeCriteriaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeCriteriaDto)
  criteria!: GradeCriteriaDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalComment?: string;
}
