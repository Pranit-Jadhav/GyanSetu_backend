import { EngagementLog } from '../../models/EngagementLog';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

interface LogEngagementInput {
  studentId: string;
  classId: string;
  idleTime: number;
  interactions: number;
  pollParticipation: number;
  tabFocus: number;
}

export class EngagementService {
  /**
   * Calculate engagement index (0-1) based on various signals
   */
  private calculateEngagementIndex(
    idleTime: number,
    interactions: number,
    pollParticipation: number,
    tabFocus: number
  ): number {
    // Normalize inputs
    const maxIdleTime = 300; // 5 minutes
    const maxInteractions = 50;
    
    const idleScore = Math.max(0, 1 - (idleTime / maxIdleTime));
    const interactionScore = Math.min(1, interactions / maxInteractions);
    const pollScore = pollParticipation > 0 ? 1 : 0.5;
    const focusScore = tabFocus / 100;

    // Weighted average
    const engagementIndex = (
      idleScore * 0.3 +
      interactionScore * 0.3 +
      pollScore * 0.2 +
      focusScore * 0.2
    );

    return Math.max(0, Math.min(1, engagementIndex));
  }

  async logEngagement(input: LogEngagementInput) {
    const { studentId, classId, idleTime, interactions, pollParticipation, tabFocus } = input;

    const engagementIndex = this.calculateEngagementIndex(
      idleTime,
      interactions,
      pollParticipation,
      tabFocus
    );

    const log = await EngagementLog.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      classId: new mongoose.Types.ObjectId(classId),
      idleTime,
      interactions,
      pollParticipation,
      tabFocus,
      engagementIndex,
      timestamp: new Date()
    });

    return {
      engagementIndex,
      logId: log._id.toString()
    };
  }

  async getClassEngagement(classId: string) {
    const logs = await EngagementLog.find({
      classId: new mongoose.Types.ObjectId(classId)
    })
      .populate('studentId', 'email name')
      .sort({ timestamp: -1 })
      .limit(100);

    const engagement = logs.map((log) => {
      const student = log.studentId as any;
      return {
        studentId: student._id.toString(),
        studentName: student.name || student.email,
        engagementIndex: log.engagementIndex,
        idleTime: log.idleTime,
        interactions: log.interactions,
        timestamp: log.timestamp
      };
    });

    // Calculate average engagement
    const avgEngagement = engagement.length > 0
      ? engagement.reduce((sum, e) => sum + e.engagementIndex, 0) / engagement.length
      : 0;

    return {
      classId,
      averageEngagement: avgEngagement,
      engagement
    };
  }

  async getStudentEngagement(studentId: string) {
    const logs = await EngagementLog.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    })
      .populate('classId', 'className subject')
      .sort({ timestamp: -1 })
      .limit(50);

    const engagement = logs.map((log) => {
      const classData = log.classId as any;
      return {
        classId: classData._id.toString(),
        className: classData.className,
        engagementIndex: log.engagementIndex,
        idleTime: log.idleTime,
        interactions: log.interactions,
        timestamp: log.timestamp
      };
    });

    // Calculate average engagement
    const avgEngagement = engagement.length > 0
      ? engagement.reduce((sum, e) => sum + e.engagementIndex, 0) / engagement.length
      : 0;

    return {
      studentId,
      averageEngagement: avgEngagement,
      engagement
    };
  }
}
