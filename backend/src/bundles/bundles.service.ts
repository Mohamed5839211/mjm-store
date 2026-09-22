import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBundleDto, UpdateBundleDto } from './bundles.dto';

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly = false) {
    return this.prisma.bundle.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                discountPrice: true,
                images: { take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
        },
      },
    });
    if (!bundle) throw new NotFoundException('البكج غير موجود');
    return bundle;
  }

  async create(dto: CreateBundleDto) {
    return this.prisma.bundle.create({
      data: {
        name: dto.name,
        description: dto.description,
        bundlePrice: dto.bundlePrice,
        originalPrice: dto.originalPrice,
        badgeText: dto.badgeText,
        imageUrl: dto.imageUrl,
        isActive: dto.isActive ?? true,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async update(id: number, dto: UpdateBundleDto) {
    const bundle = await this.prisma.bundle.findUnique({ where: { id } });
    if (!bundle) throw new NotFoundException('البكج غير موجود');

    // Item replacement + bundle update must be atomic.
    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.bundleItem.deleteMany({ where: { bundleId: id } });
      }

      return tx.bundle.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          bundlePrice: dto.bundlePrice,
          originalPrice: dto.originalPrice,
          badgeText: dto.badgeText,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive,
          ...(dto.items && {
            items: {
              create: dto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          }),
        },
        include: { items: true },
      });
    });
  }

  async remove(id: number) {
    const bundle = await this.prisma.bundle.findUnique({ where: { id } });
    if (!bundle) throw new NotFoundException('البكج غير موجود');
    await this.prisma.bundle.delete({ where: { id } });
    return { message: 'تم حذف البكج بنجاح' };
  }
}
