import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { managerService } from '../services/managerService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// --- ANNOUNCEMENTS ---

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await managerService.getAllAnnouncements();
    return successResponse(res, announcements);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const userId = req.user!.id; // Manager/Admin
    const data = { ...req.body, created_by: userId, is_active: true };
    const newAnnouncement = await managerService.createAnnouncement(data);
    return successResponse(res, newAnnouncement, 'Announcement posted', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    await managerService.deleteAnnouncement(req.params.id);
    return successResponse(res, null, 'Announcement removed');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

// --- TASKS ---

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const tasks = await managerService.getTasks({ userId, status: req.query.status });
    return successResponse(res, tasks);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const listAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await managerService.getTasks({}); // all tasks
    return successResponse(res, tasks);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const assignTask = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const managerId = req.user!.id;
    const data = { ...req.body, assigned_by: managerId, status: 'pending' };
    const newTask = await managerService.createTask(data);
    return successResponse(res, newTask, 'Task assigned', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await managerService.updateTaskStatus(req.params.id, status);
    return successResponse(res, updated, 'Task updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

// --- ORDERS ---

export const listOrders = async (req: Request, res: Response) => {
  try {
    const orders = await managerService.getAllOrders();
    return successResponse(res, orders);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await managerService.getOrderById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const userId = req.user!.id;
    const { items, ...orderData } = req.body;
    const data = { ...orderData, created_by: userId };
    
    const newOrder = await managerService.createOrder(data, items);
    return successResponse(res, newOrder, 'Purchase Order created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
      const { status } = req.body;
      const updated = await managerService.updateOrderStatus(req.params.id, status);
      return successResponse(res, updated, `Order marked as ${status}`);
  } catch (error: any) {
      return errorResponse(res, error.message);
  }
};
