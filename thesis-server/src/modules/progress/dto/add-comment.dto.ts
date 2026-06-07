import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({ example: 'Em cần chú ý thêm về việc xử lý lỗi nhé.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
