// Reloading to refresh database connection
import { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/index.js';
import { prisma } from '@config/database.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

function getDateRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDateKey(date: Date, range: string): string {
  switch (range) {
    case '7d':
      return `${date.getMonth() + 1}/${date.getDate()}`;
    case '30d':
      return `${date.getMonth() + 1}/${date.getDate()}`;
    case '90d':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case '1y':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default:
      return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

export const getKPIs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { range = '30d' } = req.query as { range?: string };
  const { start, end } = getDateRange(range);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - (end.getDate() - start.getDate()));

  const [currentOrders, prevOrders, currentUsers, prevUsers, currentRevenue, prevRevenue, totalProducts] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, totalAmount: true, status: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: prevStart, lt: start } },
        select: { id: true, totalAmount: true, status: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: start, lte: end }, role: 'USER' } }),
      prisma.user.count({ where: { createdAt: { gte: prevStart, lt: start }, role: 'USER' } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: prevStart, lt: start }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

  const revenue = Number(currentRevenue._sum.totalAmount || 0);
  const prevRevenueVal = Number(prevRevenue._sum.totalAmount || 0);
  const revenueChange = prevRevenueVal > 0 ? ((revenue - prevRevenueVal) / prevRevenueVal) * 100 : 0;

  const orderCount = currentOrders.length;
  const prevOrderCount = prevOrders.length;
  const orderChange = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0;

  const userCount = currentUsers;
  const userChange = prevUsers > 0 ? ((userCount - prevUsers) / prevUsers) * 100 : 0;

  const aov = orderCount > 0 ? revenue / orderCount : 0;
  const prevAov = prevOrderCount > 0 ? prevRevenueVal / prevOrderCount : 0;
  const aovChange = prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 0;

  const cancelledCount = currentOrders.filter((o) => o.status === 'CANCELLED').length;
  const cancellationRate = orderCount > 0 ? (cancelledCount / orderCount) * 100 : 0;

  const deliveredCount = currentOrders.filter((o) => o.status === 'DELIVERED').length;
  const processingCount = currentOrders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = currentOrders.filter((o) => o.status === 'SHIPPED').length;

  successResponse(res, {
    revenue,
    revenueChange: Math.round(revenueChange * 100) / 100,
    orders: orderCount,
    ordersChange: Math.round(orderChange * 100) / 100,
    users: userCount,
    usersChange: Math.round(userChange * 100) / 100,
    totalProducts,
    aov: Math.round(aov * 100) / 100,
    aovChange: Math.round(aovChange * 100) / 100,
    cancellationRate: Math.round(cancellationRate * 100) / 100,
    statusBreakdown: {
      processing: processingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
    },
  });
});

export const getRevenueOverTime = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { range = '30d' } = req.query as { range?: string };
  const { start, end } = getDateRange(range);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: 'asc' },
  });

  const dataMap = new Map<string, { date: string; revenue: number; orders: number }>();

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const key = formatDateKey(currentDate, range);
    dataMap.set(key, { date: key, revenue: 0, orders: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const order of orders) {
    const key = formatDateKey(order.createdAt, range);
    const existing = dataMap.get(key);
    if (existing) {
      existing.revenue += Number(order.totalAmount);
      existing.orders += 1;
    }
  }

  const data = Array.from(dataMap.values()).map((d) => ({
    ...d,
    revenue: Math.round(d.revenue * 100) / 100,
  }));

  successResponse(res, data);
});

