import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting analytics test data seed...');

  const hashedPassword = await bcrypt.hash('Test123!', 12);

  console.log('Creating test users...');
  await prisma.user.createMany({
    data: Array.from({ length: 50 }, (_, i) => ({
      name: `Test User ${i + 1}`,
      email: `analytics-test-${i + 1}@test.com`,
      phoneNumber: `+91990000${String(i).padStart(4, '0')}`,
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    })),
    skipDuplicates: true,
  });

  const testUsers = await prisma.user.findMany({
    where: { email: { contains: '@test.com' } },
    select: { id: true },
  });
  console.log(`  Created ${testUsers.length} users`);

  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('Creating test categories...');
    await prisma.category.createMany({
      data: [
        { name: 'Electronics', image: 'https://via.placeholder.com/150' },
        { name: 'Clothing', image: 'https://via.placeholder.com/150' },
        { name: 'Home & Kitchen', image: 'https://via.placeholder.com/150' },
        { name: 'Books', image: 'https://via.placeholder.com/150' },
        { name: 'Sports', image: 'https://via.placeholder.com/150' },
        { name: 'Beauty', image: 'https://via.placeholder.com/150' },
      ],
    });
  }

  const allCategories = await prisma.category.findMany();

  console.log('Creating test products...');
  const productNames = [
    'Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'Laptop Stand', 'USB-C Hub',
    'Cotton T-Shirt', 'Denim Jeans', 'Running Shoes', 'Winter Jacket', 'Silk Scarf',
    'Coffee Maker', 'Blender', 'Air Fryer', 'Toaster', 'Knife Set',
    'JavaScript Guide', 'Python Cookbook', 'Design Patterns', 'Clean Code', 'AI Handbook',
    'Yoga Mat', 'Dumbbells', 'Jump Rope', 'Water Bottle', 'Resistance Bands',
    'Face Cream', 'Shampoo', 'Sunscreen', 'Lip Balm', 'Hair Oil',
  ];

  await prisma.product.createMany({
    data: productNames.map((name, i) => {
      const cat = allCategories[i % allCategories.length];
      const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
      return {
        productName: `[TEST] ${name}`,
        productDescription: `Test product: ${name}`,
        productTags: ['test', 'analytics-seed'],
        price,
        finalPrice: Math.round(price * 0.8 * 100) / 100,
        categoryId: cat.id,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      };
    }),
    skipDuplicates: true,
  });

  const testProducts = await prisma.product.findMany({
    where: { productName: { contains: '[TEST]' } },
    select: { id: true, finalPrice: true },
  });
  console.log(`  Created ${testProducts.length} products`);

  console.log('Creating test orders...');
  const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
  const statusWeights = [0.2, 0.2, 0.5, 0.1];

  function weightedStatus(): string {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < statuses.length; i++) {
      cumulative += statusWeights[i];
      if (r <= cumulative) return statuses[i];
    }
    return statuses[0];
  }

  const orderData = Array.from({ length: 200 }, () => {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [...testProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);
    const totalAmount = selectedProducts.reduce(
      (sum, p) => sum + Number(p.finalPrice) * (Math.floor(Math.random() * 2) + 1),
      0,
    );
    return {
      userId: user.id,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: weightedStatus(),
      shippingAddress: {
        street: `${Math.floor(Math.random() * 100)} Test St`,
        city: 'Test City',
        state: 'Test State',
        postalCode: '000000',
        country: 'India',
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    };
  });

  for (let i = 0; i < orderData.length; i += 50) {
    await prisma.order.createMany({
      data: orderData.slice(i, i + 50),
    });
  }

  const createdOrders = await prisma.order.findMany({
    where: { userId: { in: testUsers.map((u) => u.id) } },
    select: { id: true, userId: true, status: true },
  });
  console.log(`  Created ${createdOrders.length} orders`);

  console.log('Creating test order items...');
  const orderItemsData: { orderId: string; productId: string; quantity: number; priceAtPurchase: number }[] = [];

  for (const order of createdOrders) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [...testProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);
    for (const product of selectedProducts) {
      orderItemsData.push({
        orderId: order.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 2) + 1,
        priceAtPurchase: Number(product.finalPrice),
      });
    }
  }

  for (let i = 0; i < orderItemsData.length; i += 100) {
    await prisma.orderItem.createMany({
      data: orderItemsData.slice(i, i + 100),
    });
  }
  console.log(`  Created ${orderItemsData.length} order items`);

  console.log('Creating test cart items...');
  const cartItemsData: { userId: string; productId: string; quantity: number }[] = [];
  const cartSet = new Set<string>();

  for (let i = 0; i < 80; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const product = testProducts[Math.floor(Math.random() * testProducts.length)];
    const key = `${user.id}-${product.id}`;
    if (!cartSet.has(key)) {
      cartSet.add(key);
      cartItemsData.push({
        userId: user.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 3) + 1,
      });
    }
  }

  if (cartItemsData.length > 0) {
    await prisma.cartItem.createMany({
      data: cartItemsData,
      skipDuplicates: true,
    });
  }
  console.log(`  Created ${cartItemsData.length} cart items`);

  console.log('Creating test wishlist items...');
  const wishlistData: { userId: string; productId: string }[] = [];
  const wishlistSet = new Set<string>();

  for (let i = 0; i < 60; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const product = testProducts[Math.floor(Math.random() * testProducts.length)];
    const key = `${user.id}-${product.id}`;
    if (!wishlistSet.has(key)) {
      wishlistSet.add(key);
      wishlistData.push({
        userId: user.id,
        productId: product.id,
      });
    }
  }

  if (wishlistData.length > 0) {
    await prisma.wishlist.createMany({
      data: wishlistData,
      skipDuplicates: true,
    });
  }
  console.log(`  Created ${wishlistData.length} wishlist items`);

  console.log('Analytics test data seed completed successfully');
  console.log(`  Users: ${testUsers.length}`);
  console.log(`  Products: ${testProducts.length}`);
  console.log(`  Orders: ${createdOrders.length}`);
  console.log(`  Order Items: ${orderItemsData.length}`);
  console.log(`  Cart Items: ${cartItemsData.length}`);
  console.log(`  Wishlist Items: ${wishlistData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
