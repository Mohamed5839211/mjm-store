import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined');
}

const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    connectionLimit: 1,
});

const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('Seeding shipping zones...');

    const zones = [
        {
            name: 'المنطقة الوسطى',
            cities: ['الرياض', 'الخرج', 'المجمعة', 'الدوادمي', 'وادي الدواسر'],
            baseRate: 25.00,
            freeShippingThreshold: 299.00,
            isActive: true,
        },
        {
            name: 'المنطقة الغربية',
            cities: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'ينبع'],
            baseRate: 35.00,
            freeShippingThreshold: 500.00,
            isActive: true,
        },
        {
            name: 'المنطقة الشرقية',
            cities: ['الدمام', 'الخبر', 'الظهران', 'الجبيل', 'الأحساء'],
            baseRate: 30.00,
            freeShippingThreshold: 400.00,
            isActive: true,
        },
    ];

    for (const zone of zones) {
        await (prisma as any).shippingZone.create({
            data: zone,
        });
    }

    // Seed Shipping Providers if not exist
    const providers = [
        { name: 'Aramex', type: 'aramex', isActive: true },
        { name: 'Saee', type: 'saee', isActive: true },
        { name: 'Box Company', type: 'box_company', isActive: true },
    ];

    for (const provider of providers) {
        await prisma.shippingProvider.upsert({
            where: { id: providers.indexOf(provider) + 1 },
            update: {},
            create: provider as any,
        });
    }

    console.log('Shipping zones and providers seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
