import { MasteryRecord } from '../../models/MasteryRecord';
import { Concept } from '../../models/Concept';
import { Module } from '../../models/Module';
import { Subject } from '../../models/Subject';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/errorHandler';
import { pythonMasteryClient } from '../../utils/pythonClient';
import mongoose from 'mongoose';

interface UpdateMasteryInput {
  studentId: string;
  conceptId: string;
  correct: boolean;
  engagement?: number;
}

export class MasteryService {
  /**
   * Update mastery via Python BKT engine
   */
  async updateMastery(input: UpdateMasteryInput) {
    const { studentId, conceptId, correct, engagement = 1.0 } = input;

    // Validate student and concept exist
    const student = await User.findById(studentId);
    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Invalid student', 400);
    }

    const concept = await Concept.findById(conceptId).populate('moduleId');
    if (!concept) {
      throw new AppError('Concept not found', 404);
    }

    const conceptCode = concept.code;
    const module = concept.moduleId as any;
    const moduleCode = module.code;
    const subject = await Subject.findById(concept.subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }
    const subjectCode = subject.code;

    try {
      // Update mastery in Python backend
      await pythonMasteryClient.updateMastery(
        studentId,
        conceptCode, // Python backend uses codes, not IDs
        correct,
        engagement
      );

      // Store attempt in local DB for tracking
      const masteryScore = correct ? 75 : 25; // Initial estimate, Python will refine
      let record = await MasteryRecord.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        conceptId: new mongoose.Types.ObjectId(conceptId)
      });

      if (record) {
        record.lastUpdated = new Date();
        record.assessmentHistory.push({
          quizScore: masteryScore,
          timestamp: new Date()
        });
        await record.save();
      } else {
        record = await MasteryRecord.create({
          studentId: new mongoose.Types.ObjectId(studentId),
          conceptId: new mongoose.Types.ObjectId(conceptId),
          masteryScore,
          confidence: 0.3,
          assessmentHistory: [{
            quizScore: masteryScore,
            timestamp: new Date()
          }]
        });
      }

      return { status: 'updated' };
    } catch (error: any) {
      console.error('Mastery update error:', error);
      throw new AppError(`Failed to update mastery: ${error.message}`, 500);
    }
  }

  /**
   * Get concept mastery from Python backend
   */
  async getConceptMastery(studentId: string, conceptId: string) {
    const concept = await Concept.findById(conceptId);
    if (!concept) {
      throw new AppError('Concept not found', 404);
    }

    try {
      const result = await pythonMasteryClient.getConceptMastery(studentId, concept.code);
      
      // Update local record
      let record = await MasteryRecord.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        conceptId: new mongoose.Types.ObjectId(conceptId)
      });

      if (record) {
        record.masteryScore = result.masteryScore || result.probability * 100;
        record.lastUpdated = new Date();
        await record.save();
      }

      return result;
    } catch (error: any) {
      // Fallback to local record if Python is unavailable
      const record = await MasteryRecord.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        conceptId: new mongoose.Types.ObjectId(conceptId)
      });

      if (record) {
        return {
          concept: concept.name,
          masteryScore: record.masteryScore,
          probability: record.masteryScore / 100
        };
      }

      throw new AppError(`Failed to get concept mastery: ${error.message}`, 500);
    }
  }

  /**
   * Get module mastery from Python backend
   */
  async getModuleMastery(studentId: string, moduleId: string) {
    const module = await Module.findById(moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    try {
      const result = await pythonMasteryClient.getModuleMastery(studentId, module.code);
      return result;
    } catch (error: any) {
      throw new AppError(`Failed to get module mastery: ${error.message}`, 500);
    }
  }

  /**
   * Get subject mastery from Python backend
   */
  async getSubjectMastery(studentId: string, subjectId: string) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    try {
      const result = await pythonMasteryClient.getSubjectMastery(studentId, subject.code);
      return result;
    } catch (error: any) {
      throw new AppError(`Failed to get subject mastery: ${error.message}`, 500);
    }
  }

  /**
   * Get overall student mastery from Python backend
   */
  async getStudentMastery(studentId: string) {
    try {
      const result = await pythonMasteryClient.getStudentMastery(studentId);
      return result;
    } catch (error: any) {
      // Fallback to local records
      const records = await MasteryRecord.find({ studentId: new mongoose.Types.ObjectId(studentId) })
        .populate('conceptId', 'name');
      
      if (records.length === 0) {
        return {
          studentId,
          overallMastery: 0
        };
      }

      const avgMastery = records.reduce((sum, r) => sum + r.masteryScore, 0) / records.length;
      return {
        studentId,
        overallMastery: Math.round(avgMastery * 100) / 100
      };
    }
  }

  /**
   * Get adaptive practice plan from Python backend
   */
  async getPracticePlan(studentId: string, subjectId: string) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    try {
      const result = await pythonMasteryClient.getPracticePlan(studentId, subject.code);
      return result;
    } catch (error: any) {
      throw new AppError(`Failed to get practice plan: ${error.message}`, 500);
    }
  }

  /**
   * Get at-risk students (low mastery)
   */
  async getAtRiskStudents(threshold: number = 50) {
    const records = await MasteryRecord.find({
      masteryScore: { $lt: threshold }
    })
      .populate('studentId', 'email name')
      .populate('conceptId', 'name');
    
    const studentMap = new Map<string, any>();
    
    records.forEach((record) => {
      const student = record.studentId as any;
      const concept = record.conceptId as any;
      const studentId = student._id.toString();
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName: student.name || student.email,
          lowMasteryConcepts: []
        });
      }
      
      studentMap.get(studentId).lowMasteryConcepts.push({
        concept: concept.name,
        masteryScore: record.masteryScore
      });
    });
    
    return Array.from(studentMap.values());
  }
}
