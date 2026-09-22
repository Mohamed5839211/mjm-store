
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding sample products...')

  // Get categories first
  const categories = await prisma.category.findMany()
  const catMap: Record<string, number> = {}
  categories.forEach(c => catMap[c.slug] = c.id)

  const productsData = [
    {
      name: 'أكياس نفايات بريميوم سوداء',
      description: 'أكياس عالية السماكة ومقاومة للتمزق',
      categorySlug: 'bags',
      price: 25.00,
      discountPrice: 19.00,
      sku: 'BAG-001',
      totalSold: 150,
      images: {
        create: [
          { url: '/categories/bags.png', sortOrder: 0 }
        ]
      }
    },
    {
      name: 'مياه معدنية طبيعية 330 مل (كرتون)',
      description: 'مياه نقية من ابار جوفية طبيعية',
      categorySlug: 'water',
      price: 18.50,
      sku: 'WAT-001',
      totalSold: 300,
      images: {
        create: [
          { url: '/categories/water.png', sortOrder: 0 }
        ]
      }
    },
    {
      name: 'كرتون شحن مقاس كبير 50x50x50',
      description: 'كراتين قوية جداً للشحن والنقل',
      categorySlug: 'carton',
      price: 12.00,
      discountPrice: 9.99,
      sku: 'CRT-001',
      totalSold: 85,
      images: {
        create: [
          { url: '/categories/carton.png', sortOrder: 0 }
        ]
      }
    },
    {
      name: 'طقم أكواب ورقية فاخرة 50 قطعة',
      description: 'أكواب ورقية مزدوجة للقهوة والشاي',
      categorySlug: 'hospitality',
      price: 45.00,
      sku: 'HSP-001',
      totalSold: 120,
      images: {
        create: [
          { url: '/categories/hospitality.png', sortOrder: 0 }
        ]
      }
    },
    {
        name: 'منتج جديد جداً 1',
        description: 'وصف المنتج الجديد 1',
        categorySlug: 'bags',
        price: 100.00,
        sku: 'NEW-001',
        totalSold: 5,
        images: {
          create: [
            { url: '/categories/bags.png', sortOrder: 0 }
          ]
        }
      },
      {
        name: 'منتج جديد جداً 2',
        description: 'وصف المنتج الجديد 2',
        categorySlug: 'water',
        price: 50.00,
        sku: 'NEW-002',
        totalSold: 2,
        images: {
          create: [
            { url: '/categories/water.png', sortOrder: 0 }
          ]
        }
      }
  ]

  for (const item of productsData) {
    const { categorySlug, ...p } = item
    const categoryId = catMap[categorySlug]
    
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        ...p,
        categoryId: categoryId || undefined
      },
      create: {
        ...p,
        categoryId: categoryId || undefined
      },
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
