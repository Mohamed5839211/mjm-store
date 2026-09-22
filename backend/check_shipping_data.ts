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

async function check() {
    console.log('--- Shipping Zones ---');
    const zones = await (prisma as any).shippingZone.findMany();
    console.log(JSON.stringify(zones, null, 2));

    console.log('\n--- Shipping Providers ---');
    const providers = await prisma.shippingProvider.findMany();
    console.log(JSON.stringify(providers, null, 2));

    await prisma.$disconnect();
}

check().catch(console.error);
