import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

function cookieExtractor(req: {
  cookies?: Record<string, string | undefined>;
}): string | null {
  return req?.cookies?.['mjm_access'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Dual auth: Bearer header first (mobile/legacy), then the
      // HttpOnly session cookie (browser flow).
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    type: 'admin' | 'customer';
  }) {
    if (payload.type === 'admin') {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });
      if (!admin) throw new UnauthorizedException('المسؤول غير موجود');
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin',
      };
    } else {
      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
      });
      if (!customer) throw new UnauthorizedException('المستخدم غير موجود');
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        type: 'customer',
      };
    }
  }
}
