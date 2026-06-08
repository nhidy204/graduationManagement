import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Registrations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Sinh viên đăng ký đề tài [STUDENT]' })
  @ApiCreatedResponse({
    description: 'Đăng ký thành công, chờ giảng viên duyệt',
  })
  create(
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.registrationsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn đăng ký' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ALL', 'PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'topicId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Danh sách đơn đăng ký' })
  findAll(
    @CurrentUser() user: UserDocument,
    @Query('status') status?: string,
    @Query('topicId') topicId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.registrationsService.findAll(
      { status, topicId, page, limit },
      user,
    );
  }

  @Get('my-status')
  @ApiOperation({
    summary: 'Lấy trạng thái đăng ký hiện tại của student [STUDENT]',
  })
  getMyStatus(@CurrentUser() user: UserDocument) {
    return this.registrationsService.getMyStatus(user);
  }

  @Patch(':id/review')
  @Roles('LECTURER', 'ADMIN')
  @ApiOperation({ summary: 'Duyệt hoặc từ chối đơn đăng ký [LECTURER, ADMIN]' })
  @ApiOkResponse({ description: 'Xử lý đơn thành công' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewRegistrationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.registrationsService.review(id, dto, user);
  }

  @Delete(':id')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Sinh viên huỷ đơn đăng ký đang PENDING [STUDENT]' })
  cancel(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.registrationsService.cancel(id, user);
  }
}
