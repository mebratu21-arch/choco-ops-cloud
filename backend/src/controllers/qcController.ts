import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { qcService } from '../services/qcService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { QCFilters, QCResult } from '../types/qc.types.js';

export const listQCChecks = async (req: Request, res: Response) => {
  try {
    const filters: QCFilters = {
      result: req.query.result as QCResult,
      batchId: req.query.batchId as string,
      inspectorId: req.query.inspectorId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await qcService.getAllQCChecks(filters);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getQCCheck = async (req: Request, res: Response) => {
  try {
    const check = await qcService.getQCCheckById(req.params.id);
    if (!check) return errorResponse(res, 'QC Check not found', 404);
    return successResponse(res, check);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createQCCheck = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const userId = req.user!.id; // Inspector is the logged-in user
    const { defects, ...checkData } = req.body;

    const dataToCreate = {
      ...checkData,
      inspector_id: userId,
      inspection_date: new Date()
    };

    const newCheck = await qcService.createQCCheck(dataToCreate, defects);
    return successResponse(res, newCheck, 'QC Inspection log created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateQCCheck = async (req: Request, res: Response) => {
  try {
    const updated = await qcService.updateQCCheck(req.params.id, req.body);
    if (!updated) return errorResponse(res, 'QC Check not found', 404);
    return successResponse(res, updated, 'QC Check updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteQCCheck = async (req: Request, res: Response) => {
  try {
    const deleted = await qcService.deleteQCCheck(req.params.id);
    if (!deleted) return errorResponse(res, 'QC Check not found', 404);
    return successResponse(res, null, 'QC Check deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getQCStats = async (req: Request, res: Response) => {
  try {
      const stats = await qcService.getQCStats();
      return successResponse(res, stats);
  } catch (error: any) {
      return errorResponse(res, error.message);
  }
};

export const getDefectAnalysis = async (req: Request, res: Response) => {
    try {
        const defects = await qcService.getDefectsByType();
        return successResponse(res, defects);
    } catch (error: any) {
        return errorResponse(res, error.message);
    }
};
