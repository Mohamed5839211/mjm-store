import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { PrintingRequestsService } from './printing-requests.service';
import {
  CreatePrintingRequestDto,
  UpdatePrintingRequestDto,
} from './dto/printing-request.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

const LOGO_MIME = /\/(jpg|jpeg|png|gif|pdf|svg)$/;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

@ApiTags('طلبات الطباعة - Printing Requests')
@Controller()
export class PrintingRequestsController {
  constructor(private readonly service: PrintingRequestsService) {}

  @Post('printing-requests/upload-logo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'رفع شعار للطباعة' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', 'uploads', 'logos');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(LOGO_MIME)) {
          return cb(new BadRequestException('نوع الملف غير مدعوم'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_LOGO_BYTES },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('لم يتم رفع أي ملف');
    }
    return { logoUrl: `/uploads/logos/${file.filename}` };
  }

  @Post('printing-requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء طلب طباعة جديد' })
  create(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: CreatePrintingRequestDto,
  ) {
    return this.service.create({ ...dto, customerId: user.id });
  }

  @Get('printing-requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'طلبات الطباعة الخاصة بالعميل' })
  findMyRequests(@CurrentUser() user: AuthPrincipal) {
    return this.service.findByCustomer(user.id);
  }

  @Get('admin/printing-requests')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جميع طلبات الطباعة (أدمن)' })
  findAll(
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({ status, dateFrom, dateTo, page, limit });
  }

  @Get('admin/printing-requests/:id')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تفاصيل طلب طباعة (أدمن)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch('admin/printing-requests/:id')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث طلب طباعة (أدمن)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrintingRequestDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('admin/printing-requests/:id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف طلب طباعة (أدمن)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
