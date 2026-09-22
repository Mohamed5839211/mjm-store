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
import { OffersService } from './offers.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto';
import { Public } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('العروض - Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'العروض النشطة' })
  findAll(
    @Query('type') type?: string,
    @Query('productId') productId?: string,
  ) {
    return this.offersService.findAll(
      type,
      productId ? parseInt(productId, 10) : undefined,
    );
  }

  @Post()
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء عرض (أدمن)' })
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Patch(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث عرض (أدمن)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف عرض (أدمن)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.remove(id);
  }
}
