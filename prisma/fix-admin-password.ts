import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting admin password...');

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const updated = await prisma.user.updateMany({
    where: { email: 'admin@example.com' },
    data: { 
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true
    },
  });

  if (updated.count === 0) {
    console.log('Admin user not found, creating...');
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        isActive: true
      },
    });
    console.log('Admin user created.');
  } else {
    console.log(`Admin password updated (${updated.count} record).`);
  }

  console.log('Done. Login with: admin@example.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
