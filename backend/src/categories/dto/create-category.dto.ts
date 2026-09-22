import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'bags' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'أكياس نفاية' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Trash Bags', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: 'Category description...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'ShoppingBag', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: '/images/categories/bags.png', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'blue', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'primary', required: false })
  @IsString()
  @IsOptional()
  accent?: string;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