export const getRevenueByCategory = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: true,
        },
      },
    },
  });

  const data = categories.map((cat) => {
    let revenue = 0;
    let unitsSold = 0;
    for (const product of cat.products) {
      for (const item of product.orderItems) {
        revenue += Number(item.priceAtPurchase) * item.quantity;
        unitsSold += item.quantity;
      }
    }
    return {
      category: cat.name,
      revenue: Math.round(revenue * 100) / 100,
      unitsSold,
      productCount: cat.products.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const dataWithPercentage = data.map((d) => ({
    ...d,
    percentage: totalRevenue > 0 ? Math.round((d.revenue / totalRevenue) * 10000) / 100 : 0,
  }));

  successResponse(res, dataWithPercentage);
});

export const getTopProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) || 10 : 10;
  const take = Math.min(limit, 50);

  const orderItems = await prisma.orderItem.findMany({
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          productImages: true,
          price: true,
          finalPrice: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  const productMap = new Map<string, {
    id: string;
    name: string;
    image: string | null;
    price: number;
    category: string;
    unitsSold: number;
    revenue: number;
  }>();

  for (const item of orderItems) {
    const productId = item.productId;
    const existing = productMap.get(productId);
    const price = Number(item.priceAtPurchase);
    if (existing) {
      existing.unitsSold += item.quantity;
      existing.revenue += price * item.quantity;
    } else {
      const images = item.product.productImages as unknown as string[] | null;
      productMap.set(productId, {
        id: item.product.id,
        name: item.product.productName,
        image: images && images.length > 0 ? images[0] : null,
        price: Number(item.product.finalPrice || item.product.price),
        category: item.product.category.name,
        unitsSold: item.quantity,
        revenue: price * item.quantity,
      });
    }
  }

  const data = Array.from(productMap.values())
    .map((d) => ({ ...d, revenue: Math.round(d.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, take);

  successResponse(res, data);
});

export const getOrderStatusDistribution = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { range = '30d' } = req.query as { range?: string };
  const { start, end } = getDateRange(range);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { status: true, totalAmount: true },
  });

  const statusMap: Record<string, { count: number; revenue: number }> = {
    PROCESSING: { count: 0, revenue: 0 },
    SHIPPED: { count: 0, revenue: 0 },
    DELIVERED: { count: 0, revenue: 0 },
    CANCELLED: { count: 0, revenue: 0 },
  };

  for (const order of orders) {
    statusMap[order.status].count += 1;
    if (order.status !== 'CANCELLED') {
      statusMap[order.status].revenue += Number(order.totalAmount);
    }
  }

  const data = Object.entries(statusMap).map(([status, values]) => ({
    status,
    count: values.count,
    revenue: Math.round(values.revenue * 100) / 100,
  }));

  successResponse(res, data);
});

export const getOrdersOverTime = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { range = '30d' } = req.query as { range?: string };
  const { start, end } = getDateRange(range);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const dataMap = new Map<string, { date: string; orders: number; delivered: number; cancelled: number }>();

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const key = formatDateKey(currentDate, range);
    dataMap.set(key, { date: key, orders: 0, delivered: 0, cancelled: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const order of orders) {
    const key = formatDateKey(order.createdAt, range);
    const existing = dataMap.get(key);
    if (existing) {
      existing.orders += 1;
      if (order.status === 'DELIVERED') existing.delivered += 1;
      if (order.status === 'CANCELLED') existing.cancelled += 1;
    }
  }

  successResponse(res, Array.from(dataMap.values()));
});

export const getUserGrowth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { range = '30d' } = req.query as { range?: string };
  const { start, end } = getDateRange(range);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: start, lte: end }, role: 'USER' },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const dataMap = new Map<string, { date: string; newUsers: number }>();

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const key = formatDateKey(currentDate, range);
    dataMap.set(key, { date: key, newUsers: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const user of users) {
    const key = formatDateKey(user.createdAt, range);
    const existing = dataMap.get(key);
    if (existing) {
      existing.newUsers += 1;
    }
  }

  let cumulative = 0;
  const data = Array.from(dataMap.values()).map((d) => {
    cumulative += d.newUsers;
    return { ...d, cumulative };
  });

  successResponse(res, data);
});

export const getUserRoleDistribution = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  const total = users.reduce((sum, u) => sum + u._count, 0);
  const data = users.map((u) => ({
    role: u.role,
    count: u._count,
    percentage: total > 0 ? Math.round((u._count / total) * 10000) / 100 : 0,
  }));

  successResponse(res, data);
});

