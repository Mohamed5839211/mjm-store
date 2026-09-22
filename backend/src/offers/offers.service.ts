import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string, productId?: number) {
    const where: Prisma.OfferWhereInput = {
      isActive: true,
      endDate: { gte: new Date() },
    };
    if (type) where.type = type as OfferType;
    if (productId) where.offerProducts = { some: { productId } };

    return this.prisma.offer.findMany({
      where,
      include: {
        offerProducts: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async create(dto: CreateOfferDto) {
    return this.prisma.offer.create({
      data: {
        type: dto.type,
        discountValue: dto.discountValue,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
        offerProducts: {
          create: (dto.productIds ?? []).map((productId) => ({ productId })),
        },
      },
      include: { offerProducts: true },
    });
  }

  async update(id: number, dto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('العرض غير موجود');

    const { productIds, ...scalar } = dto;
    const data: Prisma.OfferUpdateInput = {
      ...scalar,
      ...(scalar.startDate ? { startDate: new Date(scalar.startDate) } : {}),
      ...(scalar.endDate ? { endDate: new Date(scalar.endDate) } : {}),
    };

    if (productIds) {
      await this.prisma.offerProduct.deleteMany({ where: { offerId: id } });
      data.offerProducts = {
        create: productIds.map((productId) => ({ productId })),
      };
    }

    return this.prisma.offer.update({
      where: { id },
      data,
      include: { offerProducts: true },
    });
  }

  async remove(id: number) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('العرض غير موجود');
    await this.prisma.offer.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'تم تعطيل العرض' };
  }
}
