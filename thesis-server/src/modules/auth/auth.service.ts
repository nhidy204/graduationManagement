import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Validate user cho LocalStrategy ──
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khoá');
    }
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }

  // ── Tạo access token ──
  private signAccessToken(user: UserDocument) {
    return this.jwtService.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );
  }

  // ── Tạo refresh token ──
  private signRefreshToken(user: UserDocument) {
    return this.jwtService.sign(
      { sub: user._id.toString() },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: '7d',
      },
    );
  }

  // ── Login ──
  async login(user: UserDocument) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // ── Refresh token ──
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      }) as unknown;

      const payloadObj = payload as { sub?: unknown };
      const user = await this.usersService.findById(String(payloadObj.sub));
      if (!user?.refreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const newAccessToken = this.signAccessToken(user);
      const newRefreshToken = this.signRefreshToken(user);

      await this.usersService.updateRefreshToken(
        user._id.toString(),
        newRefreshToken,
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException(
        'Refresh token hết hạn hoặc không hợp lệ',
      );
    }
  }

  // ── Logout ──
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công' };
  }

  // ── Get me ──
  async getMe(userId: string) {
    return this.usersService.findById(userId);
  }

  // ── Forgot password ──
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return { message: 'Nếu email tồn tại, link đặt lại đã được gửi' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    await this.usersService.setResetToken(dto.email, token, expires);

    // TODO: gửi email thực — hiện tại log ra console để dev test
    const resetUrl = `${this.config.get('clientUrl')}/vi/reset-password?token=${token}`;
    console.log(`\n🔑 Reset password link:\n${resetUrl}\n`);

    return { message: 'Nếu email tồn tại, link đặt lại đã được gửi' };
  }

  // ── Reset password ──
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    await this.usersService.update(user._id.toString(), {
      password: newPassword,
    });

    // Xóa token sau khi dùng
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return { message: 'Đặt lại mật khẩu thành công' };
  }
  // ── Register ──
  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.login(user);
  }
}
