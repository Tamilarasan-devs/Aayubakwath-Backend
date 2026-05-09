import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      phoneNumber: '+1234567890',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const electronics = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Electronics',
      image: 'https://via.placeholder.com/150',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Clothing',
      image: 'https://via.placeholder.com/150',
    },
  });

  await prisma.product.createMany({
    data: [
      {
        productName: 'Wireless Headphones',
        productDescription: 'High-quality wireless headphones with noise cancellation',
        productTags: ['electronics', 'audio', 'wireless'],
        price: 99.99,
        finalPrice: 79.99,
        categoryId: electronics.id,
      },
      {
        productName: 'Smart Watch',
        productDescription: 'Feature-rich smartwatch with health tracking',
        productTags: ['electronics', 'wearable', 'fitness'],
        price: 199.99,
        finalPrice: 149.99,
        categoryId: electronics.id,
      },
      {
        productName: 'Cotton T-Shirt',
        productDescription: 'Comfortable cotton t-shirt',
        productTags: ['clothing', 'casual'],
        price: 29.99,
        finalPrice: 19.99,
        categoryId: clothing.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to Our Store',
        content: 'Check out our latest products and offers!',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.homeBanner.createMany({
    data: [
      {
        image: 'https://via.placeholder.com/1200x400',
        link: '/products',
        order: 1,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
