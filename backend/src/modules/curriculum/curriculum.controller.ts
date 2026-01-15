import { Request, Response, NextFunction } from 'express';
import { CurriculumService } from './curriculum.service';

export class CurriculumController {
  private curriculumService: CurriculumService;

  constructor() {
    this.curriculumService = new CurriculumService();
  }

  // Subject endpoints
  createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, code, description } = req.body;
      const subject = await this.curriculumService.createSubject(name, code, description);
      res.status(201).json(subject);
    } catch (error) {
      next(error);
    }
  };

  getSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const subject = await this.curriculumService.getSubject(id);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  };

  getAllSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjects = await this.curriculumService.getAllSubjects();
      res.json({ subjects });
    } catch (error) {
      next(error);
    }
  };

  // Module endpoints
  createModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, code, subjectId, description } = req.body;
      const module = await this.curriculumService.createModule(name, code, subjectId, description);
      res.status(201).json(module);
    } catch (error) {
      next(error);
    }
  };

  getModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const module = await this.curriculumService.getModule(id);
      res.json(module);
    } catch (error) {
      next(error);
    }
  };

  getModulesBySubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subjectId } = req.params;
      const modules = await this.curriculumService.getModulesBySubject(subjectId);
      res.json({ modules });
    } catch (error) {
      next(error);
    }
  };

  // Concept endpoints
  createConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, code, moduleId, subjectId, description, difficulty, prerequisites } = req.body;
      const concept = await this.curriculumService.createConcept(
        name,
        code,
        moduleId,
        subjectId,
        description,
        difficulty,
        prerequisites || []
      );
      res.status(201).json(concept);
    } catch (error) {
      next(error);
    }
  };

  getConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const concept = await this.curriculumService.getConcept(id);
      res.json(concept);
    } catch (error) {
      next(error);
    }
  };

  getConceptsByModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const concepts = await this.curriculumService.getConceptsByModule(moduleId);
      res.json({ concepts });
    } catch (error) {
      next(error);
    }
  };

  getFullCurriculum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subjectId } = req.params;
      const curriculum = await this.curriculumService.getFullCurriculum(subjectId);
      res.json(curriculum);
    } catch (error) {
      next(error);
    }
  };
}
