import { PrismaClient, AdminRole } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }

    console.log('Using database URL for seeding...');
    
    const adapter = new PrismaMariaDb(dbUrl);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        // Local-seed-only default credentials. Override via SEED_ADMIN_EMAIL /
        // SEED_ADMIN_PASSWORD (or ADMIN_EMAIL / ADMIN_PASSWORD) for any shared
        // environment; never use the default outside localhost.
        const email = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@mjm.com';
        const password = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'adminPassword123';
        const name = 'مدير النظام';

        const existing = await prisma.adminUser.findUnique({ where: { email } });
        if (existing) {
            console.log('Admin user already exists');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.adminUser.create({
            data: {
                email,
                name,
                passwordHash,
                role: AdminRole.super_admin,
            },
        });

        console.log('Admin user created successfully:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
});
