import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tạo tài khoản mới [ADMIN]' })
  @ApiCreatedResponse({ description: 'Tạo thành công' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách người dùng [ADMIN]' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['ALL', 'STUDENT', 'LECTURER', 'ADMIN'],
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Danh sách người dùng có phân trang' })
  findAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ role, search, page, limit });
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Thống kê người dùng [ADMIN]' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy chi tiết người dùng [ADMIN]' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật người dùng [ADMIN]' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Khoá / Mở tài khoản [ADMIN]' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xoá tài khoản [ADMIN]' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
