import { PrismaClient, AdminRole } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('--- Starting Comprehensive Database Seeding ---');

    // 1. Seed Admin User (local-seed-only default; overridable via
    // SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env for shared environments).
    const adminEmail = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@mjm.com';
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const seedPassword = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'adminPassword123';
        const passwordHash = await bcrypt.hash(seedPassword, 12);
        await prisma.adminUser.create({
            data: {
                email: adminEmail,
                name: 'مدير النظام',
                passwordHash,
                role: AdminRole.super_admin,
            },
        });
        console.log('✓ Admin user created (see SEED_ADMIN_EMAIL env or local default)');
    } else {
        console.log('✓ Admin user already exists');
    }

    // 2. Seed Categories
    const categoriesData = [
        {
            slug: 'bags',
            name: 'أكياس نفاية',
            nameEn: 'Trash Bags',
            description: 'أكياس نفاية عالية الجودة بمقاسات مختلفة وقوة تحمل فائقة.',
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
            description: 'مياه شرب نقية ومنعشة معبأة بأعلى معايير الجودة.',
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
            description: 'كراتين متينة وعملية بمختلف الأحجام للتعبئة والتغليف.',
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
            description: 'أدوات ومستلزمات الضيافة الراقية للمقاهي والمطاعم.',
            icon: 'Utensils',
            image: '/categories/hospitality.png',
            color: 'rose',
            accent: 'error',
            order: 4,
        },
        {
            slug: 'bundles',
            name: 'البكجات والعروض',
            nameEn: 'Bundles & Offers',
            description: 'عروض حصرية وباقات توفيرية متكاملة لجميع الاحتياجات.',
            icon: 'Sparkles',
            image: '/categories/bundles.png',
            color: 'primary',
            accent: 'primary',
            order: 5,
        },
    ];

    const catMap: Record<string, number> = {};
    for (const cat of categoriesData) {
        const record = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: cat,
            create: cat,
        });
        catMap[cat.slug] = record.id;
    }
    console.log('✓ Categories seeded');

    // 3. Seed CMS Settings
    const defaultSettings = {
        storeName: 'MJM Store - متجر إم جي إم',
        maintenanceMode: false,
        orderEmails: true,
        vatRate: 15,
        currency: 'ر.س',
        lowStockThreshold: 10,
        freeShippingEnabled: true,
        freeShippingThreshold: 299,
        announcements: [
            '🚚 شحن مجاني لجميع الطلبات فوق 299 ريال داخل المملكة',
            '✨ خصومات حصرية تصل إلى 30% على منتجات الطباعة المخصصة',
            '⚡ توصيل سريع خلال 24 ساعة في مدينة الرياض',
        ],
        announcementSpeed: 20,
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.ico',
        socialLinks: {
            snapchat: 'https://snapchat.com',
            instagram: 'https://instagram.com',
            twitter: 'https://x.com',
            facebook: '',
            whatsapp: 'https://wa.me/966500000000',
            tiktok: '',
            linkedin: '',
        },
    };

    await prisma.cmsContent.upsert({
        where: { key: 'global_settings' },
        update: { value: defaultSettings },
        create: { key: 'global_settings', value: defaultSettings },
    });
    console.log('✓ CMS Settings & Announcements seeded');

    // 4. Seed Products
    const productsData = [
        {
            name: 'أكياس نفايات بريميوم سوداء 50 جالون',
            description: 'أكياس عالية السماكة والمتانة مقاومة للتمزق والتسريب، مناسبة للمنازل والمنشآت التجارية.',
            categorySlug: 'bags',
            price: 28.00,
            discountPrice: 22.00,
            sku: 'BAG-001',
            stock: 250,
            totalSold: 180,
            isFeatured: true,
            images: ['/categories/bags.png'],
        },
        {
            name: 'مياه معدنية طبيعية 330 مل (كرتون 40 قارورة)',
            description: 'مياه نقية من آبار جوفية طبيعية معبأة بأعلى معايير النقاء والجودة العالمية.',
            categorySlug: 'water',
            price: 18.50,
            discountPrice: 16.00,
            sku: 'WAT-001',
            stock: 500,
            totalSold: 340,
            isFeatured: true,
            images: ['/categories/water.png'],
        },
        {
            name: 'كرتون شحن مقاس كبير (50x50x50 سم) 5 طبقات',
            description: 'كراتين مضلعة متينة جداً 5 طبقات لحماية المنتجات أثناء الشحن والنقل الثقيل.',
            categorySlug: 'carton',
            price: 14.00,
            discountPrice: 11.50,
            sku: 'CRT-001',
            stock: 300,
            totalSold: 95,
            isFeatured: true,
            images: ['/categories/carton.png'],
        },
        {
            name: 'طقم أكواب ورقية فاخرة مزدوجة 50 قطعة',
            description: 'أكواب ورقية عازلة للحرارة مزدوجة الجدار مناسبة للمشروبات الساخنة والباردة.',
            categorySlug: 'hospitality',
            price: 35.00,
            discountPrice: 29.00,
            sku: 'HSP-001',
            stock: 120,
            totalSold: 60,
            isFeatured: true,
            images: ['/categories/hospitality.png'],
        },
        {
            name: 'بكج التوفير الشامل للمطاعم والكافيهات',
            description: 'يشمل كراتين شحن + أكياس نفايات + أدوات ضيافة بسعر مخفض استثنائي.',
            categorySlug: 'bundles',
            price: 199.00,
            discountPrice: 149.00,
            sku: 'BND-001',
            stock: 50,
            totalSold: 45,
            isFeatured: true,
            images: ['/categories/bundles.png'],
        },
    ];

    for (const p of productsData) {
        const categoryId = catMap[p.categorySlug];
        const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
        if (!existing) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    categoryId,
                    price: p.price,
                    discountPrice: p.discountPrice,
                    sku: p.sku,
                    totalSold: p.totalSold,
                    images: {
                        create: p.images.map((url, idx) => ({ url, sortOrder: idx })),
                    },
                },
            });
        }
    }
    console.log('✓ Sample products seeded');

    // 5. Seed Shipping Zones
    const zones = [
        {
            name: 'المنطقة الوسطى (الرياض وضواحيها)',
            cities: JSON.stringify(['الرياض', 'الخرج', 'المجمعة', 'الدوادمي', 'وادي الدواسر']),
            baseRate: 25.00,
            freeShippingThreshold: 299.00,
            isActive: true,
        },
        {
            name: 'المنطقة الغربية (مكة، جدة، المدينة)',
            cities: JSON.stringify(['جدة', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'ينبع']),
            baseRate: 35.00,
            freeShippingThreshold: 399.00,
            isActive: true,
        },
        {
            name: 'المنطقة الشرقية',
            cities: JSON.stringify(['الدمام', 'الخبر', 'الظهران', 'الجبيل', 'الأحساء']),
            baseRate: 30.00,
            freeShippingThreshold: 349.00,
            isActive: true,
        },
    ];

    for (const zone of zones) {
        const count = await prisma.shippingZone.count({ where: { name: zone.name } });
        if (count === 0) {
            await (prisma as any).shippingZone.create({ data: zone });
        }
    }

    const providers = [
        { name: 'Aramex', type: 'aramex', isActive: true },
        { name: 'Saee', type: 'saee', isActive: true },
        { name: 'Box Company (النقل الثقيل)', type: 'box_company', isActive: true },
    ];

    for (let i = 0; i < providers.length; i++) {
        await prisma.shippingProvider.upsert({
            where: { id: i + 1 },
            update: providers[i] as any,
            create: providers[i] as any,
        });
    }
    console.log('✓ Shipping zones & providers seeded');

    console.log('--- Database Seeding Completed Successfully! ---');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
