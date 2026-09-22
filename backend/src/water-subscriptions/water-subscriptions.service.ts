import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaterSubscriptionDto } from './dto/water-subscription.dto';

@Injectable()
export class WaterSubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: number, dto: CreateWaterSubscriptionDto) {
    return this.prisma.waterSubscription.create({
      data: {
        customerId,
        type: dto.type, // 'one_time' or 'monthly'
        quantityPerOrder: dto.quantityPerOrder,
        frequency: dto.frequency, // 'weekly' or 'monthly'
        status: 'active',
        nextDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to next week
      },
    });
  }

  async findByCustomer(customerId: number) {
    return this.prisma.waterSubscription.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(customerId: number, id: number) {
    const sub = await this.prisma.waterSubscription.findFirst({
      where: { id, customerId },
    });
    if (!sub) throw new NotFoundException('الاشتراك غير موجود');

    return this.prisma.waterSubscription.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async findAllAdmin() {
    return this.prisma.waterSubscription.findMany({
      include: { customer: { select: { name: true, phone: true } } },
    });
  }
}
