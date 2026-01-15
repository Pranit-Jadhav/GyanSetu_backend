import { Alert, AlertType, AlertSeverity } from '../../models/Alert';
import { EngagementLog } from '../../models/EngagementLog';
import { MasteryRecord } from '../../models/MasteryRecord';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

export class AlertsService {
  /**
   * Check for confusion patterns and create alerts
   */
  async checkAndCreateAlerts(classId: string) {
    // Check engagement drops
    const recentLogs = await EngagementLog.find({
      classId: new mongoose.Types.ObjectId(classId),
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
    });

    const lowEngagementStudents = recentLogs.filter(
      log => log.engagementIndex < 0.5
    );

    if (lowEngagementStudents.length > 0) {
      for (const log of lowEngagementStudents) {
        await Alert.create({
          classId: new mongoose.Types.ObjectId(classId),
          studentId: log.studentId,
          type: AlertType.ENGAGEMENT_DROP,
          severity: log.engagementIndex < 0.3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          message: `Student engagement dropped to ${(log.engagementIndex * 100).toFixed(0)}%`,
          resolved: false
        });
      }
    }

    // Check mastery threshold
    const lowMastery = await MasteryRecord.find({
      masteryScore: { $lt: 50 }
    }).populate('studentId');

    const classStudents = await this.getClassStudentIds(classId);
    const atRiskInClass = lowMastery.filter(
      record => classStudents.includes(record.studentId.toString())
    );

    if (atRiskInClass.length > 0) {
      for (const record of atRiskInClass) {
        await Alert.create({
          classId: new mongoose.Types.ObjectId(classId),
          studentId: record.studentId,
          conceptId: record.conceptId,
          type: AlertType.MASTERY_THRESHOLD,
          severity: record.masteryScore < 30 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          message: `Student mastery below threshold: ${record.masteryScore}%`,
          resolved: false
        });
      }
    }
  }

  async getClassAlerts(classId: string, includeResolved: boolean = false) {
    const query: any = {
      classId: new mongoose.Types.ObjectId(classId)
    };

    if (!includeResolved) {
      query.resolved = false;
    }

    const alerts = await Alert.find(query)
      .populate('studentId', 'email name')
      .populate('conceptId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return alerts.map((alert) => {
      const student = alert.studentId as any;
      const concept = alert.conceptId as any;
      return {
        id: alert._id.toString(),
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        student: student ? {
          id: student._id.toString(),
          name: student.name || student.email
        } : null,
        concept: concept ? concept.name : null,
        resolved: alert.resolved,
        createdAt: alert.createdAt
      };
    });
  }

  async resolveAlert(alertId: string, resolvedBy: string) {
    const alert = await Alert.findById(alertId);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = new mongoose.Types.ObjectId(resolvedBy);
    await alert.save();

    return {
      message: 'Alert resolved',
      alertId: alert._id.toString()
    };
  }

  private async getClassStudentIds(classId: string): Promise<string[]> {
    const { Class } = await import('../../models/Class');
    const classData = await Class.findById(classId);
    return classData?.students.map(id => id.toString()) || [];
  }
}
