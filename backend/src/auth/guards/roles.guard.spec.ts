import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

function mockContext(
  user: unknown,
  roles: AdminRole[] | undefined,
): { guard: RolesGuard; ctx: ExecutionContext } {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(roles),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);
  const ctx = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
  return { guard, ctx };
}

describe('RolesGuard', () => {
  it('allows when no roles are required', () => {
    const { guard, ctx } = mockContext(null, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows admins with a matching role', () => {
    const { guard, ctx } = mockContext(
      { id: 1, type: 'admin', role: AdminRole.manager },
      [AdminRole.super_admin, AdminRole.manager],
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies customers even when a role list exists', () => {
    const { guard, ctx } = mockContext({ id: 5, type: 'customer' }, [
      AdminRole.super_admin,
      AdminRole.manager,
      AdminRole.staff,
    ]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies admins with a non-matching role', () => {
    const { guard, ctx } = mockContext(
      { id: 2, type: 'admin', role: AdminRole.staff },
      [AdminRole.super_admin],
    );
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies anonymous requests on guarded routes', () => {
    const { guard, ctx } = mockContext(undefined, [AdminRole.staff]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('uses the roles metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
