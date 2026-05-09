import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const OLD_DATABASE_URL = process.env.DATABASE_URL!;
const NEW_DATABASE_URL = process.env.NEW_DB_URL!;

const oldPrisma = new PrismaClient({
  datasources: { db: { url: OLD_DATABASE_URL } },
});

const newPrisma = new PrismaClient({
  datasources: { db: { url: NEW_DATABASE_URL } },
});

async function migrate() {
  console.log('🚀 Starting DB-to-DB migration...\n');
  console.log(`📡 Source: ${OLD_DATABASE_URL.split('@')[1]}`);
  console.log(`📡 Target: ${NEW_DATABASE_URL.split('@')[1]}\n`);

  let migrated = {
    categories: 0,
    products: 0,
    users: 0,
    announcements: 0,
    homeBanners: 0,
    offerBanners: 0,
    categoryBanners: 0,
    offerBars: 0,
    productContents: 0,
    orders: 0,
    orderItems: 0,
    cartItems: 0,
    wishlistItems: 0,
    addresses: 0,
  };

  try {
    // ── 1. Categories ─────────────────────────────────────────────────────────
    console.log('📂 Migrating categories...');
    const categories = await oldPrisma.category.findMany();
    for (const cat of categories) {
      await newPrisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          image: cat.image,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        },
      });
      migrated.categories++;
    }
    console.log(`   ✅ ${migrated.categories} categories migrated\n`);

    // ── 2. Products ───────────────────────────────────────────────────────────
    console.log('📦 Migrating products...');
    const products = await oldPrisma.product.findMany();
    for (const prod of products) {
      await newPrisma.product.upsert({
        where: { id: prod.id },
        update: {},
        create: {
          id: prod.id,
          productName: prod.productName,
          productDescription: prod.productDescription,
          productTags: prod.productTags,
          offerTags: prod.offerTags,
          forWhom: prod.forWhom,
          withWhom: prod.withWhom,
          price: prod.price,
          finalPrice: prod.finalPrice,
          priceTiers: prod.priceTiers,
          productImages: prod.productImages,
          grabCode: prod.grabCode,
          grabPrice: prod.grabPrice,
          isActive: prod.isActive,
          categoryId: prod.categoryId,
          createdAt: prod.createdAt,
          updatedAt: prod.updatedAt,
        },
      });
      migrated.products++;
    }
    console.log(`   ✅ ${migrated.products} products migrated\n`);

    // ── 3. Users ──────────────────────────────────────────────────────────────
    console.log('👥 Migrating users...');
    const users = await oldPrisma.user.findMany();
    for (const user of users) {
      const existing = await newPrisma.user.findUnique({ where: { id: user.id } });
      if (existing) continue;
      await newPrisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: user.password,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      migrated.users++;
    }
    console.log(`   ✅ ${migrated.users} users migrated\n`);

    // ── 4. Announcements ──────────────────────────────────────────────────────
    console.log('📢 Migrating announcements...');
    const announcements = await oldPrisma.announcement.findMany();
    for (const ann of announcements) {
      await newPrisma.announcement.create({
        data: {
          id: ann.id,
          title: ann.title,
          content: ann.content,
          isActive: ann.isActive,
          createdAt: ann.createdAt,
          updatedAt: ann.updatedAt,
        },
      });
      migrated.announcements++;
    }
    console.log(`   ✅ ${migrated.announcements} announcements migrated\n`);

    // ── 5. Home Banners ───────────────────────────────────────────────────────
    console.log('🖼️  Migrating home banners...');
    const homeBanners = await oldPrisma.homeBanner.findMany();
    for (const banner of homeBanners) {
      await newPrisma.homeBanner.create({
        data: {
          id: banner.id,
          image: banner.image,
          link: banner.link,
          order: banner.order,
          isActive: banner.isActive,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      });
      migrated.homeBanners++;
    }
    console.log(`   ✅ ${migrated.homeBanners} home banners migrated\n`);

    // ── 6. Offer Banners ──────────────────────────────────────────────────────
    console.log('🎁 Migrating offer banners...');
    const offerBanners = await oldPrisma.offerBanner.findMany();
    for (const banner of offerBanners) {
      await newPrisma.offerBanner.create({
        data: {
          id: banner.id,
          image: banner.image,
          link: banner.link,
          order: banner.order,
          isActive: banner.isActive,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      });
      migrated.offerBanners++;
    }
    console.log(`   ✅ ${migrated.offerBanners} offer banners migrated\n`);

    // ── 7. Category Banners ───────────────────────────────────────────────────
    console.log('🏷️  Migrating category banners...');
    const categoryBanners = await oldPrisma.categoryBanner.findMany();
    for (const banner of categoryBanners) {
      await newPrisma.categoryBanner.create({
        data: {
          id: banner.id,
          image: banner.image,
          link: banner.link,
          order: banner.order,
          isActive: banner.isActive,
          categoryId: banner.categoryId,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      });
      migrated.categoryBanners++;
    }
    console.log(`   ✅ ${migrated.categoryBanners} category banners migrated\n`);

    // ── 8. Offer Bars ─────────────────────────────────────────────────────────
    console.log('📜 Migrating offer bars...');
    const offerBars = await oldPrisma.offerBar.findMany();
    for (const bar of offerBars) {
      await newPrisma.offerBar.create({
        data: {
          id: bar.id,
          text: bar.text,
          link: bar.link,
          order: bar.order,
          isActive: bar.isActive,
          createdAt: bar.createdAt,
          updatedAt: bar.updatedAt,
        },
      });
      migrated.offerBars++;
    }
    console.log(`   ✅ ${migrated.offerBars} offer bars migrated\n`);

    // ── 9. Product Content ────────────────────────────────────────────────────
    console.log('📝 Migrating product content...');
    const productContents = await oldPrisma.productContent.findMany();
    for (const content of productContents) {
      await newPrisma.productContent.upsert({
        where: { id: content.id },
        update: {},
        create: {
          id: content.id,
          productId: content.productId,
          content: content.content,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        },
      });
      migrated.productContents++;
    }
    console.log(`   ✅ ${migrated.productContents} product contents migrated\n`);

    // ── 10. Addresses ──────────────────────────────────────────────────────────
    console.log('🏠 Migrating addresses...');
    const addresses = await oldPrisma.address.findMany();
    for (const addr of addresses) {
      await newPrisma.address.create({
        data: {
          id: addr.id,
          userId: addr.userId,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
          updatedAt: addr.updatedAt,
        },
      });
      migrated.addresses++;
    }
    console.log(`   ✅ ${migrated.addresses} addresses migrated\n`);

    // ── 11. Cart Items ─────────────────────────────────────────────────────────
    console.log('🛒 Migrating cart items...');
    const cartItems = await oldPrisma.cartItem.findMany();
    for (const item of cartItems) {
      await newPrisma.cartItem.create({
        data: {
          id: item.id,
          userId: item.userId,
          productId: item.productId,
          quantity: item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
      migrated.cartItems++;
    }
    console.log(`   ✅ ${migrated.cartItems} cart items migrated\n`);

    // ── 12. Wishlist Items ─────────────────────────────────────────────────────
    console.log('❤️  Migrating wishlist items...');
    const wishlistItems = await oldPrisma.wishlist.findMany();
    for (const item of wishlistItems) {
      await newPrisma.wishlist.create({
        data: {
          id: item.id,
          userId: item.userId,
          productId: item.productId,
          createdAt: item.createdAt,
        },
      });
      migrated.wishlistItems++;
    }
    console.log(`   ✅ ${migrated.wishlistItems} wishlist items migrated\n`);

    // ── 13. Orders ─────────────────────────────────────────────────────────────
    console.log('📦 Migrating orders...');
    const orders = await oldPrisma.order.findMany();
    for (const order of orders) {
      const existing = await newPrisma.order.findUnique({ where: { id: order.id } });
      if (existing) continue;
      await newPrisma.order.create({
        data: {
          id: order.id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      });
      migrated.orders++;
    }
    console.log(`   ✅ ${migrated.orders} orders migrated\n`);

    // ── 14. Order Items ────────────────────────────────────────────────────────
    console.log('📋 Migrating order items...');
    const orderItems = await oldPrisma.orderItem.findMany();
    for (const item of orderItems) {
      await newPrisma.orderItem.create({
        data: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          createdAt: item.createdAt,
        },
      });
      migrated.orderItems++;
    }
    console.log(`   ✅ ${migrated.orderItems} order items migrated\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Migration completed successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Categories:       ${migrated.categories}`);
    console.log(`   Products:         ${migrated.products}`);
    console.log(`   Users:            ${migrated.users}`);
    console.log(`   Announcements:    ${migrated.announcements}`);
    console.log(`   Home Banners:     ${migrated.homeBanners}`);
    console.log(`   Offer Banners:    ${migrated.offerBanners}`);
    console.log(`   Category Banners: ${migrated.categoryBanners}`);
    console.log(`   Offer Bars:       ${migrated.offerBars}`);
    console.log(`   Product Content:  ${migrated.productContents}`);
    console.log(`   Addresses:        ${migrated.addresses}`);
    console.log(`   Cart Items:       ${migrated.cartItems}`);
    console.log(`   Wishlist Items:   ${migrated.wishlistItems}`);
    console.log(`   Orders:           ${migrated.orders}`);
    console.log(`   Order Items:      ${migrated.orderItems}`);
    console.log('═══════════════════════════════════════════════════════');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  });
