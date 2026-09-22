import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, CreateMessageDto } from './dto/support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(customerId: number, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        customerId,
        subject: dto.subject,
        priority: dto.priority || 'medium',
        messages: {
          create: {
            senderType: 'customer',
            senderId: customerId,
            content: dto.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });
  }

  async getCustomerTickets(customerId: number) {
    return this.prisma.supportTicket.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getTicketDetails(ticketId: number, customerId: number) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket || ticket.customerId !== customerId) {
      throw new NotFoundException('التذكرة غير موجودة');
    }

    return ticket;
  }

  async addMessage(
    ticketId: number,
    customerId: number,
    dto: CreateMessageDto,
  ) {
    // Verify ticket ownership
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.customerId !== customerId) {
      throw new NotFoundException('التذكرة غير موجودة');
    }

    return this.prisma.chatMessage.create({
      data: {
        ticketId,
        senderType: 'customer',
        senderId: customerId,
        content: dto.content,
      },
    });
  }
}
