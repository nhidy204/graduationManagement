import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: '664f1b2c8e1a2b3c4d5e6f7a' })
  @IsMongoId({ message: 'topicId không hợp lệ' })
  topicId!: string;

  @ApiPropertyOptional({ example: 'Em có kinh nghiệm về React và Node.js...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
