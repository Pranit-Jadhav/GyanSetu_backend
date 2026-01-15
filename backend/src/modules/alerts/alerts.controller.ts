import { Request, Response, NextFunction } from 'express';
import { AlertsService } from './alerts.service';
import { AuthRequest } from '../../middlewares/auth';

export class AlertsController {
  private alertsService: AlertsService;

  constructor() {
    this.alertsService = new AlertsService();
  }

  getClassAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId } = req.params;
      const { resolved } = req.query;
      const alerts = await this.alertsService.getClassAlerts(
        classId,
        resolved === 'true'
      );
      res.json({ alerts });
    } catch (error) {
      next(error);
    }
  };

  resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resolvedBy = req.user!.userId;
      const result = await this.alertsService.resolveAlert(id, resolvedBy);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
