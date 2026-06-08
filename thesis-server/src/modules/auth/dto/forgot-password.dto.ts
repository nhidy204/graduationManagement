import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'an.nv@university.edu.vn' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;
}
