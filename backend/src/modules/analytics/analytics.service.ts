import { Class } from '../../models/Class';
import { MasteryRecord } from '../../models/MasteryRecord';
import { EngagementLog } from '../../models/EngagementLog';
import { User } from '../../models/User';
import { Alert } from '../../models/Alert';
import { Attempt } from '../../models/Attempt';
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

    const children = parent.children as unknown as any[];
    if (!children || children.length === 0) {
      return { children: [] };
    }

    const child = children[0]; // Support first child for now
    const studentId = child._id;

    // 1. Mastery & Subjects
    const masteryRecords = await MasteryRecord.find({ studentId })
       .populate({
         path: 'conceptId',
         populate: { path: 'subjectId', select: 'name' }
       });
    
    // Group by Subject
    const subjectMasteryMap = new Map<string, { total: number; count: number; name: string }>();
    masteryRecords.forEach((r: any) => { 
       // Access subject via concept
       const subject = r.conceptId?.subjectId;
       const subId = subject?._id?.toString() || 'unknown';
       const subName = subject?.name || 'General';
       
       if (!subjectMasteryMap.has(subId)) {
          subjectMasteryMap.set(subId, { total: 0, count: 0, name: subName });
       }
       const entry = subjectMasteryMap.get(subId)!;
       entry.total += r.masteryScore;
       entry.count += 1;
    });

    const subjectMastery = Array.from(subjectMasteryMap.values()).map(s => ({
       subject: s.name,
       score: Math.round(s.total / s.count)
    }));

    // Weak Subjects (< 60%)
    const weakSubjects = subjectMastery.filter(s => s.score < 60).map(s => s.subject);

    const avgMastery = masteryRecords.length > 0
      ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
      : 0;

    // 2. Engagement
    const recentLogs = await EngagementLog.find({
      userId: studentId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).sort({ timestamp: 1 });
    
    const avgEngagement = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.engagementIndex, 0) / recentLogs.length
      : 0;

    const engagementHistory = recentLogs.map(l => ({
       date: l.timestamp.toISOString().split('T')[0],
       score: l.engagementIndex
    })); // Simplify for chart

    // 3. Attendance
    const attendanceRecords = await import('../../models/Attendance').then(m => m.Attendance.find({ studentId }).sort({ date: -1 })); // Dynamic import to avoid circular dependency if any, or just standard import at top
    
    // Calculate Attendance Stats
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // 4. Recent Assessments
    const recentAttempts = await Attempt.find({ studentId })
       .populate('assessmentId', 'title')
       .sort({ submittedAt: -1 })
       .limit(5);

    const assessmentSummary = recentAttempts.map((a: any) => ({
       id: a._id,
       title: a.assessmentId?.title || 'Unknown Assessment',
       score: a.score,
       maxScore: a.maxScore,
       percentage: a.percentage,
       date: a.submittedAt
    }));

    // 5. Risk Calculation
    // Simple logic: Risk if Mastery < 50 OR Attendance < 75%
    let riskStatus: 'At Risk' | 'Stable' | 'Improving' = 'Stable';
    if (avgMastery < 50 || attendanceRate < 75) riskStatus = 'At Risk';
    else if (avgMastery > 75 && avgEngagement > 0.8) riskStatus = 'Improving';

    // 6. Weekly Reports Generation (Aggregation)
    // Group attendance and assessments by week
    const weeklyData = new Map<string, any>();
    
    // Helper to get week start (Monday)
    const getWeekStart = (d: Date) => {
       const date = new Date(d);
       const day = date.getDay();
       const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
       const monday = new Date(date.setDate(diff));
       monday.setHours(0,0,0,0);
       return monday.toISOString().split('T')[0];
    };

    attendanceRecords.forEach(a => {
       const week = getWeekStart(a.date);
       if (!weeklyData.has(week)) weeklyData.set(week, { date: week, sessions: 0, attended: 0, assessmentAvg: 0, assessmentCount: 0 });
       const w = weeklyData.get(week);
       w.sessions++;
       if (a.status === 'PRESENT') w.attended++;
    });

    // Merge assessment data into weeks
    const allAttempts = await Attempt.find({ studentId });
    allAttempts.forEach(a => {
       if (!a.submittedAt) return;
       const week = getWeekStart(a.submittedAt);
       if (!weeklyData.has(week)) weeklyData.set(week, { date: week, sessions: 0, attended: 0, assessmentAvg: 0, assessmentCount: 0 });
       const w = weeklyData.get(week);
       w.assessmentAvg += a.percentage;
       w.assessmentCount++;
    });

    const weeklyReports = Array.from(weeklyData.values())
       .sort((a, b) => b.date.localeCompare(a.date))
       .map(w => ({
          weekStartDate: w.date,
          attendanceRate: w.sessions > 0 ? Math.round((w.attended / w.sessions) * 100) : 0,
          averageMastery: w.assessmentCount > 0 ? Math.round(w.assessmentAvg / w.assessmentCount) : 0,
          assessmentsTaken: w.assessmentCount,
          sessionsAttended: w.attended,
          totalSessions: w.sessions
       }));

    return {
      studentId: studentId.toString(),
      studentName: child.name || child.email,
      averageMastery: Math.round(avgMastery),
      averageEngagement: Math.round(avgEngagement * 100) / 100,
      engagementLevel: avgEngagement > 0.7 ? 'High' : avgEngagement > 0.4 ? 'Medium' : 'Low',
      masteryTrend: [65, 68, ...recentAttempts.map(a => a.percentage).reverse().slice(-4)], // Use real recent attempt scores as proxy for trend + static history
      startTrend: 65, // for visualisation
      
      subjectMastery,
      weakSubjects,
      attendanceRate,
      riskStatus,
      
      recentAssessments: assessmentSummary,
      attendanceHistory: attendanceRecords, // Full list for calendar
      weeklyReports
    };
  }
}
