require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    // Local-seed-only default credentials (overridable via env, see seed-admin.ts).
    const email = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@mjm.com';
    const password = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'adminPassword123';
    const name = 'مدير النظام';

    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const admin = await prisma.adminUser.upsert({
            where: { email },
            update: { passwordHash },
            create: {
                email,
                name,
                passwordHash,
                role: 'super_admin',
            },
        });

        console.log('Admin user created/updated successfully:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
