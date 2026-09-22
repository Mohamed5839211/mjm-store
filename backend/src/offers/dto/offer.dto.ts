import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { OfferType } from '@prisma/client';

export class CreateOfferDto {
  @IsEnum(OfferType)
  type: OfferType;

  @IsNumber()
  discountValue: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productIds?: number[];
}

export class UpdateOfferDto {
  @IsEnum(OfferType)
  @IsOptional()
  type?: OfferType;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productIds?: number[];
}
