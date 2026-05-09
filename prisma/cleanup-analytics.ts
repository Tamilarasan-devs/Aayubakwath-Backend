import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up analytics test data...');

  const userCount = await prisma.user.count({
    where: { email: { contains: '@test.com' } },
  });

  console.log(`Found ${userCount} test users to clean up...`);

  const testUsers = await prisma.user.findMany({
    where: { email: { contains: '@test.com' } },
    select: { id: true },
  });

  const testUserIds = testUsers.map((u) => u.id);

  if (testUserIds.length > 0) {
    console.log('Deleting test orders...');
    const deletedOrders = await prisma.order.deleteMany({
      where: { userId: { in: testUserIds } },
    });
    console.log(`  Deleted ${deletedOrders.count} orders`);

    console.log('Deleting test cart items...');
    const deletedCarts = await prisma.cartItem.deleteMany({
      where: { userId: { in: testUserIds } },
    });
    console.log(`  Deleted ${deletedCarts.count} cart items`);

    console.log('Deleting test wishlist items...');
    const deletedWishlist = await prisma.wishlist.deleteMany({
      where: { userId: { in: testUserIds } },
    });
    console.log(`  Deleted ${deletedWishlist.count} wishlist items`);

    console.log('Deleting test users...');
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: testUserIds } },
    });
    console.log(`  Deleted ${deletedUsers.count} users`);
  }

  console.log('Deleting test products...');
  const deletedProducts = await prisma.product.deleteMany({
    where: { productName: { contains: '[TEST]' } },
  });
  console.log(`  Deleted ${deletedProducts.count} products`);

  console.log('Cleanup completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
