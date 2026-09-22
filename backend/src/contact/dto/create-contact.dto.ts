import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'أحمد القحطاني', description: 'اسم المرسل' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'البريد الإلكتروني للمرسل',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'استفسار عن أسعار الجملة',
    description: 'موضوع الرسالة',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    example: 'أريد معرفة أسعار الجملة للأكواب الورقية',
    description: 'محتوى الرسالة',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
