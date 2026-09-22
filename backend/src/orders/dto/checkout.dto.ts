import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CheckoutItemDto {
  @ApiPropertyOptional({
    description: 'Product ID (one of productId/bundleId required)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  productId?: number;

  @ApiPropertyOptional({
    description: 'Bundle ID (one of productId/bundleId required)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  bundleId?: number;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  shippingAddressId: number;

  @ApiProperty({ enum: ['mada', 'visa', 'apple_pay', 'tamara', 'cod'] })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Cart snapshot from the client. When omitted, the server-side cart is used.',
    type: [CheckoutItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  @IsOptional()
  items?: CheckoutItemDto[];
}
