import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPageQuery, toPaginated } from '../common/pagination';
import { MockIntegrationsService } from '../common/integrations/mock-integrations.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CheckoutDto } from './dto/checkout.dto';

interface PricedItem {
  productId?: number;
  bundleId?: number;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private mockIntegrations: MockIntegrationsService,
    private invoicesService: InvoicesService,
  ) {}

  async checkout(customerId: number, dto: CheckoutDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, customerId },
    });
    if (!address) {
      throw new NotFoundException('العنوان غير موجود');
    }

    // Items come from the client snapshot (prices re-validated below) or
    // fall back to the server-side cart for legacy callers.
    const rawItems = dto.items?.length
      ? dto.items.map((item) => ({
          productId: item.productId,
          bundleId: item.bundleId,
          quantity: item.quantity,
        }))
      : await this.loadServerCartItems(customerId);

    if (rawItems.length === 0) {
      throw new BadRequestException('السلة فارغة');
    }

    const { orderItemsData, subtotal, totalDiscount } =
      await this.priceItems(rawItems);
    const shippingFee = await this.calculateShippingFee(address.city, subtotal);
    const totalAmount = subtotal + shippingFee;

    // Atomic core: order + cart clear + stock updates succeed or fail together.
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId,
          status: 'new_order',
          totalAmount,
          shippingFee,
          discountAmount: totalDiscount,
          paymentStatus: 'pending',
          paymentMethod: dto.paymentMethod,
          shippingAddressId: dto.shippingAddressId,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      if (!dto.items?.length) {
        const cart = await tx.cart.findUnique({ where: { customerId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }

      for (const item of orderItemsData) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
              totalSold: { increment: item.quantity },
            },
          });
        }
      }

      return created;
    });

    // Best-effort side effects: must never fail the checkout response.
    const paymentUrl = await this.createPaymentSessionSafe(
      Number(totalAmount),
      order.id,
    );
    await this.createShipmentSafe(order.id, address);
    await this.generateInvoiceSafe(order.id);
    await this.notifyCustomerSafe(customerId, order.id);

    return {
      id: order.id,
      orderId: order.id,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      paymentUrl,
      message: 'تم إنشاء الطلب بنجاح',
    };
  }

  /** Server-cart fallback for callers that don't send items. */
  private async loadServerCartItems(
    customerId: number,
  ): Promise<{ productId?: number; bundleId?: number; quantity: number }[]> {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });
    return (cart?.items ?? []).map((item) => ({
      productId: item.productId ?? undefined,
      bundleId: item.bundleId ?? undefined,
      quantity: item.quantity,
    }));
  }

  /**
   * Prices every line from the DATABASE (client prices are never trusted)
   * and validates existence/activity of products and bundles.
   */
  private async priceItems(
    rawItems: { productId?: number; bundleId?: number; quantity: number }[],
  ): Promise<{
    orderItemsData: PricedItem[];
    subtotal: number;
    totalDiscount: number;
  }> {
    let subtotal = 0;
    let totalDiscount = 0;
    const orderItemsData: PricedItem[] = [];

    for (const item of rawItems) {
      if (!item.productId && !item.bundleId) {
        throw new BadRequestException('كل عنصر يحتاج productId أو bundleId');
      }
      if (item.productId && item.bundleId) {
        throw new BadRequestException(
          'العنصر لا يمكن أن يكون منتجاً وبكجاً معاً',
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException('الكمية غير صالحة');
      }

      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            offerProducts: {
              include: { offer: true },
              where: {
                offer: { isActive: true, endDate: { gte: new Date() } },
              },
            },
          },
        });
        if (!product || !product.isActive) {
          throw new NotFoundException(`المنتج رقم ${item.productId} غير متوفر`);
        }
        const price = Number(product.discountPrice ?? product.price);
        const activeOffer = product.offerProducts?.[0]?.offer;
        let finalPrice = price * item.quantity;

        if (
          activeOffer?.type === 'second_item_for_1_sar' &&
          item.quantity >= 2
        ) {
          const pairs = Math.floor(item.quantity / 2);
          const remainder = item.quantity % 2;
          finalPrice = pairs * (price + 1) + remainder * price;
          totalDiscount += price * item.quantity - finalPrice;
        } else if (activeOffer?.type === 'percentage') {
          const discountPct = Number(activeOffer.discountValue) / 100;
          const discount = finalPrice * discountPct;
          finalPrice -= discount;
          totalDiscount += discount;
        }

        subtotal += finalPrice;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: price,
          finalPrice,
        });
      } else if (item.bundleId) {
        const bundle = await this.prisma.bundle.findUnique({
          where: { id: item.bundleId },
        });
        if (!bundle || !bundle.isActive) {
          throw new NotFoundException(`البكج رقم ${item.bundleId} غير متوفر`);
        }
        const bundleTotal = Number(bundle.bundlePrice) * item.quantity;
        subtotal += bundleTotal;
        totalDiscount +=
          (Number(bundle.originalPrice) - Number(bundle.bundlePrice)) *
          item.quantity;
        orderItemsData.push({
          bundleId: bundle.id,
          quantity: item.quantity,
          unitPrice: Number(bundle.bundlePrice),
          finalPrice: bundleTotal,
        });
      }
    }

    return { orderItemsData, subtotal, totalDiscount };
  }

  private async calculateShippingFee(
    city: string,
    subtotal: number,
  ): Promise<number> {
    const zones = await this.prisma.shippingZone.findMany({
      where: { isActive: true },
    });

    const matchingZone = zones.find((zone) => {
      const cities = Array.isArray(zone.cities)
        ? (zone.cities as string[])
        : [];
      return cities.includes(city);
    });

    if (matchingZone) {
      const threshold = matchingZone.freeShippingThreshold
        ? Number(matchingZone.freeShippingThreshold)
        : Infinity;
      return subtotal >= threshold ? 0 : Number(matchingZone.baseRate);
    }

    const cmsSettings = await this.prisma.cmsContent.findUnique({
      where: { key: 'global_settings' },
    });
    const globalSettings = (cmsSettings?.value ?? {}) as {
      freeShippingEnabled?: boolean;
      freeShippingThreshold?: number;
    };
    const isFree =
      (globalSettings.freeShippingEnabled ?? true) &&
      subtotal >= (globalSettings.freeShippingThreshold ?? 299);
    return isFree ? 0 : 25;
  }

  private async createPaymentSessionSafe(
    totalAmount: number,
    orderId: number,
  ): Promise<string | null> {
    try {
      return await this.mockIntegrations.createPaymentSession(
        totalAmount,
        orderId.toString(),
      );
    } catch (error) {
      this.logger.warn(
        `Payment session failed for order ${orderId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async createShipmentSafe(
    orderId: number,
    address: { city: string },
  ): Promise<void> {
    try {
      const provider = await this.prisma.shippingProvider.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!provider) {
        this.logger.warn(
          `No shipping provider configured; skipping shipment for order ${orderId}`,
        );
        return;
      }
      const shippingInfo = await this.mockIntegrations.generateShippingLabel(
        orderId.toString(),
        address,
      );
      await this.prisma.shipment.create({
        data: {
          orderId,
          providerId: provider.id,
          trackingNumber: shippingInfo.trackingNumber,
          labelUrl: shippingInfo.labelUrl,
          status: 'label_created',
        },
      });
    } catch (error) {
      this.logger.warn(
        `Shipment creation failed for order ${orderId}: ${(error as Error).message}`,
      );
    }
  }

  private async generateInvoiceSafe(orderId: number): Promise<void> {
    try {
      await this.invoicesService.generateForOrder(orderId);
    } catch (error) {
      this.logger.warn(
        `Invoice generation failed for order ${orderId}: ${(error as Error).message}`,
      );
    }
  }

  private async notifyCustomerSafe(
    customerId: number,
    orderId: number,
  ): Promise<void> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (customer) {
        await this.mockIntegrations.sendWhatsAppMessage(
          customer.phone,
          `مرحباً ${customer.name}، تم استلام طلبك رقم #${orderId} بنجاح. سنقوم بإبلاغك فور شحنه.`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Order notification failed for order ${orderId}: ${(error as Error).message}`,
      );
    }
  }

  async findUserOrders(customerId: number) {
    return this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            bundle: true,
          },
        },
      },
    });
  }

  async findOneOrder(customerId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            bundle: true,
          },
        },
        address: true,
        shipment: true,
      },
    });

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  // Admin methods
  async findAllOrders(filters: {
    status?: string;
    paymentMethod?: string;
    page?: unknown;
    limit?: unknown;
  }) {
    const query = toPageQuery(filters.page, filters.limit);
    const where: Prisma.OrderWhereInput = {};
    if (filters.status) where.status = filters.status as OrderStatus;
    if (filters.paymentMethod)
      where.paymentMethod = filters.paymentMethod as PaymentMethod;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          customer: { select: { name: true, phone: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
              bundle: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('حالة الطلب غير صالحة');
    }
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
