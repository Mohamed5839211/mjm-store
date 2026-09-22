const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to dynamic categories...');

  // 1. Create Categories
  const categories = [
    {
      slug: 'bags',
      name: 'أكياس نفاية',
      nameEn: 'Trash Bags',
      description: 'أكياس نفاية عالية الجودة بمقاسات مختلفة وقوة تحمل فائقة.',
      icon: 'ShoppingBag',
      image: '/images/categories/bags.png',
      color: 'blue',
      accent: 'primary',
      order: 1,
    },
    {
      slug: 'water',
      name: 'مياه شرب',
      nameEn: 'Drinking Water',
      description: 'مياه شرب نقية ومنعشة معبأة بأعلى معايير الجودة لتروي عطشك.',
      icon: 'Droplets',
      image: '/images/categories/water.png',
      color: 'sky',
      accent: 'info',
      order: 2,
    },
    {
      slug: 'carton',
      name: 'كراتين',
      nameEn: 'Cartons',
      description: 'كراتين متينة وعملية بمختلف الأحجام لتناسب جميع احتياجات التعبئة والتغليف.',
      icon: 'Box',
      image: '/images/categories/carton.png',
      color: 'amber',
      accent: 'warning',
      order: 3,
    },
    {
      slug: 'hospitality',
      name: 'مستلزمات ضيافة',
      nameEn: 'Hospitality',
      description: 'كافة مستلزمات الضيافة الراقية لتجربة استقبال استثنائية.',
      icon: 'Coffee',
      image: '/images/categories/hospitality.png',
      color: 'rose',
      accent: 'secondary',
      order: 4,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`Upserted category: ${cat.name}`);
  }

  // 2. Link existing products (This is harder because 'category' column might be gone depending on migration)
  // But wait, the previous migration DROPPED the column.
  // I should have mapped them before. 
  // Good thing I have a seed_api.js I can use as reference to re-seed correctly or just map manually now.
  
  const createdCategories = await prisma.category.findMany();
  const catMap = {};
  createdCategories.forEach(c => catMap[c.slug] = c.id);

  console.log('Mapping existing products...');
  
  const products = await prisma.product.findMany();
  for (const product of products) {
    let slug = '';
    if (product.name.includes('أكياس') || product.name.includes('Bags')) slug = 'bags';
    else if (product.name.includes('مياه') || product.name.includes('Water')) slug = 'water';
    else if (product.name.includes('كرتون') || product.name.includes('Carton')) slug = 'carton';
    else if (product.name.includes('أكواب') || product.name.includes('ضيافة')) slug = 'hospitality';

    if (slug && catMap[slug]) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: catMap[slug] }
      });
      console.log(`Linked product "${product.name}" to category "${slug}"`);
    }
  }

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
