import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTicketDto {
  @ApiProperty({ example: 'مشكلة في الطلب #1234' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ example: 'مرحباً، لدي استفسار بخصوص موعد التوصيل...' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateMessageDto {
  @ApiProperty({ example: 'شكراً لكم على الرد، بانتظاركم.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
