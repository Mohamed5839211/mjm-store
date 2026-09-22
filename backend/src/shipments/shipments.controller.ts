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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { ShipmentsService } from './shipments.service';
import {
  CreateShippingZoneDto,
  UpdateShippingProviderDto,
  UpdateShippingZoneDto,
} from './dto/shipment.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('الشحن - Shipments')
@Controller('admin')
@Roles(AdminRole.super_admin, AdminRole.manager)
@ApiBearerAuth()
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  // Shipments
  @Get('shipments')
  @ApiOperation({ summary: 'جميع الشحنات' })
  findAllShipments(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shipmentsService.findAllShipments({ status, page, limit });
  }

  @Patch('shipments/:id/status')
  @ApiOperation({ summary: 'تحديث حالة شحنة' })
  updateShipmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.shipmentsService.updateShipmentStatus(id, status);
  }

  // Providers
  @Get('shipping-providers')
  @ApiOperation({ summary: 'شركات الشحن' })
  findAllProviders() {
    return this.shipmentsService.findAllProviders();
  }

  @Patch('shipping-providers/:id')
  @ApiOperation({ summary: 'تحديث شركة شحن' })
  updateProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateShippingProviderDto,
  ) {
    return this.shipmentsService.updateProvider(id, data);
  }

  // Zones
  @Get('shipping-zones')
  @ApiOperation({ summary: 'مناطق الشحن' })
  findAllZones() {
    return this.shipmentsService.findAllZones();
  }

  @Post('shipping-zones')
  @ApiOperation({ summary: 'إنشاء منطقة شحن' })
  createZone(@Body() data: CreateShippingZoneDto) {
    return this.shipmentsService.createZone(data);
  }

  @Patch('shipping-zones/:id')
  @ApiOperation({ summary: 'تحديث منطقة شحن' })
  updateZone(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateShippingZoneDto,
  ) {
    return this.shipmentsService.updateZone(id, data);
  }

  @Delete('shipping-zones/:id')
  @ApiOperation({ summary: 'حذف منطقة شحن' })
  deleteZone(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.deleteZone(id);
  }
}
