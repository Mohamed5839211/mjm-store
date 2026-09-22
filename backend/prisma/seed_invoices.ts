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
    console.log('Seeding initial invoices for existing orders...');

    const orders = await prisma.order.findMany({
        where: { invoice: null },
        take: 5
    });

    console.log(`Found ${orders.length} orders without invoices.`);

    for (const order of orders) {
        const vatAmount = Number(order.totalAmount) * 0.15;
        const invoiceNumber = `INV-${Date.now()}-${order.id}`;

        await (prisma as any).invoice.create({
            data: {
                orderId: order.id,
                invoiceNumber,
                totalAmount: order.totalAmount,
                vatAmount: vatAmount.toFixed(2),
                status: 'issued',
            }
        });
        console.log(`Generated invoice ${invoiceNumber} for order ${order.id}`);
    }

    console.log('Invoices seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
