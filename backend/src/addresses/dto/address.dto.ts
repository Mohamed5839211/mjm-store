import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'الرياض' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'حي النرجس' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'شارع الأمير محمد' })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({ example: '15' })
  @IsString()
  @MaxLength(50)
  buildingNo: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
