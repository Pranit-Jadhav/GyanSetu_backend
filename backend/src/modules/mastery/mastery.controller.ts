import { Request, Response, NextFunction } from 'express';
import { MasteryService } from './mastery.service';

export class MasteryController {
  
  getStudentMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const mastery = await MasteryService.getStudentMastery(studentId);
      res.json(mastery);
    } catch (error) {
      next(error);
    }
  };

  getConceptMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, conceptId } = req.params;
      const result = await MasteryService.getConceptMastery(studentId, conceptId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getModuleMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, moduleId } = req.params;
      const result = await MasteryService.getModuleMastery(studentId, moduleId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSubjectMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, subjectId } = req.params;
      const result = await MasteryService.getSubjectMastery(studentId, subjectId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  submitAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, attempts } = req.body;
      // attempts: [{ conceptId, correct, engagement }]
      const result = await MasteryService.processAssessmentAttempts(studentId, attempts);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getPracticePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     try {
       const { studentId, subjectId } = req.params;
       // Placeholder - can be improved to call Python engine or use local logic
       const result = await MasteryService.getPracticePlan(studentId, subjectId);
       res.json(result);
     } catch (error) {
       next(error);
     }
  };

  getAtRiskStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { threshold } = req.query;
      const thresholdNum = threshold ? parseFloat(threshold as string) : 50;
      const students = await MasteryService.getAtRiskStudents(thresholdNum);
      res.json({ students });
    } catch (error) {
      next(error);
    }
  };
}
