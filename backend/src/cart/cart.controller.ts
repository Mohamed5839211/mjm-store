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
import { Throttle } from '@nestjs/throttler';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';

@ApiTags('السلة - Cart')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'جلب محتوى السلة' })
  getCart(@CurrentUser() user: AuthPrincipal) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @ApiOperation({ summary: 'إضافة منتج إلى السلة' })
  addItem(@CurrentUser() user: AuthPrincipal, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(
      user.id,
      dto.productId,
      dto.bundleId,
      dto.quantity,
    );
  }

  @Patch('items/:productId')
  @ApiOperation({
    summary: 'تعديل كمية عنصر في السلة (مرر bundleId كاستعلام لعناصر البكجات)',
  })
  updateQuantity(
    @CurrentUser() user: AuthPrincipal,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('bundleId') bundleId?: string,
    @Body() dto?: UpdateCartItemDto,
  ) {
    const bundle = bundleId === 'bundle' ? productId : undefined;
    const product = bundle === undefined ? productId : undefined;
    return this.cartService.updateItemQuantity(
      user.id,
      product,
      bundle,
      dto?.quantity ?? 1,
    );
  }

  @Delete('items/:productId')
  @ApiOperation({
    summary: 'إزالة عنصر من السلة (مرر bundleId كاستعلام لعناصر البكجات)',
  })
  removeItem(
    @CurrentUser() user: AuthPrincipal,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('bundleId') bundleId?: string,
  ) {
    const bundle = bundleId === 'bundle' ? productId : undefined;
    const product = bundle === undefined ? productId : undefined;
    return this.cartService.removeItem(user.id, product, bundle);
  }
}
