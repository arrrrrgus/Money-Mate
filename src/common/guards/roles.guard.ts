import { Role } from '@/database/generated/prisma/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AccessTokenPayload } from '@/auth/types/jwt.payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const targetClass = context.getClass();

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      handler,
      targetClass
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AccessTokenPayload }>();
    const user = request.user;
    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
