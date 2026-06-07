import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TopicsService, PaginatedTopics } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import type { TopicDocument } from './schemas/topic.schema';

@ApiTags('Topics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topics')
export class TopicsController {
  private readonly logger = new Logger(TopicsController.name);

  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({ summary: 'Tạo đề tài mới [LECTURER, ADMIN]' })
  @ApiCreatedResponse({ description: 'Tạo đề tài thành công' })
  async create(
    @Body() dto: CreateTopicDto,
    @CurrentUser() user: UserDocument,
  ): Promise<TopicDocument> {
    this.logger.log(`POST /topics - Creating topic for user ${user._id}`);
    this.logger.debug(`Request body: ${JSON.stringify(dto)}`);
    try {
      const result = await this.topicsService.create(dto, user);
      this.logger.log(`Topic created successfully: ${result._id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create topic:`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đề tài (có filter + phân trang)' })
  @ApiOkResponse({ description: 'Danh sách đề tài' })
  findAll(
    @Query() query: QueryTopicDto,
    @CurrentUser() user: UserDocument,
  ): Promise<PaginatedTopics> {
    return this.topicsService.findAll(query, user);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Thống kê đề tài [ADMIN]' })
  getStats(): Promise<Record<string, number>> {
    return this.topicsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đề tài' })
  findOne(@Param('id') id: string): Promise<TopicDocument> {
    return this.topicsService.findById(id);
  }

  @Put(':id')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({ summary: 'Cập nhật đề tài [LECTURER (chủ sở hữu), ADMIN]' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto,
    @CurrentUser() user: UserDocument,
  ): Promise<TopicDocument> {
    return this.topicsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({ summary: 'Xóa đề tài [LECTURER (chủ sở hữu), ADMIN]' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<void> {
    return this.topicsService.remove(id, user);
  }
}
