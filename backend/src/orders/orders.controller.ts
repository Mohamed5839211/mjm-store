import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminRole, OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('الطلبات - Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إتمام الطلب' })
  checkout(@CurrentUser() user: AuthPrincipal, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.id, dto);
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'طلبات المستخدم' })
  findMyOrders(@CurrentUser() user: AuthPrincipal) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تفاصيل طلب واحد' })
  findOneOrder(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOneOrder(user.id, id);
  }

  @Get('admin/orders')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جميع الطلبات (أدمن)' })
  findAllOrders(
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAllOrders({
      status,
      paymentMethod,
      page,
      limit,
    });
  }

  @Patch('admin/orders/:id/status')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث حالة الطلب (أدمن)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
