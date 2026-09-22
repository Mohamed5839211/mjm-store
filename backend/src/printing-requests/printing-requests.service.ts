import { Injectable, NotFoundException } from '@nestjs/common';
import { PrintingRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPageQuery, toPaginated } from '../common/pagination';
import {
  CreatePrintingRequestDto,
  UpdatePrintingRequestDto,
} from './dto/printing-request.dto';

@Injectable()
export class PrintingRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrintingRequestDto & { customerId: number }) {
    return this.prisma.printingRequest.create({ data: dto });
  }

  async findByCustomer(customerId: number) {
    return this.prisma.printingRequest.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: unknown;
    limit?: unknown;
  }) {
    const { status, dateFrom, dateTo } = filters;
    const query = toPageQuery(filters.page, filters.limit);
    const where: Prisma.PrintingRequestWhereInput = {};
    if (status) where.status = status as PrintingRequestStatus;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.printingRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          customer: { select: { name: true, phone: true, email: true } },
        },
      }),
      this.prisma.printingRequest.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async findOne(id: number) {
    const request = await this.prisma.printingRequest.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true, email: true } },
      },
    });
    if (!request) throw new NotFoundException('طلب الطباعة غير موجود');
    return request;
  }

  async update(id: number, dto: UpdatePrintingRequestDto) {
    const request = await this.prisma.printingRequest.findUnique({
      where: { id },
    });
    if (!request)
      throw new NotFoundException('���?�? �?�?���?�?�?�? �?�?�? �?�?�?�?�?');
    const { status, ...rest } = dto;
    return this.prisma.printingRequest.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: status as PrintingRequestStatus } : {}),
      },
    });
  }

  async remove(id: number) {
    const request = await this.prisma.printingRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('طلب الطباعة غير موجود');
    return this.prisma.printingRequest.delete({ where: { id } });
  }
}
