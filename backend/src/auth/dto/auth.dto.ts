import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0501234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isBusiness?: boolean;

  @ApiPropertyOptional({ example: 'شركة النجاح' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsString()
  @IsOptional()
  crNumber?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ahmed@example.com' })
  @IsString()
  @IsNotEmpty()
  emailOrPhone: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    required: false,
    description: 'Optional when the HttpOnly refresh cookie is present',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'أحمد محمد' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'شركة النجاح' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsString()
  @IsOptional()
  crNumber?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
