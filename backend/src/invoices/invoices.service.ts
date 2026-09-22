import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PdfService } from './pdf.service';
import { generateInvoiceHtml } from './invoice-template';
import { toPageQuery, toPaginated } from '../common/pagination';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async generatePdf(id: number): Promise<Buffer> {
    const invoice = await this.findOne(id);
    const html = generateInvoiceHtml(invoice);
    return this.pdfService.generatePdf(html);
  }

  async findAll(filters: { status?: string; page?: unknown; limit?: unknown }) {
    const query = toPageQuery(filters.page, filters.limit);
    const where: Prisma.InvoiceWhereInput = {};
    if (filters.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          order: {
            include: {
              customer: { select: { name: true, phone: true, email: true } },
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            address: true,
            items: {
              include: {
                product: true,
                bundle: true,
              },
            },
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return invoice;
  }

  async generateForOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: true },
    });

    if (!order) throw new NotFoundException('���?�?���?�? �?�?�? �?�?�?�?�?');
    if (order.invoice) return order.invoice;

    // VAT rate comes from store settings (fallback 15%).
    const cmsSettings = await this.prisma.cmsContent.findUnique({
      where: { key: 'global_settings' },
    });
    const globalSettings = (cmsSettings?.value ?? {}) as { vatRate?: number };
    const vatRate = globalSettings.vatRate ?? 15;

    const vatAmount = (Number(order.totalAmount) * vatRate) / (100 + vatRate);
    // Deterministic per order (unique orderId) — no timestamp collisions.
    const invoiceNumber = `INV-${order.id}`;

    try {
      return await this.prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          totalAmount: order.totalAmount,
          vatAmount: new Prisma.Decimal(vatAmount),
          status: 'issued',
        },
      });
    } catch (error) {
      // Lost a concurrent generation race — return the winner's invoice.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.invoice.findUnique({
          where: { orderId: order.id },
        });
        if (existing) return existing;
      }
      throw error;
    }
  }
}
