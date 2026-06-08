import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Đăng nhập, trả về access token + refresh token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về tokens và user info',
  })
  async login(
    @Req() req: Request & { user: UserDocument },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);

    // Lưu refresh token vào HTTP-only cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy access token mới từ refresh token trong cookie',
  })
  @ApiOkResponse({ description: 'Trả về access token mới' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Không có refresh token' });
    }

    const result = await this.authService.refresh(refreshToken);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới (STUDENT hoặc LECTURER)' })
  @ApiCreatedResponse({ description: 'Đăng ký thành công' })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất, xóa refresh token' })
  async logout(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user._id.toString());
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  @ApiOkResponse({ description: 'Thông tin user hiện tại' })
  getMe(@CurrentUser() user: UserDocument) {
    return this.authService.getMe(user._id.toString());
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi email đặt lại mật khẩu' })
  @ApiOkResponse({ description: 'Luôn trả về 200 để bảo mật' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }
}
