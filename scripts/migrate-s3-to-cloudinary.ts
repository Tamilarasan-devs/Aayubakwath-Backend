import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'backend-uploads';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();

const isS3Url = (url: string | null | undefined): boolean => {
  return !!url && (url.includes('s3.amazonaws.com') || url.includes('.s3.'));
};

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_FOLDER}/${folder}`,
        transformation: [
          { width: 1920, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else if (!result) reject(new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

async function migrateProductImages() {
  console.log('\n=== Migrating Product Images ===');

  const products = await prisma.product.findMany();
  let success = 0;
  let failed = 0;

  for (const product of products) {
    const images = product.productImages as Array<{ url: string; publicId?: string }>;
    if (!Array.isArray(images) || images.length === 0) continue;

    const hasS3 = images.some(img => isS3Url(img.url));
    if (!hasS3) continue;

    const newImages: Array<{ publicId: string; url: string; secureUrl: string }> = [];

    for (const img of images) {
      try {
        if (isS3Url(img.url)) {
          const buffer = await downloadImage(img.url);
          const cloudinaryUrl = await uploadBuffer(buffer, 'products');
          const publicId = `backend-uploads/products/${img.url.split('/').pop()?.split('.')[0] || Date.now()}`;
          newImages.push({ publicId, url: cloudinaryUrl, secureUrl: cloudinaryUrl });
          success++;
          console.log(`  ✓ Product ${product.id.slice(0, 8)}...`);
        } else {
          newImages.push(img as any);
        }
      } catch (error: any) {
        failed++;
        console.log(`  ✗ ${img.url.slice(0, 60)}... (${error.message})`);
        newImages.push(img as any);
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { productImages: newImages },
    });
  }

  console.log(`Products: ${success} migrated, ${failed} failed\n`);
}

async function migrateCategoryImages() {
  console.log('=== Migrating Category Images ===');

  const categories = await prisma.category.findMany();
  let success = 0;
  let failed = 0;

  for (const cat of categories) {
    if (!isS3Url(cat.image)) continue;

    try {
      const buffer = await downloadImage(cat.image!);
      const cloudinaryUrl = await uploadBuffer(buffer, 'categories');
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: cloudinaryUrl },
      });
      success++;
      console.log(`  ✓ Category ${cat.name}`);
    } catch (error: any) {
      failed++;
      console.log(`  ✗ Category ${cat.name}: ${error.message}`);
    }
  }
  console.log(`Categories: ${success} migrated, ${failed} failed\n`);
}

async function migrateBanners() {
  console.log('=== Migrating Banner Images ===');
  let totalSuccess = 0;
  let totalFailed = 0;

  async function migrateModel(modelName: string, folder: string) {
    const model = (prisma as any)[modelName];
    if (!model) return;

    const items = await model.findMany();
    for (const item of items) {
      if (!isS3Url(item.image)) continue;

      try {
        const buffer = await downloadImage(item.image);
        const url = await uploadBuffer(buffer, folder);
        await model.update({ where: { id: item.id }, data: { image: url } });
        totalSuccess++;
        console.log(`  ✓ ${modelName} ${item.id.slice(0, 8)}...`);
      } catch (error: any) {
        totalFailed++;
        console.log(`  ✗ ${modelName} ${item.id.slice(0, 8)}: ${error.message}`);
      }
    }
  }

  await migrateModel('homeBanner', 'home-banners');
  await migrateModel('offerBanner', 'offer-banners');
  await migrateModel('categoryBanner', 'category-banners');

  console.log(`Banners: ${totalSuccess} migrated, ${totalFailed} failed\n`);
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   S3 → Cloudinary Image Migration         ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    await migrateProductImages();
    await migrateCategoryImages();
    await migrateBanners();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Migration Complete                      ║');
    console.log('╚════════════════════════════════════════════╝');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
