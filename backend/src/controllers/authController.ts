import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const registerUser = async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation Error', 400, errors.array());
  }

  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error: any) {
    const statusCode = error.message.includes('already exists') ? 409 : 500;
    return errorResponse(res, error.message, statusCode);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation Error', 400, errors.array());
  }

  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 401 : 500;
    return errorResponse(res, error.message, statusCode);
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User profile retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
