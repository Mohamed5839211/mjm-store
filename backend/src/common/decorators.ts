import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

/** Authenticated principal attached by JwtStrategy. */
export interface AuthPrincipal {
  id: number;
  email: string;
  name?: string;
  role?: string;
  type: 'admin' | 'customer';
}

/** `@CurrentUser()` — typed access to `req.user` (replaces `@Request() req: any`). */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthPrincipal | undefined,
    ctx: ExecutionContext,
  ): AuthPrincipal | AuthPrincipal[keyof AuthPrincipal] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthPrincipal }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

/** `@Public()` — opts a route out of the global JWT guard. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
