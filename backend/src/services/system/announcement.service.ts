import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetRoles?: string[];
  expiresAt?: Date;
}

interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetRoles?: string[];
  isActive?: boolean;
  expiresAt?: Date;
}

export class AnnouncementService {
  /**
   * Create a new announcement
   */
  static async create(input: CreateAnnouncementInput, createdBy: string) {
    try {
      const [announcement] = await db('announcements')
        .insert({
          title: input.title,
          content: input.content,
          priority: input.priority || 'NORMAL',
          created_by: createdBy,
          target_roles: input.targetRoles ? JSON.stringify(input.targetRoles) : null,
          expires_at: input.expiresAt || null,
          is_active: true,
        })
        .returning('*');

      logger.info('Announcement created', { announcementId: announcement.id, createdBy });
      return announcement;
    } catch (error: any) {
      logger.error('Failed to create announcement', { error: error.message });
      throw new Error('Failed to create announcement');
    }
  }

  /**
   * Get all announcements (optionally filter by active)
   */
  static async getAll(activeOnly: boolean = false) {
    try {
      let query = db('announcements')
        .select(
          'announcements.*',
          'users.name as created_by_name',
          'users.email as created_by_email'
        )
        .leftJoin('users', 'announcements.created_by', 'users.id')
        .orderBy('announcements.created_at', 'desc');

      if (activeOnly) {
        query = query.where('announcements.is_active', true)
          .andWhere(function() {
            this.whereNull('announcements.expires_at')
              .orWhere('announcements.expires_at', '>', new Date());
          });
      }

      const announcements = await query;
      return announcements;
    } catch (error: any) {
      logger.error('Failed to fetch announcements', { error: error.message });
      throw new Error('Failed to fetch announcements');
    }
  }

  /**
   * Get single announcement by ID
   */
  static async getById(id: string) {
    try {
      const announcement = await db('announcements')
        .select(
          'announcements.*',
          'users.name as created_by_name'
        )
        .leftJoin('users', 'announcements.created_by', 'users.id')
        .where('announcements.id', id)
        .first();

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      return announcement;
    } catch (error: any) {
      logger.error('Failed to fetch announcement', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get announcements for specific role
   */
  static async getByRole(role: string) {
    try {
      const announcements = await db('announcements')
        .select('*')
        .where('is_active', true)
        .andWhere(function() {
          this.whereNull('expires_at')
            .orWhere('expires_at', '>', new Date());
        })
        .andWhere(function() {
          this.whereNull('target_roles')
            .orWhereRaw('target_roles @> ?', JSON.stringify([role]));
        })
        .orderBy('priority', 'desc')
        .orderBy('created_at', 'desc');

      return announcements;
    } catch (error: any) {
      logger.error('Failed to fetch announcements by role', { error: error.message, role });
      throw new Error('Failed to fetch announcements');
    }
  }

  /**
   * Update announcement
   */
  static async update(id: string, input: UpdateAnnouncementInput) {
    try {
      const updateData: any = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;
      if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt;
      if (input.targetRoles !== undefined) {
        updateData.target_roles = JSON.stringify(input.targetRoles);
      }

      updateData.updated_at = new Date();

      const [updated] = await db('announcements')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!updated) {
        throw new Error('Announcement not found');
      }

      logger.info('Announcement updated', { announcementId: id });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update announcement', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete announcement
   */
  static async delete(id: string) {
    try {
      const deleted = await db('announcements')
        .where({ id })
        .delete();

      if (!deleted) {
        throw new Error('Announcement not found');
      }

      logger.info('Announcement deleted', { announcementId: id });
      return { success: true, message: 'Announcement deleted' };
    } catch (error: any) {
      logger.error('Failed to delete announcement', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Mark announcement as inactive (soft delete)
   */
  static async deactivate(id: string) {
    try {
      const [updated] = await db('announcements')
        .where({ id })
        .update({ is_active: false, updated_at: new Date() })
        .returning('*');

      if (!updated) {
        throw new Error('Announcement not found');
      }

      logger.info('Announcement deactivated', { announcementId: id });
      return updated;
    } catch (error: any) {
      logger.error('Failed to deactivate announcement', { error: error.message, id });
      throw error;
    }
  }
}
