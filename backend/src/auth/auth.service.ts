import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';

import { MockIntegrationsService } from '../common/integrations/mock-integrations.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mockIntegrations: MockIntegrationsService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }

    const existingPhone = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('رقم الجوال مسجل مسبقاً');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        isBusiness: dto.isBusiness || false,
        businessName: dto.businessName,
        crNumber: dto.crNumber,
      },
    });

    // Notify user via WhatsApp
    await this.mockIntegrations.sendWhatsAppMessage(
      customer.phone,
      `مرحباً ${customer.name}، أهلاً بك في متجر MJM. استمتع بتجربة تسوق فريدة!`,
    );

    const tokens = await this.generateTokens(
      customer.id,
      customer.email,
      'customer',
    );

    return {
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isBusiness: customer.isBusiness,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: dto.emailOrPhone }, { phone: dto.emailOrPhone }],
      },
    });

    if (!customer) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      customer.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const tokens = await this.generateTokens(
      customer.id,
      customer.email,
      'customer',
    );

    return {
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isBusiness: customer.isBusiness,
        type: 'customer',
      },
      ...tokens,
    };
  }

  async adminLogin(dto: LoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.emailOrPhone },
    });

    if (!admin) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة للإدارة');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة للإدارة');
    }

    const tokens = await this.generateTokens(admin.id, admin.email, 'admin');

    return {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      },
      ...tokens,
    };
  }

  async getProfile(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBusiness: true,
        businessName: true,
        crNumber: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    return customer;
  }

  async updateProfile(customerId: number, dto: UpdateProfileDto) {
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        name: dto.name,
        phone: dto.phone,
        businessName: dto.businessName,
        crNumber: dto.crNumber,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBusiness: true,
        businessName: true,
        crNumber: true,
      },
    });
    return customer;
  }

  async changePassword(
    customerId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      customer.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  async refreshTokens(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('رمز التحديث غير صالح');
    }
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        email: string;
        type: string;
      }>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Strict token-kind check + the account must still exist.
      const type =
        payload.type === 'admin_refresh'
          ? 'admin'
          : payload.type === 'customer_refresh'
            ? 'customer'
            : null;
      if (!type) {
        throw new UnauthorizedException('رمز التحديث غير صالح');
      }
      const exists =
        type === 'admin'
          ? await this.prisma.adminUser.findUnique({
              where: { id: payload.sub },
              select: { id: true },
            })
          : await this.prisma.customer.findUnique({
              where: { id: payload.sub },
              select: { id: true },
            });
      if (!exists) {
        throw new UnauthorizedException('رمز التحديث غير صالح');
      }

      return this.generateTokens(payload.sub, payload.email, type);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('رمز التحديث غير صالح');
    }
  }

  private async generateTokens(
    userId: number,
    email: string,
    type: 'admin' | 'customer',
  ) {
    const payload = {
      sub: userId,
      email,
      type,
      iat: Math.floor(Date.now() / 1000),
    };

    const isAdmin = type === 'admin';
    const accessExp: StringValue = isAdmin
      ? '2h'
      : (this.configService.get<string>(
          'JWT_EXPIRATION',
          '15m',
        ) as StringValue);
    const refreshExp: StringValue = isAdmin
      ? '30d'
      : (this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ) as StringValue);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessExp,
      }),
      this.jwtService.signAsync(
        { ...payload, type: `${type}_refresh` },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshExp,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
