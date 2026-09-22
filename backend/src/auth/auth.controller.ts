import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, Public, type AuthPrincipal } from '../common/decorators';
import { getAppConfig } from '../config/app.config';

export const ACCESS_COOKIE = 'mjm_access';
export const REFRESH_COOKIE = 'mjm_refresh';

/**
 * Session-cookie policy (verified against OWASP ZAP-equivalent scan):
 * - httpOnly: always true (no JS access to tokens).
 * - sameSite: 'strict' (neutralizes CSRF for cookie flows alongside
 *   Bearer-header auth; no cross-site cookie sends needed by the app).
 * - secure: true in production (HTTPS) ONLY. On plain-HTTP localhost the
 *   Secure attribute would stop browsers storing/sending the cookie and
 *   break local dev, Playwright and axe-core runs — hence conditional.
 * - Domain: unset on purpose (host-only cookies, narrowest scope).
 * - Path '/': both session cookies share it; logout clears with identical
 *   attributes (see clearSessionCookies).
 * - Lifetimes: customers 15m access / 7d refresh; admins 2h access / 30d
 *   refresh (short-lived access limits post-logout JWT reuse to 15m/2h).
 */
function cookieOptions(maxAgeMs: number) {
  const { NODE_ENV } = getAppConfig();
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAgeMs,
  };
}

@ApiTags('المصادقة - Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    longLived: boolean,
  ) {
    res.cookie(
      ACCESS_COOKIE,
      tokens.accessToken,
      cookieOptions(longLived ? 2 * 3600 * 1000 : 15 * 60 * 1000),
    );
    res.cookie(
      REFRESH_COOKIE,
      tokens.refreshToken,
      cookieOptions(longLived ? 30 * 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000),
    );
  }

  private clearSessionCookies(res: Response) {
    // NOTE: the clearing cookies must carry the same Secure/SameSite/Path
    // attributes as the session cookies, otherwise browsers keep the
    // original (Secure, SameSite=Strict) cookies and logout silently fails
    // to clear them in production. HttpOnly is intentionally included too.
    const { NODE_ENV } = getAppConfig();
    const clearOpts = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };
    res.clearCookie(ACCESS_COOKIE, clearOpts);
    res.clearCookie(REFRESH_COOKIE, clearOpts);
  }

  @Post('register')
  @Public()
  @Throttle({
    default: { ttl: 60000, limit: 100 },
    short: { ttl: 300000, limit: 100 },
  })
  @ApiOperation({ summary: 'تسجيل حساب جديد' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setSessionCookies(res, result, false);
    return result;
  }

  @Post('login')
  @Public()
  @Throttle({
    default: { ttl: 60000, limit: 100 },
  })
  @ApiOperation({ summary: 'تسجيل الدخول للعملاء' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setSessionCookies(res, result, false);
    return result;
  }

  @Post('admin/login')
  @Public()
  @Throttle({
    default: { ttl: 60000, limit: 100 },
  })
  @ApiOperation({ summary: 'تسجيل الدخول للوحة الإدارة' })
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.adminLogin(dto);
    this.setSessionCookies(res, result, true);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الملف الشخصي للمستخدم الحالي' })
  getProfile(@CurrentUser() user: AuthPrincipal) {
    return this.authService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 300000, limit: 10 } })
  @ApiOperation({ summary: 'تحديث بيانات الملف الشخصي' })
  updateProfile(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @ApiOperation({ summary: 'تغيير كلمة المرور' })
  changePassword(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('refresh')
  @Public()
  @Throttle({ default: { ttl: 900000, limit: 10 } })
  @ApiOperation({ summary: 'تحديث رمز الوصول' })
  refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    // Accept the refresh token from the body (legacy/mobile) or the
    // HttpOnly cookie (browser flow) — whichever is present.
    const cookies = req.cookies as
      | Record<string, string | undefined>
      | undefined;
    const refreshToken = dto.refreshToken || cookies?.[REFRESH_COOKIE];
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 300000, limit: 20 } })
  @ApiOperation({ summary: 'تسجيل الخروج' })
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearSessionCookies(res);
    return { message: 'تم تسجيل الخروج بنجاح' };
  }
}
