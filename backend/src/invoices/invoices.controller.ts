import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express';

@ApiTags('الفواتير - Invoices')
@Controller('admin/invoices')
@Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'جميع الفواتير' })
  findAll(@Query('status') status?: string, @Query('page') page?: string) {
    return this.invoicesService.findAll({ status, page });
  }

  @Get(':id/download-pdf')
  @ApiOperation({ summary: 'تحميل الفاتورة PDF' })
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.invoicesService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل فاتورة' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Post('generate/:orderId')
  @ApiOperation({ summary: 'توليد فاتورة لطلب' })
  generateForOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.invoicesService.generateForOrder(orderId);
  }
}
