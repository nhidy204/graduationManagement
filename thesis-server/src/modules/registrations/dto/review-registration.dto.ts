import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewRegistrationDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  action!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Sinh viên chưa đủ nền tảng kỹ thuật' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectReason?: string;
}
