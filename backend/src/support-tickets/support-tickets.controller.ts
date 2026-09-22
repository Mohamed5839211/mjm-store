import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupportTicketsService } from './support-tickets.service';
import { CreateMessageDto, CreateTicketDto } from './dto/support-ticket.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';

@ApiTags('الدعم - Support')
@ApiBearerAuth()
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء تذكرة دعم جديدة' })
  create(@CurrentUser() user: AuthPrincipal, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'عرض تذاكر الدعم الخاصة بي' })
  findAll(@CurrentUser() user: AuthPrincipal) {
    return this.supportService.getCustomerTickets(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض تفاصيل تذكرة' })
  findOne(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supportService.getTicketDetails(id, user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'إضافة رد على التذكرة' })
  addMessage(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMessageDto,
  ) {
    return this.supportService.addMessage(id, user.id, dto);
  }
}
