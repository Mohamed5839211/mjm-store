import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  QueryProductsDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { Prisma } from '@prisma/client';
import { toPageQuery, toPaginated } from '../common/pagination';
import { normalizeArabic, productSearchIndex } from '../common/normalize';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      category,
      categoryId,
      search,
      minPrice,
      maxPrice,
      hasOffer,
      sortBy,
    } = query;
    const page = toPageQuery(query.page, query.limit);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (category) {
      const asId = parseInt(category, 10);
      where.category =
        Number.isFinite(asId) && String(asId) === category
          ? { id: asId }
          : { slug: category };
    }

    if (search) {
      // Hamza-insensitive search via the normalized index column.
      where.searchIndex = { contains: normalizeArabic(search) };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (hasOffer) {
      where.offerProducts = {
        some: { offer: { isActive: true, endDate: { gte: new Date() } } },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'best_selling') orderBy = { totalSold: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: page.skip,
        take: page.limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
          offerProducts: {
            include: { offer: true },
            where: { offer: { isActive: true, endDate: { gte: new Date() } } },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = items.map((p) => ({
      ...p,
      offers: p.offerProducts.map((op) => op.offer),
      offerProducts: undefined,
    }));
    return toPaginated(mapped, total, page);
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        offerProducts: {
          include: { offer: true },
          where: { offer: { isActive: true, endDate: { gte: new Date() } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    // Get related products (same category)
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 6,
      include: { images: { take: 1 } },
    });

    return {
      ...product,
      offers: product.offerProducts.map((op) => op.offer),
      offerProducts: undefined,
      relatedProducts,
    };
  }

  async create(dto: CreateProductDto) {
    const { images, ...productData } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        categoryId: productData.categoryId,
        searchIndex: productSearchIndex(productData),
        images: images
          ? { create: images.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: { images: true },
    });

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('المنتج غير موجود');
    }

    const { images, ...productData } = dto;

    // Image replacement + product update must be atomic.
    const product = await this.prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          categoryId: productData.categoryId,
          searchIndex: productSearchIndex({
            name: productData.name ?? existing.name,
            sku: existing.sku,
            description: productData.description ?? existing.description,
          }),
          images: images
            ? { create: images.map((url, i) => ({ url, sortOrder: i })) }
            : undefined,
        },
        include: { images: true },
      });
    });

    return product;
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('المنتج غير موجود');
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'تم تعطيل المنتج بنجاح' };
  }
}
