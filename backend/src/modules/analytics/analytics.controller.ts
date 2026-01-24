import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthRequest } from '../../middlewares/auth';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getTeacherDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teacherId = req.user!.userId;
      const dashboard = await this.analyticsService.getTeacherDashboard(teacherId);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };

  getAdminDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dashboard = await this.analyticsService.getAdminDashboard();
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };
  getParentDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = req.user!.userId;
      const dashboard = await this.analyticsService.getParentDashboard(parentId);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };
}
