import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findAll(customerId: number) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(customerId: number, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({ data: { customerId, ...dto } });
  }

  async update(customerId: number, id: number, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id, customerId },
    });
    if (!address) throw new NotFoundException('العنوان غير موجود');
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(customerId: number, id: number) {
    const address = await this.prisma.address.findFirst({
      where: { id, customerId },
    });
    if (!address) throw new NotFoundException('العنوان غير موجود');
    await this.prisma.address.delete({ where: { id } });
    return { message: 'تم حذف العنوان' };
  }
}
