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

async function mock() {
    console.log('Seeding mock data for invoices verification...');

    try {
        // 1. Create a customer
        const customer = await (prisma as any).customer.create({
            data: {
                name: 'أحمد محمد القحطاني',
                email: `ahmed_${Date.now()}@example.com`,
                phone: `050${Math.floor(Math.random() * 9000000) + 1000000}`,
                passwordHash: 'mock-hash',
            }
        });

        // 2. Create an address
        const address = await (prisma as any).address.create({
            data: {
                customerId: customer.id,
                city: 'الرياض',
                district: 'حي الياسمين',
                street: 'طريق الملك عبدالعزيز',
                buildingNo: '1234',
                isDefault: true,
            }
        });

        // 3. Create a product if none exists
        let product = await prisma.product.findFirst();
        if (!product) {
            // Need a category
            let category = await prisma.category.findFirst();
            if (!category) {
                category = await (prisma as any).category.create({
                    data: {
                        slug: 'test-category',
                        name: 'قسم تجريبي',
                    }
                });
            }

            product = await (prisma as any).product.create({
                data: {
                    name: 'منتج تجريبي 1',
                    description: 'وصف منتج تجريبي',
                    price: 150.00,
                    stockQuantity: 100,
                    categoryId: category!.id,
                    sku: `MOCK-${Date.now()}`
                }
            });
        }

        // 4. Create 3 orders
        for (let i = 1; i <= 3; i++) {
            const totalAmount = 150.00 + (i * 20);
            const order = await (prisma as any).order.create({
                data: {
                    customerId: customer.id,
                    totalAmount: totalAmount,
                    shippingFee: 25.00,
                    paymentMethod: 'mada',
                    shippingAddressId: address.id,
                    status: 'new_order',
                    paymentStatus: 'paid',
                }
            });

            // Add Order Items
            await (prisma as any).orderItem.create({
                data: {
                    orderId: order.id,
                    productId: product!.id,
                    quantity: 1,
                    unitPrice: product!.price,
                    finalPrice: product!.price,
                }
            });

            // 5. Generate invoice for each order
            const vatAmount = totalAmount * 0.15;
            const invoiceNumber = `INV-2026-000${order.id}`;

            await (prisma as any).invoice.create({
                data: {
                    orderId: order.id,
                    invoiceNumber,
                    totalAmount: totalAmount,
                    vatAmount: vatAmount.toFixed(2),
                    status: 'issued',
                }
            });
            console.log(`Created mock order ${order.id} and invoice ${invoiceNumber}`);
        }

        console.log('Mock data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

mock().catch(console.error);
