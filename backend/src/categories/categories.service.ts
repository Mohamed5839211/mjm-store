import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeCategories();
  }

  private async initializeCategories() {
    this.logger.log('Checking for initial categories...');
    const count = await this.prisma.category.count();
    if (count === 0) {
      this.logger.log('Seeding initial categories...');
      const categories = [
        {
          slug: 'bags',
          name: 'أكياس نفاية',
          nameEn: 'Trash Bags',
          description:
            'أكياس نفاية عالية الجودة بمقاسات مختلفة وقوة تحمل فائقة.',
          icon: 'ShoppingBag',
          image: '/categories/bags.png',
          color: 'blue',
          accent: 'primary',
          order: 1,
        },
        {
          slug: 'water',
          name: 'مياه شرب',
          nameEn: 'Drinking Water',
          description:
            'مياه شرب نقية ومنعشة معبأة بأعلى معايير الجودة لتروي عطشك.',
          icon: 'Droplets',
          image: '/categories/water.png',
          color: 'sky',
          accent: 'info',
          order: 2,
        },
        {
          slug: 'carton',
          name: 'كراتين',
          nameEn: 'Cartons',
          description:
            'كراتين متينة وعملية بمختلف الأحجام لتناسب جميع احتياجات التعبئة والتغليف.',
          icon: 'Box',
          image: '/categories/carton.png',
          color: 'amber',
          accent: 'warning',
          order: 3,
        },
        {
          slug: 'hospitality',
          name: 'مستلزمات ضيافة',
          nameEn: 'Hospitality',
          description:
            'كافة مستلزمات الضيافة الراقية لتجربة استقبال استثنائية.',
          icon: 'Coffee',
          image: '/categories/hospitality.png',
          color: 'rose',
          accent: 'secondary',
          order: 4,
        },
      ];

      for (const cat of categories) {
        await this.prisma.category.create({ data: cat });
      }
      this.logger.log('Initial categories seeded.');

      // Migrate existing products
      await this.migrateExistingProducts();
    }
  }

  private async migrateExistingProducts() {
    this.logger.log('Migrating existing products to categories...');
    const categories: Category[] = await this.prisma.category.findMany();
    const catMap: Record<string, number> = {};
    categories.forEach((c) => (catMap[c.slug] = c.id));

    const products = await this.prisma.product.findMany({
      where: { categoryId: null },
    });
    for (const product of products) {
      let slug = '';
      if (product.name.includes('أكياس') || product.name.includes('Bags'))
        slug = 'bags';
      else if (product.name.includes('مياه') || product.name.includes('Water'))
        slug = 'water';
      else if (
        product.name.includes('كرتون') ||
        product.name.includes('Carton')
      )
        slug = 'carton';
      else if (product.name.includes('أكواب') || product.name.includes('ضيافة'))
        slug = 'hospitality';

      if (slug && catMap[slug]) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { categoryId: catMap[slug] },
        });
        this.logger.log(
          `Linked product "${product.name}" to category "${slug}"`,
        );
      }
    }
    this.logger.log('Migration complete.');
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
    if (!category) throw new NotFoundException('القسم غير موجود');
    return category;
  }

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
