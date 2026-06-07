import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import type { Role } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name!: string;

  @ApiProperty({ example: 'an.nv@university.edu.vn' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password!: string;

  @ApiProperty({ enum: ['STUDENT', 'LECTURER', 'ADMIN'] })
  @IsEnum(['STUDENT', 'LECTURER', 'ADMIN'], { message: 'Role không hợp lệ' })
  role!: Role;
}
