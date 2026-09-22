import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsObject, IsOptional } from 'class-validator';
import { CmsService } from './cms.service';
import { Public } from '../common/decorators';
import { Roles } from '../auth/decorators/roles.decorator';

class CmsContentDto {
  @IsObject()
  @IsOptional()
  value?: Record<string, unknown>;

  [key: string]: unknown;
}

@ApiTags('إدارة المحتوى - CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('home')
  @Public()
  @ApiOperation({ summary: 'محتوى الصفحة الرئيسية' })
  getHomepage() {
    return this.cmsService.getHomepage();
  }

  @Patch('admin/home')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث محتوى الصفحة الرئيسية (أدمن)' })
  updateHomepage(@Body() data: CmsContentDto) {
    return this.cmsService.updateHomepage(data);
  }

  @Get('pages/:slug')
  @Public()
  @ApiOperation({ summary: 'محتوى صفحة ثابتة' })
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }

  @Patch('admin/pages/:slug')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث صفحة ثابتة (أدمن)' })
  updatePage(@Param('slug') slug: string, @Body() data: CmsContentDto) {
    return this.cmsService.updatePage(slug, data);
  }

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'جلب إعدادات المتجر' })
  getSettings() {
    return this.cmsService.getSettings();
  }

  @Patch('admin/settings')
  @Roles(AdminRole.super_admin, AdminRole.manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث إعدادات المتجر (أدمن)' })
  updateSettings(@Body() data: CmsContentDto) {
    return this.cmsService.updateSettings(data);
  }
}
