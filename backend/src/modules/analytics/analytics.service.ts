import { Class } from '../../models/Class';
import { MasteryRecord } from '../../models/MasteryRecord';
import { EngagementLog } from '../../models/EngagementLog';
import { User } from '../../models/User';
import { Alert } from '../../models/Alert';
import mongoose from 'mongoose';

export class AnalyticsService {
  async getTeacherDashboard(teacherId: string) {
    // Get teacher's classes
    const classes = await Class.find({
      teacherId: new mongoose.Types.ObjectId(teacherId)
    });

    const classIds = classes.map(c => c._id);

    // Get mastery rate
    const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
    const masteryRecords = await MasteryRecord.find({
      studentId: { $in: classes.flatMap(c => c.students) }
    });
    const avgMastery = masteryRecords.length > 0
      ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
      : 0;

    // Get engagement trend
    const recentLogs = await EngagementLog.find({
      classId: { $in: classIds },
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    const avgEngagement = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.engagementIndex, 0) / recentLogs.length
      : 0;

    // Get at-risk students
    const atRiskRecords = await MasteryRecord.find({
      studentId: { $in: classes.flatMap(c => c.students) },
      masteryScore: { $lt: 50 }
    }).populate('studentId', 'email name');
    const atRiskStudents = atRiskRecords.map((r: any) => ({
      studentId: r.studentId._id.toString(),
      studentName: r.studentId.name || r.studentId.email,
      masteryScore: r.masteryScore
    }));

    // Get active alerts
    const activeAlerts = await Alert.countDocuments({
      classId: { $in: classIds },
      resolved: false
    });

    return {
      teacherId,
      totalClasses: classes.length,
      totalStudents,
      averageMastery: Math.round(avgMastery),
      averageEngagement: Math.round(avgEngagement * 100) / 100,
      atRiskStudents: atRiskStudents.length,
      atRiskStudentsList: atRiskStudents.slice(0, 10),
      activeAlerts,
      classes: classes.map(c => ({
        id: c._id.toString(),
        className: c.className,
        subject: c.subject,
        studentCount: c.students.length
      }))
    };
  }

  async getAdminDashboard() {
    // Get total users
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalTeachers = await User.countDocuments({ role: 'TEACHER' });

    // Get total classes
    const totalClasses = await Class.countDocuments();

    // Get mastery rate
    const masteryRecords = await MasteryRecord.find();
    const avgMastery = masteryRecords.length > 0
      ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
      : 0;

    // Get engagement trend
    const recentLogs = await EngagementLog.find({
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const avgEngagement = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.engagementIndex, 0) / recentLogs.length
      : 0;

    // Get teacher adoption (teachers with at least one class)
    const teachersWithClasses = await Class.distinct('teacherId');
    const teacherAdoption = totalTeachers > 0
      ? (teachersWithClasses.length / totalTeachers) * 100
      : 0;

    // Get at-risk students
    const atRiskCount = await MasteryRecord.countDocuments({
      masteryScore: { $lt: 50 }
    });

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses,
      averageMastery: Math.round(avgMastery),
      averageEngagement: Math.round(avgEngagement * 100) / 100,
      teacherAdoption: Math.round(teacherAdoption),
      atRiskStudents: atRiskCount
    };
  }

  async getParentDashboard(parentId: string) {
    const parent = await User.findById(parentId).populate('children');
    if (!parent) throw new Error('Parent not found');

    // For "one parent one child" requirement, we take the first child or return empty if none
    const children = parent.children as unknown as any[]; // casting for populated field
    if (!children || children.length === 0) {
      return {
        children: []
      };
    }

    // Process the first child (or map all if we wanted to support multiple later)
    const child = children[0];
    const studentId = child._id;

    // Get Mastery
    const masteryRecords = await MasteryRecord.find({ studentId });
    const avgMastery = masteryRecords.length > 0
      ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
      : 0;

    // Get Engagement
    const recentLogs = await EngagementLog.find({
      userId: studentId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const avgEngagement = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.engagementIndex, 0) / recentLogs.length
      : 0;

    // Get Recent Activity (from logs or attempts)
    // Simplified: Just returning mastery/engagement stats for the dashboard overview
    
    return {
      studentId: studentId.toString(),
      studentName: child.name || child.email,
      averageMastery: Math.round(avgMastery),
      averageEngagement: Math.round(avgEngagement * 100) / 100,
      masteryTrend: [65, 68, 70, 72, 75, avgMastery], // Mock trend for now
      completionRate: 85, // Mock completion rate
      recentAlerts: [] // Mock alerts
    };
  }
}
