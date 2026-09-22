import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { type?: string; role?: AdminRole } }>();
    // Only admin principals can satisfy role requirements — a customer
    // JWT (which carries no role) must never pass, even by coincidence.
    if (!user || user.type !== 'admin') {
      return false;
    }
    return requiredRoles.includes(user.role as AdminRole);
  }
}
