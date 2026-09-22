import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePrintingRequestDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  businessType: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  contactPerson: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  productType: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedQuantity: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class UpdatePrintingRequestDto extends PartialType(
  CreatePrintingRequestDto,
) {
  @ApiPropertyOptional({ description: 'Admin: new status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Admin: quoted price' })
  @Type(() => Number)
  @IsOptional()
  quotedPrice?: number;

  @ApiPropertyOptional({ description: 'Admin: internal notes' })
  @IsString()
  @IsOptional()
  internalNotes?: string;
}
