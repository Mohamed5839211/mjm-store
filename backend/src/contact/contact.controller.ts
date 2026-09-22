import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminRole } from '@prisma/client';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { Public } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('رسائل التواصل - Contact')
@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // ---- Public Endpoint (For Frontend) ----
  @Post('contact')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'إرسال رسالة تواصل جديدة من الموقع' })
  @ApiResponse({ status: 201, description: 'تم إرسال الرسالة بنجاح' })
  create(@Body() createContactMessageDto: CreateContactMessageDto) {
    return this.contactService.create(createContactMessageDto);
  }

  // ---- Admin Endpoints ----
  @Get('admin/contact')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تصفح جميع الرسائل (للإدارة)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['new', 'read', 'replied'],
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.contactService.findAll(page, limit, search, status);
  }

  @Get('admin/contact/:id')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'عرض تفاصيل رسالة معينة' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @Patch('admin/contact/:id/status')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث حالة الرسالة (مقروءة، مجاب عليها، الخ)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.contactService.updateStatus(id, status);
  }

  @Delete('admin/contact/:id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف رسالة' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}
