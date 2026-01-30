import { Request, Response } from 'express';
import { AdminService } from '../services/system/admin.service.js';
import { AnnouncementService } from '../services/system/announcement.service.js';
import { TaskService } from '../services/system/task.service.js';
import { logger } from '../config/logger.js';

export class AdminController {
  static async createUser(req: Request & { user?: any }, res: Response) {
    try {
      const input = req.body;
      const userId = req.user.id;

      const user = await AdminService.createUser(input, userId);

      res.status(201).json({
        success: true,
        message: 'User created',
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }

  static async getSystemStats(req: Request, res: Response) {
    // Mock robust system stats for dashboard
    res.json({
        success: true,
        data: {
            users: { total: 12, active: 8, new_this_week: 3 },
            system: { health: 'OPTIMAL', uptime: '99.99%', version: 'v1.2.0' },
            revenue: { daily: 14500, monthly: 450000, growth: '+12.5%' },
            db: { status: 'CONNECTED', latency: '24ms' }
        }
    });
  }

  // ============= ANNOUNCEMENTS =============

  static async createAnnouncement(req: Request & { user?: any }, res: Response) {
    try {
      const announcement = await AnnouncementService.create(req.body, req.user.id);
      res.status(201).json({ success: true, data: announcement });
    } catch (error: any) {
      logger.error('Create announcement failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAnnouncements(req: Request, res: Response) {
    try {
      const activeOnly = req.query.active === 'true';
      const announcements = await AnnouncementService.getAll(activeOnly);
      res.json({ success: true, data: announcements });
    } catch (error: any) {
      logger.error('Get announcements failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
    }
  }

  static async getAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await AnnouncementService.getById(id);
      res.json({ success: true, data: announcement });
    } catch (error: any) {
      logger.error('Get announcement failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await AnnouncementService.update(id, req.body);
      res.json({ success: true, data: announcement });
    } catch (error: any) {
      logger.error('Update announcement failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteAnnouncement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AnnouncementService.delete(id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      logger.error('Delete announcement failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // ============= TASKS =============

  static async createTask(req: Request & { user?: any }, res: Response) {
    try {
      const task = await TaskService.create(req.body, req.user.id);
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      logger.error('Create task failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getTasks(req: Request & { user?: any }, res: Response) {
    try {
      const filters = {
        assignedTo: req.query.assignedTo as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
      };
      const tasks = await TaskService.getAll(filters);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      logger.error('Get tasks failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
  }

  static async getTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await TaskService.getById(id);
      res.json({ success: true, data: task });
    } catch (error: any) {
      logger.error('Get task failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateTask(req: Request & { user?: any }, res: Response) {
    try {
      const { id } = req.params;
      const task = await TaskService.update(id, req.body, req.user.id);
      res.json({ success: true, data: task });
    } catch (error: any) {
      logger.error('Update task failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async completeTask(req: Request & { user?: any }, res: Response) {
    try {
      const { id } = req.params;
      const { completionNotes } = req.body;
      const task = await TaskService.complete(id, completionNotes, req.user.id);
      res.json({ success: true, data: task });
    } catch (error: any) {
      logger.error('Complete task failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await TaskService.delete(id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      logger.error('Delete task failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getMyTasks(req: Request & { user?: any }, res: Response) {
    try {
      const tasks = await TaskService.getByAssignee(req.user.id);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      logger.error('Get my tasks failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
  }
}
