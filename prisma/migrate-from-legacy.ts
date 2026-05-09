import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const OLD_API = 'https://4aayubakawath-production.up.railway.app/api/v1';

const oldApi = axios.create({
  baseURL: OLD_API,
  timeout: 30000,
});

async function migrate() {
  console.log('🚀 Starting data migration from old API to new Prisma DB...\n');
  console.log(`📡 Source: ${OLD_API}\n`);

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
    try {
      const res = await oldApi.get('/category/getCategory');
      const cats = res.data?.data || [];
      for (const cat of cats) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: { name: cat.category, image: cat.image },
          create: {
            id: cat.id,
            name: cat.category,
            image: cat.image,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
          },
        });
        migrated.categories++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Categories: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.categories} categories migrated\n`);

    // ── 2. Products ───────────────────────────────────────────────────────────
    console.log('📦 Migrating products...');
    try {
      let page = 1;
      let allProducts: any[] = [];
      while (true) {
        const res = await oldApi.get(`/product/getAllProduct?page=${page}&limit=100`);
        const data = res.data;
        const products = data.products || data.data || [];
        if (products.length === 0) break;
        allProducts = allProducts.concat(products);
        if (products.length < 100) break;
        page++;
      }
      for (const prod of allProducts) {
        if (!prod.categoryId) continue;
        await prisma.product.upsert({
          where: { id: prod.id },
          update: {},
          create: {
            id: prod.id,
            productName: prod.productName,
            productDescription: prod.productDescription,
            productTags: prod.productTags || [],
            offerTags: prod.offerTags,
            forWhom: prod.forWhom || 'Not specified',
            withWhom: prod.withWhom || 'Not specified',
            price: prod.price,
            finalPrice: prod.finalPrice || prod.price,
            priceTiers: prod.priceTiers || [],
            productImages: prod.productImages,
            grabCode: prod.grabCode,
            grabPrice: prod.grabPrice,
            isActive: true,
            categoryId: prod.categoryId,
            createdAt: prod.createdAt,
            updatedAt: prod.updatedAt,
          },
        });
        migrated.products++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Products: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.products} products migrated\n`);

    // ── 3. Users ──────────────────────────────────────────────────────────────
    console.log('👥 Migrating users...');
    try {
      const res = await oldApi.get('/users/admin/all');
      const users = res.data?.data || [];
      for (const user of users) {
        const existing = await prisma.user.findUnique({ where: { email: user.email || undefined } });
        if (existing) continue;

        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: '$2b$12$legacyMigrated',
            role: 'USER',
            isActive: true,
          },
        });
        migrated.users++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Users: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.users} users migrated\n`);

    // ── 4. Announcements ──────────────────────────────────────────────────────
    console.log('📢 Migrating announcements...');
    try {
      const res = await oldApi.get('/announcement/getAllAnnouncements');
      const anns = res.data?.data || [];
      for (const ann of anns) {
        await prisma.announcement.create({
          data: {
            title: ann.title,
            content: '',
            isActive: true,
            createdAt: ann.createdAt,
            updatedAt: ann.updatedAt,
          },
        });
        migrated.announcements++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Announcements: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.announcements} announcements migrated\n`);

    // ── 5. Home Banners ───────────────────────────────────────────────────────
    console.log('🖼️  Migrating home banners...');
    try {
      const res = await oldApi.get('/homeBanner/getAllHomeBanner');
      const banners = res.data?.data || [];
      for (const banner of banners) {
        const urls = banner.homeBanner || [];
        for (let i = 0; i < urls.length; i++) {
          await prisma.homeBanner.create({
            data: {
              image: urls[i],
              link: null,
              order: i,
              isActive: true,
              createdAt: banner.createdAt,
              updatedAt: banner.updatedAt,
            },
          });
          migrated.homeBanners++;
        }
      }
    } catch (e: any) {
      console.log(`   ⚠️  Home Banners: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.homeBanners} home banner images migrated\n`);

    // ── 6. Offer Banners ──────────────────────────────────────────────────────
    console.log('🎁 Migrating offer banners...');
    try {
      const res = await oldApi.get('/offerBanner/getAllOfferBanner');
      const banners = res.data?.data || [];
      for (const banner of banners) {
        const urls = banner.offerBanner || [];
        for (let i = 0; i < urls.length; i++) {
          await prisma.offerBanner.create({
            data: {
              image: urls[i],
              link: null,
              order: i,
              isActive: true,
              createdAt: banner.createdAt,
              updatedAt: banner.updatedAt,
            },
          });
          migrated.offerBanners++;
        }
      }
    } catch (e: any) {
      console.log(`   ⚠️  Offer Banners: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.offerBanners} offer banner images migrated\n`);

    // ── 7. Category Banners ───────────────────────────────────────────────────
    console.log('🏷️  Migrating category banners...');
    try {
      const res = await oldApi.get('/categoryBanner/getCategoryBanner');
      const banners = res.data?.data || [];
      const firstCategory = await prisma.category.findFirst();
      for (const banner of banners) {
        const urls = banner.categoryBanner || [];
        for (let i = 0; i < urls.length; i++) {
          await prisma.categoryBanner.create({
            data: {
              image: urls[i],
              link: null,
              order: i,
              isActive: true,
              categoryId: firstCategory?.id || '',
              createdAt: banner.createdAt,
              updatedAt: banner.updatedAt,
            },
          });
          migrated.categoryBanners++;
        }
      }
    } catch (e: any) {
      console.log(`   ⚠️  Category Banners: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.categoryBanners} category banner images migrated\n`);

    // ── 8. Offer Bars ─────────────────────────────────────────────────────────
    console.log('📜 Migrating offer bars...');
    try {
      const res = await oldApi.get('/offerBar/getOfferBar');
      const bars = res.data?.data || [];
      for (const bar of bars) {
        await prisma.offerBar.create({
          data: {
            text: bar.offerText,
            link: null,
            order: 0,
            isActive: true,
            createdAt: bar.createdAt,
            updatedAt: bar.updatedAt,
          },
        });
        migrated.offerBars++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Offer Bars: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.offerBars} offer bars migrated\n`);

    // ── 9. Product Content ────────────────────────────────────────────────────
    console.log('📝 Migrating product content...');
    try {
      const res = await oldApi.get('/productContent/all');
      const contents = res.data?.data || [];
      for (const content of contents) {
        await prisma.productContent.upsert({
          where: { id: content.id },
          update: {
            content: {
              benefits: content.benefits || [],
              ingredients: content.ingredients || { list: [], pills: [], details: [] },
              warnings: content.warnings || [],
              howToUse: content.howToUse || [],
              beforeAfter: content.beforeAfter || [],
              descriptionImages: content.descriptionImages || [],
              description: content.description || '',
            },
          },
          create: {
            id: content.id,
            productId: content.productId,
            content: {
              benefits: content.benefits || [],
              ingredients: content.ingredients || { list: [], pills: [], details: [] },
              warnings: content.warnings || [],
              howToUse: content.howToUse || [],
              beforeAfter: content.beforeAfter || [],
              descriptionImages: content.descriptionImages || [],
              description: content.description || '',
            },
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
          },
        });
        migrated.productContents++;
      }
    } catch (e: any) {
      console.log(`   ⚠️  Product Content: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.productContents} product contents migrated\n`);

    // ── 10. Orders ─────────────────────────────────────────────────────────────
    console.log('🛒 Migrating orders...');
    try {
      const statusMap: Record<string, string> = {
        Processing: 'PROCESSING',
        Shipped: 'SHIPPED',
        Delivered: 'DELIVERED',
        Cancelled: 'CANCELLED',
      };
      const res = await oldApi.get('/orders/admin/all');
      const orders = res.data?.data || [];

      // Ensure user exists for orders
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!adminUser) {
        await prisma.user.create({
          data: {
            name: 'System Admin',
            email: 'system@admin.com',
            password: '$2b$12$placeholder',
            role: 'ADMIN',
            isActive: true,
          },
        });
      }
      const fallbackUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

      for (const order of orders) {
        let userId = order.customerObj?.id || order.userId;

        // Check if user exists
        if (userId) {
          const userExists = await prisma.user.findUnique({ where: { id: userId } });
          if (!userExists) {
            // Create user from order data
            try {
              await prisma.user.create({
                data: {
                  id: userId,
                  name: order.customerObj?.name || order.customer || 'Unknown',
                  email: order.customerObj?.email || null,
                  password: '$2b$12$placeholder',
                  role: 'USER',
                  isActive: true,
                },
              });
            } catch {
              userId = fallbackUser?.id || '';
            }
          }
        } else {
          userId = fallbackUser?.id || '';
        }

        const totalAmount = parseFloat(order.amount || order.totalAmount || '0');
        const shippingAddress = order.shippingAddress || { street: '', city: '', state: '', postalCode: '', country: 'India' };

        const existingOrder = await prisma.order.findUnique({ where: { id: order.id } });
        if (existingOrder) continue;

        await prisma.order.create({
          data: {
            id: order.id,
            userId,
            totalAmount,
            status: statusMap[order.status] || 'PROCESSING',
            shippingAddress,
            createdAt: order.createdAt || new Date(),
            updatedAt: order.updatedAt || new Date(),
          },
        });
        migrated.orders++;

        if (order.items) {
          for (const item of order.items) {
            await prisma.orderItem.create({
              data: {
                id: item.id,
                orderId: item.orderId || order.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
                createdAt: item.createdAt,
              },
            });
            migrated.orderItems++;
          }
        }
      }
    } catch (e: any) {
      console.log(`   ⚠️  Orders: ${e.response?.status || e.message}`);
    }
    console.log(`   ✅ ${migrated.orders} orders, ${migrated.orderItems} order items migrated\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Migration completed successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Categories:       ${migrated.categories}`);
    console.log(`   Products:         ${migrated.products}`);
    console.log(`   Announcements:    ${migrated.announcements}`);
    console.log(`   Home Banners:     ${migrated.homeBanners}`);
    console.log(`   Offer Banners:    ${migrated.offerBanners}`);
    console.log(`   Category Banners: ${migrated.categoryBanners}`);
    console.log(`   Offer Bars:       ${migrated.offerBars}`);
    console.log(`   Product Content:  ${migrated.productContents}`);
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
    await prisma.$disconnect();
  });
