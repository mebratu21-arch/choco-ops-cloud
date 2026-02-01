import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { mechanicService } from '../services/mechanicService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { AlertFilters, AlertStatus, AlertPriority } from '../types/mechanic.types.js';

// --- MACHINE CONTROLLERS ---

export const listMachines = async (req: Request, res: Response) => {
  try {
    const machines = await mechanicService.getAllMachines();
    return successResponse(res, machines);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getMachine = async (req: Request, res: Response) => {
  try {
    const machine = await mechanicService.getMachineById(req.params.id);
    if (!machine) return errorResponse(res, 'Machine not found', 404);
    return successResponse(res, machine);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createMachine = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const newMachine = await mechanicService.createMachine(req.body);
    return successResponse(res, newMachine, 'Machine created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  try {
    const updated = await mechanicService.updateMachine(req.params.id, req.body);
    if (!updated) return errorResponse(res, 'Machine not found', 404);
    return successResponse(res, updated, 'Machine updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

// --- SOS CONTROLLERS ---

export const listAlerts = async (req: Request, res: Response) => {
  try {
    const filters: AlertFilters = {
      status: req.query.status as AlertStatus,
      priority: req.query.priority as AlertPriority,
      machineId: req.query.machineId as string,
      assignedTo: req.query.assignedTo as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await mechanicService.getAllAlerts(filters);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createAlert = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const userId = req.user!.id;
    const { machineId, priority, description } = req.body;
    
    const alertData = {
        machine_id: machineId,
        reported_by: userId,
        priority,
        description,
        status: 'pending'
    };
    
    const newAlert = await mechanicService.createAlert(alertData as any);
    return successResponse(res, newAlert, 'SOS Alert transmitted', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const assignAlert = async (req: Request, res: Response) => {
  try {
    const { mechanicId } = req.body;
    const updated = await mechanicService.assignAlert(req.params.id, mechanicId);
    if (!updated) return errorResponse(res, 'Alert not found', 404);
    return successResponse(res, updated, 'Alert assigned');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const mechanicId = req.user!.id; // Current user resolving it
    const updated = await mechanicService.resolveAlert(req.params.id, notes, mechanicId);
    return successResponse(res, updated, 'Alert resolved and logged');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const cancelAlert = async (req: Request, res: Response) => {
    try {
        const cancelled = await mechanicService.cancelAlert(req.params.id);
        return successResponse(res, cancelled, 'Alert cancelled');
    } catch (error: any) {
        return errorResponse(res, error.message);
    }
};

// --- MAINTENANCE CONTROLLERS ---

export const listMaintenance = async (req: Request, res: Response) => {
    try {
        const logs = await mechanicService.getAllMaintenanceLogs(req.query);
        return successResponse(res, logs);
    } catch(error: any) {
        return errorResponse(res, error.message);
    }
};

export const createMaintenance = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

    try {
        const userId = req.user!.id;
        const data = { ...req.body, performed_by: userId, date_performed: new Date() };
        const log = await mechanicService.createMaintenanceLog(data);
        return successResponse(res, log, 'Maintenance logged', 201);
    } catch(error: any) {
        return errorResponse(res, error.message);
    }
};

export const getUpcoming = async (req: Request, res: Response) => {
    try {
        const machines = await mechanicService.getUpcomingMaintenance();
        return successResponse(res, machines);
    } catch(error: any) {
        return errorResponse(res, error.message);
    }
};
