import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPageQuery, toPaginated } from '../common/pagination';
import {
  CreateShippingZoneDto,
  UpdateShippingProviderDto,
  UpdateShippingZoneDto,
} from './dto/shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  // Shipment Methods
  async findAllShipments(filters: {
    status?: string;
    page?: unknown;
    limit?: unknown;
  }) {
    const query = toPageQuery(filters.page, filters.limit);
    const where: Prisma.ShipmentWhereInput = {};
    if (filters.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          order: {
            include: {
              customer: { select: { name: true, phone: true } },
              address: true,
            },
          },
          provider: true,
        },
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async updateShipmentStatus(id: number, status: string) {
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });
    if (!shipment)
      throw new NotFoundException('���?�?�?�?�?�? �?�?�? �?�?�?�?�?�?');

    const allowed = [
      'pending',
      'label_created',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!allowed.includes(status)) {
      throw new BadRequestException('حالة الشحنة غير صالحة');
    }

    return this.prisma.shipment.update({
      where: { id },
      data: { status },
    });
  }

  // Shipping Provider Methods
  async findAllProviders() {
    return this.prisma.shippingProvider.findMany();
  }

  async updateProvider(id: number, data: UpdateShippingProviderDto) {
    const provider = await this.prisma.shippingProvider.findUnique({
      where: { id },
    });
    if (!provider) throw new NotFoundException('شركة الشحن غير موجودة');
    return this.prisma.shippingProvider.update({
      where: { id },
      data,
    });
  }

  // Shipping Zones Methods
  async findAllZones() {
    return this.prisma.shippingZone.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createZone(data: CreateShippingZoneDto) {
    return this.prisma.shippingZone.create({
      data: {
        ...data,
        baseRate: new Prisma.Decimal(data.baseRate),
        freeShippingThreshold: data.freeShippingThreshold
          ? new Prisma.Decimal(data.freeShippingThreshold)
          : null,
      },
    });
  }

  async updateZone(id: number, data: UpdateShippingZoneDto) {
    const zone = await this.prisma.shippingZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('منطقة الشحن غير موجودة');
    const updateData: Prisma.ShippingZoneUpdateInput = { ...data };
    if (data.baseRate !== undefined)
      updateData.baseRate = new Prisma.Decimal(data.baseRate);
    if (data.freeShippingThreshold !== undefined) {
      updateData.freeShippingThreshold = data.freeShippingThreshold
        ? new Prisma.Decimal(data.freeShippingThreshold)
        : null;
    }

    return this.prisma.shippingZone.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteZone(id: number) {
    const zone = await this.prisma.shippingZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('منطقة الشحن غير موجودة');
    return this.prisma.shippingZone.delete({ where: { id } });
  }
}
