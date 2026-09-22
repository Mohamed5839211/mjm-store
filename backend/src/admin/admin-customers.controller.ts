import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerDto } from './dto/admin-customer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

@ApiTags('إدارة العملاء (أدمن) - Admin Customers')
@Controller('admin/customers')
@Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
@ApiBearerAuth()
export class AdminCustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة جميع العملاء' })
  findAll() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBusiness: true,
        businessName: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث بيانات عميل' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    const data: {
      name?: string;
      phone?: string;
      isBusiness?: boolean;
      businessName?: string | null;
      passwordHash?: string;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.isBusiness !== undefined) data.isBusiness = dto.isBusiness;
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    return this.prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBusiness: true,
        businessName: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عميل' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
