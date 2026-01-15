import { Request, Response, NextFunction } from 'express';
import { EngagementService } from './engagement.service';

export class EngagementController {
  private engagementService: EngagementService;

  constructor() {
    this.engagementService = new EngagementService();
  }

  logEngagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, classId, idleTime, interactions, pollParticipation, tabFocus } = req.body;
      const result = await this.engagementService.logEngagement({
        studentId,
        classId,
        idleTime,
        interactions,
        pollParticipation,
        tabFocus
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getClassEngagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId } = req.params;
      const engagement = await this.engagementService.getClassEngagement(classId);
      res.json(engagement);
    } catch (error) {
      next(error);
    }
  };

  getStudentEngagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const engagement = await this.engagementService.getStudentEngagement(studentId);
      res.json(engagement);
    } catch (error) {
      next(error);
    }
  };
}
