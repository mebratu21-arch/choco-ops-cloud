import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  completionNotes?: string;
}

export class TaskService {
  /**
   * Create a new task
   */
  static async create(input: CreateTaskInput, assignedBy: string) {
    try {
      const [task] = await db('tasks')
        .insert({
          title: input.title,
          description: input.description || null,
          assigned_to: input.assignedTo,
          assigned_by: assignedBy,
          priority: input.priority || 'MEDIUM',
          due_date: input.dueDate || null,
          status: 'PENDING',
        })
        .returning('*');

      logger.info('Task created', { taskId: task.id, assignedTo: input.assignedTo, assignedBy });
      return task;
    } catch (error: any) {
      logger.error('Failed to create task', { error: error.message });
      throw new Error('Failed to create task');
    }
  }

  /**
   * Get all tasks
   */
  static async getAll(filters?: { assignedTo?: string; status?: string; priority?: string }) {
    try {
      let query = db('tasks')
        .select(
          'tasks.*',
          'assigned_user.name as assigned_to_name',
          'assigned_user.email as assigned_to_email',
          'assigned_user.role as assigned_to_role',
          'assigner.name as assigned_by_name'
        )
        .leftJoin('users as assigned_user', 'tasks.assigned_to', 'assigned_user.id')
        .leftJoin('users as assigner', 'tasks.assigned_by', 'assigner.id')
        .orderBy('tasks.priority', 'desc')
        .orderBy('tasks.due_date', 'asc');

      if (filters?.assignedTo) {
        query = query.where('tasks.assigned_to', filters.assignedTo);
      }

      if (filters?.status) {
        query = query.where('tasks.status', filters.status);
      }

      if (filters?.priority) {
        query = query.where('tasks.priority', filters.priority);
      }

      const tasks = await query;
      return tasks;
    } catch (error: any) {
      logger.error('Failed to fetch tasks', { error: error.message });
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Get single task by ID
   */
  static async getById(id: string) {
    try {
      const task = await db('tasks')
        .select(
          'tasks.*',
          'assigned_user.name as assigned_to_name',
          'assigned_user.email as assigned_to_email',
          'assigner.name as assigned_by_name'
        )
        .leftJoin('users as assigned_user', 'tasks.assigned_to', 'assigned_user.id')
        .leftJoin('users as assigner', 'tasks.assigned_by', 'assigner.id')
        .where('tasks.id', id)
        .first();

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    } catch (error: any) {
      logger.error('Failed to fetch task', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update task
   */
  static async update(id: string, input: UpdateTaskInput, userId?: string) {
    try {
      const updateData: any = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo;
      if (input.status !== undefined) {
        updateData.status = input.status;
        // Auto-set completed_at when status changes to COMPLETED
        if (input.status === 'COMPLETED' && !updateData.completed_at) {
          updateData.completed_at = new Date();
        }
      }
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
      if (input.completionNotes !== undefined) updateData.completion_notes = input.completionNotes;

      updateData.updated_at = new Date();

      const [updated] = await db('tasks')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!updated) {
        throw new Error('Task not found');
      }

      logger.info('Task updated', { taskId: id, updatedBy: userId });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update task', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Mark task as completed
   */
  static async complete(id: string, completionNotes?: string, userId?: string) {
    try {
      const [updated] = await db('tasks')
        .where({ id })
        .update({
          status: 'COMPLETED',
          completed_at: new Date(),
          completion_notes: completionNotes || null,
          updated_at: new Date(),
        })
        .returning('*');

      if (!updated) {
        throw new Error('Task not found');
      }

      logger.info('Task completed', { taskId: id, completedBy: userId });
      return updated;
    } catch (error: any) {
      logger.error('Failed to complete task', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete task
   */
  static async delete(id: string) {
    try {
      const deleted = await db('tasks')
        .where({ id })
        .delete();

      if (!deleted) {
        throw new Error('Task not found');
      }

      logger.info('Task deleted', { taskId: id });
      return { success: true, message: 'Task deleted' };
    } catch (error: any) {
      logger.error('Failed to delete task', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get tasks assigned to a user
   */
  static async getByAssignee(userId: string) {
    try {
      const tasks = await db('tasks')
        .select(
          'tasks.*',
          'assigner.name as assigned_by_name'
        )
        .leftJoin('users as assigner', 'tasks.assigned_by', 'assigner.id')
        .where('tasks.assigned_to', userId)
        .whereIn('tasks.status', ['PENDING', 'IN_PROGRESS'])
        .orderBy('tasks.priority', 'desc')
        .orderBy('tasks.due_date', 'asc');

      return tasks;
    } catch (error: any) {
      logger.error('Failed to fetch tasks by assignee', { error: error.message, userId });
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Get overdue tasks
   */
  static async getOverdue() {
    try {
      const now = new Date();
      const tasks = await db('tasks')
        .select(
          'tasks.*',
          'assigned_user.name as assigned_to_name',
          'assigned_user.email as assigned_to_email'
        )
        .leftJoin('users as assigned_user', 'tasks.assigned_to', 'assigned_user.id')
        .where('tasks.due_date', '<', now)
        .whereIn('tasks.status', ['PENDING', 'IN_PROGRESS'])
        .orderBy('tasks.due_date', 'asc');

      return tasks;
    } catch (error: any) {
      logger.error('Failed to fetch overdue tasks', { error: error.message });
      throw new Error('Failed to fetch overdue tasks');
    }
  }
}
