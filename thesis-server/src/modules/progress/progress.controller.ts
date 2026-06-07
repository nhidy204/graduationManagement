import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Sinh viên tạo entry tiến độ tuần [STUDENT]' })
  @ApiCreatedResponse({ description: 'Tạo entry thành công' })
  create(
    @Body()
    dto: CreateProgressDto,
    @CurrentUser()
    user: UserDocument,
  ) {
    return this.progressService.create(dto, user);
  }

  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Lấy toàn bộ tiến độ của student hiện tại [STUDENT]',
  })
  @ApiOkResponse({ description: 'Danh sách entries tiến độ' })
  findMyProgress(@CurrentUser() user: UserDocument) {
    return this.progressService.findMyProgress(user);
  }

  @Get('topic/:topicId')
  @ApiOperation({
    summary:
      'Lấy tiến độ theo topic (STUDENT xem của mình, LECTURER/ADMIN xem tất cả)',
  })
  @ApiOkResponse({ description: 'Danh sách entries tiến độ theo topic' })
  findByTopic(
    @Param('topicId') topicId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.progressService.findByTopic(topicId, user);
  }

  @Get('topic/:topicId/summary')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({
    summary: 'Thống kê tiến độ tất cả SV trong topic [LECTURER, ADMIN]',
  })
  getTopicSummary(@Param('topicId') topicId: string) {
    return this.progressService.getTopicProgressSummary(topicId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Thêm comment vào entry tiến độ' })
  @ApiCreatedResponse({ description: 'Thêm comment thành công' })
  addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.progressService.addComment(id, dto, user);
  }

  @Patch(':id/seen')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({
    summary: 'Giảng viên đánh dấu đã xem entry [LECTURER, ADMIN]',
  })
  markSeen(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.progressService.markSeen(id, user);
  }

  @Delete(':id/comments/:commentId')
  @ApiOperation({ summary: 'Xóa comment của chính mình' })
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.progressService.deleteComment(id, commentId, user);
  }
}
