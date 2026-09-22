import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPageQuery, toPaginated } from '../common/pagination';
import { CreateContactMessageDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(createContactMessageDto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: createContactMessageDto,
    });
  }

  async findAll(
    page?: unknown,
    limit?: unknown,
    search?: string,
    status?: string,
  ) {
    const query = toPageQuery(page, limit, 10);

    const where: Prisma.ContactMessageWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async findOne(id: number) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`الرسالة غير موجودة`);
    }

    return message;
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id); // Ensure it exists
    const allowed = ['new', 'read', 'replied'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('حالة الرسالة غير صالحة');
    }
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}
