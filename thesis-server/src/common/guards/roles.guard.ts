import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user: any }>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userRole = user?.role;
    
    if (!userRole) {
      throw new ForbiddenException(
        'Tài khoản của bạn không có phân quyền. Vui lòng liên hệ quản trị viên.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!required.includes(userRole as Role)) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${required.join(', ')}`,
      );
    }

    return true;
  }
}
