import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTopicDto } from './create-topic.dto';
import type { TopicStatus } from '../schemas/topic.schema';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'FULL', 'CLOSED'])
  status?: TopicStatus;
}