export const getUserOrderFrequency = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const orderCounts = await prisma.order.groupBy({
    by: ['userId'],
    _count: true,
  });

  const buckets = {
    '1': 0,
    '2-3': 0,
    '4-5': 0,
    '6-10': 0,
    '10+': 0,
  };

  for (const oc of orderCounts) {
    const count = oc._count;
    if (count === 1) buckets['1'] += 1;
    else if (count <= 3) buckets['2-3'] += 1;
    else if (count <= 5) buckets['4-5'] += 1;
    else if (count <= 10) buckets['6-10'] += 1;
    else buckets['10+'] += 1;
  }

  const data = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  successResponse(res, data);
});

export const getCartStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const [totalCartItems, cartByProduct] = await Promise.all([
    prisma.cartItem.aggregate({ _sum: { quantity: true }, _count: true }),
    prisma.cartItem.groupBy({
      by: ['productId'],
      _count: true,
      _sum: { quantity: true },
    }),
  ]);

  let totalValue = 0;
  for (const item of cartByProduct) {
    const product = await prisma.cartItem.findFirst({
      where: { productId: item.productId },
      include: { product: { select: { finalPrice: true, price: true } } },
    });
    if (product) {
      totalValue += (Number(product.product.finalPrice || product.product.price)) * item._sum.quantity!;
    }
  }

  const mostCarted = await prisma.cartItem.groupBy({
    by: ['productId'],
    _count: true,
    _sum: { quantity: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 10,
  });

  const mostCartedWithNames = await Promise.all(
    mostCarted.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { productName: true },
      });
      return {
        product: product?.productName || 'Unknown',
        cartCount: item._count,
        totalQuantity: item._sum.quantity || 0,
      };
    }),
  );

  const totalOrders = await prisma.order.count();
  const totalCarts = await prisma.cartItem.groupBy({ by: ['userId'], _count: true });
  const abandonmentRate = totalCarts.length > 0
    ? Math.round(((totalCarts.length - totalOrders) / totalCarts.length) * 10000) / 100
    : 0;

  successResponse(res, {
    totalCartItems: totalCartItems._count,
    totalQuantity: totalCartItems._sum.quantity || 0,
    totalValue: Math.round(totalValue * 100) / 100,
    totalUniqueCarts: totalCarts.length,
    totalOrders,
    abandonmentRate: Math.max(0, abandonmentRate),
    mostCarted: mostCartedWithNames,
  });
});

export const getWishlistStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const totalWishlistItems = await prisma.wishlist.count();

  const wishlistByProduct = await prisma.wishlist.groupBy({
    by: ['productId'],
    _count: true,
    orderBy: { _count: { productId: 'desc' } },
    take: 10,
  });

  const wishlistWithNames = await Promise.all(
    wishlistByProduct.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { productName: true, price: true, finalPrice: true },
      });
      const purchasedCount = await prisma.orderItem.count({
        where: { productId: item.productId },
      });
      return {
        product: product?.productName || 'Unknown',
        wishlistCount: item._count,
        price: Number(product?.finalPrice || product?.price || 0),
        purchasedCount,
        conversionRate: item._count > 0
          ? Math.round((purchasedCount / item._count) * 10000) / 100
          : 0,
      };
    }),
  );

  successResponse(res, {
    totalWishlistItems,
    topWishlisted: wishlistWithNames,
  });
});

