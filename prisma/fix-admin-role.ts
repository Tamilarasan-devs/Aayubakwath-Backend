import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.updateMany({
    where: { email: 'admin@example.com' },
    data: { role: 'ADMIN' },
  });
  console.log(`Admin role updated (${updated.count} record).`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
