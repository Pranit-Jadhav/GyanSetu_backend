import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from './assessment.service';
import { AuthRequest } from '../../middlewares/auth';

export class AssessmentController {
  private assessmentService: AssessmentService;

  constructor() {
    this.assessmentService = new AssessmentService();
  }

  createManual = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdBy = req.user!.userId;
      const assessment = await this.assessmentService.createManualAssessment({
        ...req.body,
        createdBy
      });
      res.status(201).json(assessment);
    } catch (error) {
      next(error);
    }
  };

  generateAI = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdBy = req.user!.userId;
      const assessment = await this.assessmentService.generateAIAssessment({
        ...req.body,
        createdBy
      });
      res.status(201).json(assessment);
    } catch (error) {
      next(error);
    }
  };

  launch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const teacherId = req.user!.userId;
      const assessment = await this.assessmentService.launchAssessment(id, teacherId);
      res.json(assessment);
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;
      const attempt = await this.assessmentService.submitAssessment({
        assessmentId: id,
        studentId,
        ...req.body
      });
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  };

  getAssessment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const assessment = await this.assessmentService.getAssessment(id, userId, userRole);
      res.json(assessment);
    } catch (error) {
      next(error);
    }
  };

  getResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const teacherId = req.user!.userId;
      const results = await this.assessmentService.getAssessmentResults(id, teacherId);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };

  getMyAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;
      const attempt = await this.assessmentService.getStudentAttempt(id, studentId);
      res.json(attempt || {});
    } catch (error) {
      next(error);
    }
  };
}
