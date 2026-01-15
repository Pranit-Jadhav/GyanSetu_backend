import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AuthRequest } from '../../middlewares/auth';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  createTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdBy = req.user!.userId;
      const template = await this.adminService.createTemplate({
        ...req.body,
        createdBy
      });
      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  };

  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, subjectId, isPublic } = req.query;
      const templates = await this.adminService.getTemplates({
        type: type as any,
        subjectId: subjectId as string,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined
      });
      res.json({ templates });
    } catch (error) {
      next(error);
    }
  };

  getTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.adminService.getTemplate(id);
      res.json(template);
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.adminService.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };
}
