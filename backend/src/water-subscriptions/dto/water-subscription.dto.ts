import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubscriptionFrequency, SubscriptionType } from '@prisma/client';

export class CreateWaterSubscriptionDto {
  @ApiProperty({ enum: ['one_time', 'monthly'] })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantityPerOrder: number;

  @ApiProperty({ enum: ['weekly', 'monthly'] })
  @IsEnum(SubscriptionFrequency)
  frequency: SubscriptionFrequency;
}

export class CancelSubscriptionDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  id?: number;
}