export const getCategoryPerformance = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  const data = categories.map((cat) => {
    let revenue = 0;
    let orders = 0;
    let unitsSold = 0;
    const productPrices: number[] = [];

    for (const product of cat.products) {
      productPrices.push(Number(product.finalPrice || product.price));
      for (const item of product.orderItems) {
        revenue += Number(item.priceAtPurchase) * item.quantity;
        unitsSold += item.quantity;
        orders += 1;
      }
    }

    const topProduct = cat.products.reduce((best, p) => {
      const pRevenue = p.orderItems.reduce((sum, item) => sum + Number(item.priceAtPurchase) * item.quantity, 0);
      return pRevenue > best.revenue ? { name: p.productName, revenue: pRevenue } : best;
    }, { name: 'N/A', revenue: 0 });

    return {
      category: cat.name,
      productCount: cat._count.products,
      revenue: Math.round(revenue * 100) / 100,
      orders,
      unitsSold,
      avgPrice: productPrices.length > 0
        ? Math.round((productPrices.reduce((s, p) => s + p, 0) / productPrices.length) * 100) / 100
        : 0,
      topProduct: topProduct.name,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  successResponse(res, data);
});

export const getFulfillmentMetrics = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const deliveredOrders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    select: { createdAt: true, updatedAt: true },
  });

  if (deliveredOrders.length === 0) {
    successResponse(res, { avgDays: 0, medianDays: 0, p95Days: 0, totalDelivered: 0 });
    return;
  }

  const fulfillmentDays = deliveredOrders.map((o) => {
    const created = new Date(o.createdAt).getTime();
    const updated = new Date(o.updatedAt).getTime();
    return Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
  }).sort((a, b) => a - b);

  const avgDays = fulfillmentDays.reduce((s, d) => s + d, 0) / fulfillmentDays.length;
  const medianDays = fulfillmentDays.length % 2 === 0
    ? (fulfillmentDays[fulfillmentDays.length / 2 - 1] + fulfillmentDays[fulfillmentDays.length / 2]) / 2
    : fulfillmentDays[Math.floor(fulfillmentDays.length / 2)];
  const p95Index = Math.floor(fulfillmentDays.length * 0.95);
  const p95Days = fulfillmentDays[Math.min(p95Index, fulfillmentDays.length - 1)];

  successResponse(res, {
    avgDays: Math.round(avgDays * 100) / 100,
    medianDays: Math.round(medianDays * 100) / 100,
    p95Days: Math.round(p95Days * 100) / 100,
    totalDelivered: deliveredOrders.length,
  });
});

export const getRecentActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) || 20 : 20;
  const take = Math.min(limit, 50);

  const [orders, users, products] = await Promise.all([
    prisma.order.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, status: true, user: { select: { name: true } }, totalAmount: true },
    }),
    prisma.user.findMany({
      take,
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, name: true, email: true },
    }),
    prisma.product.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, productName: true },
    }),
  ]);

  const activity = [
    ...orders.map((o) => ({
      type: 'order' as const,
      id: o.id,
      timestamp: o.createdAt,
      description: `New order from ${o.user?.name || 'Unknown'} - Rs.${Number(o.totalAmount).toLocaleString('en-IN')}`,
      status: o.status,
    })),
    ...users.map((u) => ({
      type: 'user' as const,
      id: u.id,
      timestamp: u.createdAt,
      description: `New user registered: ${u.name || u.email || 'Unknown'}`,
    })),
    ...products.map((p) => ({
      type: 'product' as const,
      id: p.id,
      timestamp: p.createdAt,
      description: `New product created: ${p.productName}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, take);

  successResponse(res, activity);
});

export const getLowPerformingProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const days = typeof req.query.days === 'string' ? parseInt(req.query.days) || 30 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const productsWithOrders = await prisma.orderItem.findMany({
    where: { createdAt: { gte: since } },
    select: { productId: true },
  });

  const productIdsWithOrders = new Set(productsWithOrders.map((i) => i.productId));

  const lowPerforming = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: Array.from(productIdsWithOrders) },
    },
    select: {
      id: true,
      productName: true,
      productImages: true,
      price: true,
      finalPrice: true,
      category: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = lowPerforming.map((p) => ({
    id: p.id,
    name: p.productName,
    image: (p.productImages as unknown as string[] | null)?.[0] || null,
    price: Number(p.finalPrice || p.price),
    category: p.category.name,
    daysSinceCreation: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  }));

  successResponse(res, data);
});
