import {
  Controller,
  Get,
  Post,
  Patch,
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
import { GradingService } from './grading.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Grading')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post('init')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({
    summary: 'Khởi tạo phiếu chấm điểm [LECTURER, ADMIN]',
  })
  @ApiCreatedResponse({ description: 'Phiếu chấm điểm đã được tạo' })
  initGrade(
    @Body()
    body: {
      studentId: string;
      topicId: string;
      type: 'SUPERVISOR' | 'REVIEWER';
    },
    @CurrentUser() user: UserDocument,
  ) {
    return this.gradingService.initGrade(
      body.studentId,
      body.topicId,
      body.type,
      user._id.toString(),
    );
  }

  @Get('my')
  @Roles('LECTURER')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu chấm của giảng viên [LECTURER]',
  })
  @ApiOkResponse({ description: 'Danh sách phiếu chấm' })
  findMyGrades(@CurrentUser() user: UserDocument) {
    return this.gradingService.findMyGrades(user);
  }

  @Patch(':id/score')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({ summary: 'Cập nhật điểm tiêu chí [LECTURER, ADMIN]' })
  updateScore(
    @Param('id') id: string,
    @Body() dto: UpdateScoreDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.gradingService.updateScore(id, dto, user);
  }

  @Patch(':id/submit')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({
    summary: 'Gửi điểm chính thức (không thể hoàn tác) [LECTURER, ADMIN]',
  })
  submitGrade(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.gradingService.submitGrade(id, user);
  }

  @Get('results/:studentId')
  @ApiOperation({ summary: 'Lấy kết quả tổng hợp của 1 sinh viên' })
  @ApiOkResponse({ description: 'Kết quả điểm tổng hợp' })
  getStudentResult(@Param('studentId') studentId: string) {
    return this.gradingService.getStudentResult(studentId);
  }

  @Get('topic/:topicId/results')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({
    summary: 'Lấy kết quả tất cả SV trong topic [LECTURER, ADMIN]',
  })
  getTopicResults(@Param('topicId') topicId: string) {
    return this.gradingService.getTopicResults(topicId);
  }

  @Post('assign-reviewer')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin phân công giảng viên phản biện [ADMIN]' })
  assignReviewer(
    @Body() body: { studentId: string; topicId: string; reviewerId: string },
  ) {
    return this.gradingService.assignReviewer(
      body.studentId,
      body.topicId,
      body.reviewerId,
    );
  }
}
