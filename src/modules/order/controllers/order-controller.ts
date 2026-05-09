import { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/index.js';
import { orderService } from '@modules/order/services/order-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await orderService.createOrder(req.userId!, req.body);

  successResponse(res, order, 'Order created successfully', 201);
});

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await orderService.getOrdersByUserId(
    req.userId!,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );

  successResponse(res, result.data, 'Orders retrieved successfully', result.meta);
});

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const order = await orderService.getOrderById(id);

  successResponse(res, order, 'Order retrieved successfully');
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(id, status);

  successResponse(res, order, 'Order status updated successfully');
});

export const getAllOrders = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const orders = await orderService.getAllOrders();
  successResponse(res, orders, 'All orders retrieved successfully');
});
