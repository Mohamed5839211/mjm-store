import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { WaterSubscriptionsService } from './water-subscriptions.service';
import { CreateWaterSubscriptionDto } from './dto/water-subscription.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('اشتراكات المياه - Water Subscriptions')
@Controller('water-subscriptions')
@ApiBearerAuth()
export class WaterSubscriptionsController {
  constructor(private readonly service: WaterSubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء اشتراك مياه جديد' })
  create(
    @CurrentUser() user: AuthPrincipal,
    @Body() dto: CreateWaterSubscriptionDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'اشتراكاتي' })
  findMySubscriptions(@CurrentUser() user: AuthPrincipal) {
    return this.service.findByCustomer(user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'إلغاء اشتراك' })
  cancel(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.cancel(user.id, id);
  }

  @Get('admin/all')
  @Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
  @ApiOperation({ summary: 'جميع الاشتراكات (أدمن)' })
  findAllAdmin() {
    return this.service.findAllAdmin();
  }
}
