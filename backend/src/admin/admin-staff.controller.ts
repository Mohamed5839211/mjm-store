import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/admin-staff.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

const STAFF_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

@ApiTags('إدارة فريق العمل (أدمن) - Admin Staff')
@Controller('admin/staff')
@Roles(AdminRole.super_admin)
@ApiBearerAuth()
export class AdminStaffController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة فريق العمل' })
  findAll() {
    return this.prisma.adminUser.findMany({
      select: STAFF_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'إضافة عضو فريق عمل جديد' })
  async create(@Body() dto: CreateStaffDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
      },
      select: STAFF_SELECT,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث بيانات عضو' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    const data: Prisma.AdminUserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.adminUser.update({
      where: { id },
      data,
      select: STAFF_SELECT,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عضو من الفريق' })
  async remove(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // Prevent deleting self
    if (user.id === id) {
      throw new ForbiddenException('لا يمكنك حذف حسابك الخاص');
    }

    return this.prisma.adminUser.delete({
      where: { id },
      select: STAFF_SELECT,
    });
  }
}
