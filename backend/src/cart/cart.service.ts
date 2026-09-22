import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Offer, Prisma } from '@prisma/client';

export interface CartLine {
  productId?: number;
  bundleId?: number;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  appliedOffers: string[];
  discount: number;
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(customerId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                offerProducts: {
                  include: { offer: true },
                  where: {
                    offer: { isActive: true, endDate: { gte: new Date() } },
                  },
                },
              },
            },
            bundle: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  offerProducts: { include: { offer: true } },
                },
              },
              bundle: true,
            },
          },
        },
      });
    }

    const itemsWithCalc: (CartLine | null)[] = cart.items.map((item) => {
      const product = item.product;
      const bundle = item.bundle;

      if (product) {
        const activeOffer = product.offerProducts?.[0]?.offer;
        const calcResult = this.calculateItemPrice(
          product.price,
          product.discountPrice,
          item.quantity,
          activeOffer,
        );

        return {
          productId: product.id,
          name: product.name,
          image: product.images?.[0]?.url || null,
          unitPrice: Number(product.discountPrice || product.price),
          quantity: item.quantity,
          lineTotal: calcResult.lineTotal,
          appliedOffers: calcResult.offerDescription
            ? [calcResult.offerDescription]
            : [],
          discount: calcResult.discount,
        };
      }

      if (bundle) {
        return {
          bundleId: bundle.id,
          name: bundle.name,
          image: bundle.imageUrl,
          unitPrice: Number(bundle.bundlePrice),
          quantity: item.quantity,
          lineTotal: Number(bundle.bundlePrice) * item.quantity,
          appliedOffers: [],
          discount:
            (Number(bundle.originalPrice) - Number(bundle.bundlePrice)) *
            item.quantity,
        };
      }

      return null;
    });

    const lines = itemsWithCalc.filter(
      (line): line is CartLine => line !== null,
    );
    const subtotal = lines.reduce((sum, i) => sum + i.lineTotal, 0);
    const discounts = lines.reduce((sum, i) => sum + (i.discount || 0), 0);
    // Same source of truth as checkout: CMS global settings with fallback.
    const cmsSettings = await this.prisma.cmsContent.findUnique({
      where: { key: 'global_settings' },
    });
    const globalSettings = (cmsSettings?.value ?? {}) as {
      freeShippingEnabled?: boolean;
      freeShippingThreshold?: number;
    };
    const threshold = globalSettings.freeShippingThreshold ?? 299;
    const freeShippingApplied =
      (globalSettings.freeShippingEnabled ?? true) && subtotal >= threshold;
    const shippingFee = freeShippingApplied ? 0 : 25;
    const total = subtotal + shippingFee;

    return {
      items: lines,
      summary: {
        subtotal,
        discounts,
        shippingFee,
        total,
        freeShippingApplied,
      },
    };
  }

  async addItem(
    customerId: number,
    productId: number | undefined,
    bundleId: number | undefined,
    quantity: number,
  ) {
    if (!productId && !bundleId) {
      throw new BadRequestException('حدد productId أو bundleId');
    }
    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, isActive: true },
      });
      if (!product || !product.isActive)
        throw new NotFoundException('المنتج غير متوفر');
    }
    if (bundleId) {
      const bundle = await this.prisma.bundle.findUnique({
        where: { id: bundleId },
        select: { id: true, isActive: true },
      });
      if (!bundle || !bundle.isActive)
        throw new NotFoundException('البكج غير متوفر');
    }

    let cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { customerId } });
    }

    // Check for existing item
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId || undefined,
        bundleId: bundleId || undefined,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, bundleId, quantity },
      });
    }

    return this.getCart(customerId);
  }

  async updateItemQuantity(
    customerId: number,
    productId: number | undefined,
    bundleId: number | undefined,
    quantity: number,
  ) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('السلة غير موجودة');

    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId || undefined,
        bundleId: bundleId || undefined,
      },
    });
    if (!item) throw new NotFoundException('العنصر غير موجود في السلة');

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    return this.getCart(customerId);
  }

  async removeItem(
    customerId: number,
    productId: number | undefined,
    bundleId: number | undefined,
  ) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('السلة غير موجودة');

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productId || undefined,
        bundleId: bundleId || undefined,
      },
    });

    return this.getCart(customerId);
  }

  private calculateItemPrice(
    price: Prisma.Decimal | null,
    discountPrice: Prisma.Decimal | null,
    quantity: number,
    activeOffer: Pick<Offer, 'type' | 'discountValue'> | null | undefined,
  ) {
    const unitPrice = Number(discountPrice || price || 0);
    let lineTotal = unitPrice * quantity;
    let discount = 0;
    let offerDescription: string | null = null;

    if (
      activeOffer &&
      activeOffer.type === 'second_item_for_1_sar' &&
      quantity >= 2
    ) {
      const pairs = Math.floor(quantity / 2);
      const remainder = quantity % 2;
      lineTotal = pairs * (unitPrice + 1) + remainder * unitPrice;
      discount = unitPrice * quantity - lineTotal;
      offerDescription = 'القطعة الثانية بريال';
    } else if (activeOffer && activeOffer.type === 'percentage') {
      const discountPct = Number(activeOffer.discountValue) / 100;
      discount = lineTotal * discountPct;
      lineTotal = lineTotal - discount;
      offerDescription = `خصم ${Number(activeOffer.discountValue)}%`;
    }

    return { lineTotal, discount, offerDescription };
  }
}
