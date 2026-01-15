import { Subject } from '../../models/Subject';
import { Module } from '../../models/Module';
import { Concept } from '../../models/Concept';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

export class CurriculumService {
  // Subjects
  async createSubject(name: string, code: string, description?: string) {
    const existing = await Subject.findOne({ code });
    if (existing) {
      throw new AppError('Subject with this code already exists', 400);
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      description
    });

    return subject;
  }

  async getSubject(subjectId: string) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }
    return subject;
  }

  async getAllSubjects() {
    return await Subject.find().sort({ name: 1 });
  }

  // Modules
  async createModule(name: string, code: string, subjectId: string, description?: string) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const existing = await Module.findOne({ subjectId: new mongoose.Types.ObjectId(subjectId), code });
    if (existing) {
      throw new AppError('Module with this code already exists in this subject', 400);
    }

    const module = await Module.create({
      name,
      code: code.toUpperCase(),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      description
    });

    return module;
  }

  async getModule(moduleId: string) {
    const module = await Module.findById(moduleId).populate('subjectId', 'name code');
    if (!module) {
      throw new AppError('Module not found', 404);
    }
    return module;
  }

  async getModulesBySubject(subjectId: string) {
    return await Module.find({ subjectId: new mongoose.Types.ObjectId(subjectId) }).sort({ name: 1 });
  }

  // Concepts
  async createConcept(
    name: string,
    code: string,
    moduleId: string,
    subjectId: string,
    description?: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
    prerequisites: string[] = []
  ) {
    const module = await Module.findById(moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    // Verify prerequisites exist
    if (prerequisites.length > 0) {
      const prereqConcepts = await Concept.find({ _id: { $in: prerequisites } });
      if (prereqConcepts.length !== prerequisites.length) {
        throw new AppError('Some prerequisites not found', 404);
      }
    }

    const existing = await Concept.findOne({ moduleId: new mongoose.Types.ObjectId(moduleId), code });
    if (existing) {
      throw new AppError('Concept with this code already exists in this module', 400);
    }

    const concept = await Concept.create({
      name,
      code: code.toUpperCase(),
      moduleId: new mongoose.Types.ObjectId(moduleId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      description,
      difficulty,
      prerequisites: prerequisites.map(id => new mongoose.Types.ObjectId(id))
    });

    return concept;
  }

  async getConcept(conceptId: string) {
    const concept = await Concept.findById(conceptId)
      .populate('moduleId', 'name code')
      .populate('subjectId', 'name code')
      .populate('prerequisites', 'name code');
    if (!concept) {
      throw new AppError('Concept not found', 404);
    }
    return concept;
  }

  async getConceptsByModule(moduleId: string) {
    return await Concept.find({ moduleId: new mongoose.Types.ObjectId(moduleId) })
      .populate('prerequisites', 'name code')
      .sort({ name: 1 });
  }

  async getFullCurriculum(subjectId: string) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const modules = await Module.find({ subjectId: new mongoose.Types.ObjectId(subjectId) }).sort({ name: 1 });
    
    const modulesWithConcepts = await Promise.all(
      modules.map(async (module) => {
        const concepts = await Concept.find({ moduleId: module._id }).sort({ name: 1 });
        return {
          ...module.toObject(),
          concepts
        };
      })
    );

    return {
      subject: subject.toObject(),
      modules: modulesWithConcepts
    };
  }
}
