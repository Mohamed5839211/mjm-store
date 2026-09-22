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
import { BundlesService } from './bundles.service';
import { CreateBundleDto, UpdateBundleDto } from './bundles.dto';
import { Public } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('البكجات - Bundles')
@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'قائمة البكجات' })
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.bundlesService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'تفاصيل بكج' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bundlesService.findOne(id);
  }

  @Post()
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء بكج (أدمن)' })
  create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(createBundleDto);
  }

  @Patch(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث بكج (أدمن)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBundleDto: UpdateBundleDto,
  ) {
    return this.bundlesService.update(id, updateBundleDto);
  }

  @Delete(':id')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف بكج (أدمن)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bundlesService.remove(id);
  }
}
