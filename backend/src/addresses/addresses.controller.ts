import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CurrentUser, type AuthPrincipal } from '../common/decorators';

@ApiTags('العناوين - Addresses')
@Controller('addresses')
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'عناوين المستخدم' })
  findAll(@CurrentUser() user: AuthPrincipal) {
    return this.addressesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة عنوان جديد' })
  create(@CurrentUser() user: AuthPrincipal, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل عنوان' })
  update(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عنوان' })
  remove(
    @CurrentUser() user: AuthPrincipal,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.remove(user.id, id);
  }
}
