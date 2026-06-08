import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateScoreDto {
  @ApiProperty()
  @IsString()
  criteriaId!: string;

  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalComment?: string;
}
