import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const url = new URL(dbUrl!);
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
    const ordersCount = await prisma.order.count();
    console.log(`Total orders: ${ordersCount}`);
    
    const orders = await prisma.order.findMany({ take: 5 });
    console.log('Recent 5 orders:', JSON.stringify(orders, null, 2));

    await prisma.$disconnect();
}

check().catch(console.error);
