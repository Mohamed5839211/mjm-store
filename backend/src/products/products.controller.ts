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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  QueryProductsDto,
  UpdateProductDto,
} from './dto/product.dto';
import { Public } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('المنتجات - Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'جلب قائمة المنتجات مع فلاتر وفرز' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'جلب تفاصيل منتج واحد' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء منتج جديد (أدمن)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث منتج (أدمن)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف/تعطيل منتج (أدمن)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
