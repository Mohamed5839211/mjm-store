import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['super_admin', 'manager', 'staff'] })
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
