import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { getAppConfig } from '../config/app.config';
import { Roles } from '../auth/decorators/roles.decorator';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/;

function productsStorage() {
  return diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(__dirname, '..', '..', 'uploads', 'products');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
    },
  });
}

function imageFileFilter(
  req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) {
  if (!file.originalname.match(IMAGE_EXTENSIONS)) {
    return cb(new BadRequestException('فقط ملفات الصور مسموح بها!'), false);
  }
  cb(null, true);
}

function publicUploadUrl(filename: string): string {
  return `${getAppConfig().PUBLIC_URL}/uploads/products/${filename}`;
}

@ApiTags('الوسائط - Media')
@Controller('media')
@Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
export class MediaController {
  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'رفع صورة واحدة (طاقم الإدارة)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: productsStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('لم يتم رفع أي ملف');
    }
    return {
      url: publicUploadUrl(file.filename),
      filename: file.filename,
    };
  }

  @Post('upload-multiple')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'رفع صور متعددة بحد أقصى 5 (طاقم الإدارة)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: productsStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('لم يتم رفع أي ملفات');
    }
    return files.map((file) => ({
      url: publicUploadUrl(file.filename),
      filename: file.filename,
    }));
  }
}
