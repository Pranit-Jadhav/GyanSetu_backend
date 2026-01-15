import { ContentTemplate, TemplateType } from '../../models/ContentTemplate';
import { User } from '../../models/User';
import { Class } from '../../models/Class';
import { MasteryRecord } from '../../models/MasteryRecord';
import { Attempt } from '../../models/Attempt';
import { EngagementLog } from '../../models/EngagementLog';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

interface CreateTemplateInput {
  type: TemplateType;
  title: string;
  description?: string;
  subjectId?: string;
  structure: Record<string, any>;
  createdBy: string;
  isPublic?: boolean;
}

export class AdminService {
  // Content Templates
  async createTemplate(input: CreateTemplateInput) {
    const { type, title, description, subjectId, structure, createdBy, isPublic } = input;

    const user = await User.findById(createdBy);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      throw new AppError('Unauthorized', 403);
    }

    const template = await ContentTemplate.create({
      type,
      title,
      description,
      subjectId: subjectId ? new mongoose.Types.ObjectId(subjectId) : undefined,
      structure,
      createdBy: new mongoose.Types.ObjectId(createdBy),
      isPublic: isPublic || false
    });

    return template;
  }

  async getTemplates(filters?: { type?: TemplateType; subjectId?: string; isPublic?: boolean }) {
    const query: any = {};
    
    if (filters?.type) {
      query.type = filters.type;
    }
    
    if (filters?.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    
    if (filters?.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    return await ContentTemplate.find(query)
      .populate('subjectId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async getTemplate(templateId: string) {
    const template = await ContentTemplate.findById(templateId)
      .populate('subjectId', 'name code')
      .populate('createdBy', 'name email');
    
    if (!template) {
      throw new AppError('Template not found', 404);
    }
    
    return template;
  }

  // Admin Dashboard Metrics
  async getDashboardMetrics() {
    // Mastery Rate: Average subject mastery across all classrooms
    const allMasteryRecords = await MasteryRecord.find();
    const masteryRate = allMasteryRecords.length > 0
      ? allMasteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / allMasteryRecords.length
      : 0;

    // Teacher Adoption Rate: (# teachers actively using system) / (total teachers)
    const totalTeachers = await User.countDocuments({ role: 'TEACHER' });
    const activeTeachers = await Class.distinct('teacherId').then(ids => ids.length);
    const teacherAdoptionRate = totalTeachers > 0 ? activeTeachers / totalTeachers : 0;

    // Average Engagement: from engagement logs
    const engagementLogs = await EngagementLog.find();
    const avgEngagement = engagementLogs.length > 0
      ? engagementLogs.reduce((sum, log) => sum + (log.engagementIndex || 0), 0) / engagementLogs.length
      : 0;

    // Assessment Usage Rate: (# assessments created) / (# classes)
    const totalClasses = await Class.countDocuments();
    const totalAssessments = await Attempt.distinct('assessmentId').then(ids => ids.length);
    const assessmentUsageRate = totalClasses > 0 ? Math.min(totalAssessments / totalClasses, 1) : 0;

    // Administrative Confidence Score
    // Formula: 0.4 × avg engagement + 0.4 × avg mastery + 0.2 × assessment usage rate
    const normalizedMastery = masteryRate / 100; // Normalize to 0-1
    const confidenceScore = (0.4 * avgEngagement) + (0.4 * normalizedMastery) + (0.2 * assessmentUsageRate);

    // Additional stats
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalConcepts = await MasteryRecord.distinct('conceptId').then(ids => ids.length);
    
    // Engagement distribution
    const lowEngagement = await EngagementLog.countDocuments({ engagementIndex: { $lt: 0.5 } });
    const mediumEngagement = await EngagementLog.countDocuments({ engagementIndex: { $gte: 0.5, $lt: 0.75 } });
    const highEngagement = await EngagementLog.countDocuments({ engagementIndex: { $gte: 0.75 } });

    return {
      masteryRate: Math.round(masteryRate * 100) / 100,
      teacherAdoptionRate: Math.round(teacherAdoptionRate * 100) / 100,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      averageEngagement: Math.round(avgEngagement * 100) / 100,
      statistics: {
        totalTeachers,
        activeTeachers,
        totalStudents,
        totalClasses,
        totalConcepts,
        totalAssessments
      },
      engagementDistribution: {
        low: lowEngagement,
        medium: mediumEngagement,
        high: highEngagement
      }
    };
  }
}
