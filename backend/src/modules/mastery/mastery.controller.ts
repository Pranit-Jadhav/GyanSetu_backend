import { Request, Response, NextFunction } from 'express';
import { MasteryService } from './mastery.service';

export class MasteryController {
  private masteryService: MasteryService;

  constructor() {
    this.masteryService = new MasteryService();
  }

  getStudentMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const mastery = await this.masteryService.getStudentMastery(studentId);
      res.json(mastery);
    } catch (error) {
      next(error);
    }
  };

  getConceptMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, conceptId } = req.params;
      const result = await this.masteryService.getConceptMastery(studentId, conceptId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getModuleMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, moduleId } = req.params;
      const result = await this.masteryService.getModuleMastery(studentId, moduleId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSubjectMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, subjectId } = req.params;
      const result = await this.masteryService.getSubjectMastery(studentId, subjectId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getPracticePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, subjectId } = req.params;
      const result = await this.masteryService.getPracticePlan(studentId, subjectId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, conceptId, correct, engagement } = req.body;
      const result = await this.masteryService.updateMastery({
        studentId,
        conceptId,
        correct: Boolean(correct),
        engagement: engagement ? Number(engagement) : 1.0
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getAtRiskStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { threshold } = req.query;
      const thresholdNum = threshold ? parseFloat(threshold as string) : 50;
      const students = await this.masteryService.getAtRiskStudents(thresholdNum);
      res.json({ students });
    } catch (error) {
      next(error);
    }
  };
}
