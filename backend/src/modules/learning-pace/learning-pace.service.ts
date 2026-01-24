import { MasterySnapshot } from '../../models/MasterySnapshot';
import mongoose from 'mongoose';

interface VelocityResult {
  studentId: string;
  velocity: number | null; // null if insufficient data
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  category: 'Fast Progressing' | 'Steady Progressing' | 'Plateaued' | 'Struggling' | 'Unknown';
  explanation: string;
}

export class LearningPaceService {
  /**
   * Record a snapshot of the current mastery.
   * Should be called whenever mastery is updated.
   */
  async recordSnapshot(studentId: string, levelType: 'concept' | 'module' | 'subject', levelId: string, masteryScore: number, timestamp: Date = new Date()) {
    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    await MasterySnapshot.create({
      snapshotId,
      studentId: new mongoose.Types.ObjectId(studentId),
      levelType,
      levelId,
      masteryScore,
      timestamp
    });
  }

  /**
   * Compute velocity for a student over the last N days (default 14).
   * Velocity = (Current Mastery - Mastery N days ago) / Days
   */
  async getStudentVelocity(studentId: string, levelId: string, days: number = 14): Promise<VelocityResult> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Fetch snapshots in range
    const snapshots = await MasterySnapshot.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      levelId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    if (snapshots.length < 2) {
      return {
        studentId,
        velocity: null,
        trend: 'insufficient_data',
        category: 'Unknown',
        explanation: 'Not enough data points to calculate velocity.'
      };
    }

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    const timeDelta = (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 3600 * 24); // in days
    // Avoid division by zero for very rapid updates
    const effectiveTimeDelta = Math.max(timeDelta, 0.1);

    const masteryDelta = last.masteryScore - first.masteryScore;
    const velocity = masteryDelta / effectiveTimeDelta;

    // Determine Classification
    // Velocity is points per day.
    // > 2.0 = Fast (e.g. 28 points in 14 days)
    // 0.5 - 2.0 = Steady
    // -0.5 - 0.5 = Plateaued
    // < -0.5 = Struggling (Retrograde)
    
    let category: VelocityResult['category'] = 'Steady Progressing';
    if (velocity > 1.5) category = 'Fast Progressing';
    else if (velocity >= 0.2) category = 'Steady Progressing';
    else if (velocity > -0.5) category = 'Plateaued';
    else category = 'Struggling';

    const trend = velocity > 0 ? 'improving' : velocity < 0 ? 'declining' : 'stable';

    return {
      studentId,
      velocity: parseFloat(velocity.toFixed(2)),
      trend,
      category,
      explanation: `Mastery changed by ${masteryDelta.toFixed(1)} over ${effectiveTimeDelta.toFixed(1)} days.`
    };
  }

  /**
   * Get class-wide learning pace overview.
   */
  async getClassPaceOverviewByIds(studentIds: string[], levelId: string = 'global_subject') {
    const results = {
      fast_progressing: [] as string[],
      steady: [] as string[],
      plateaued: [] as string[],
      struggling: [] as string[],
      unknown: [] as string[]
    };

    for (const sId of studentIds) {
      const vel = await this.getStudentVelocity(sId, levelId);
      
      if (vel.category === 'Fast Progressing') results.fast_progressing.push(sId);
      else if (vel.category === 'Steady Progressing') results.steady.push(sId);
      else if (vel.category === 'Plateaued') results.plateaued.push(sId);
      else if (vel.category === 'Struggling') results.struggling.push(sId);
      else results.unknown.push(sId);
    }
    
    return results;
  }

  /**
   * Identify At-Risk students based on:
   * 1. Low Mastery (< 40%)
   * 2. Negative Velocity (Regressing)
   * 3. Consistent Plateau (< 0.1 velocity) at low mastery
   */
  async getAtRiskStudents(studentIds: string[], levelId: string) {
    const atRiskList = [];

    for (const sId of studentIds) {
      const velocityData = await this.getStudentVelocity(sId, levelId);
      
      const latestSnapshot = await MasterySnapshot.findOne(
        { studentId: new mongoose.Types.ObjectId(sId), levelId }
      ).sort({ timestamp: -1 });

      const currentScore = latestSnapshot?.masteryScore || 0;
      const reasons: string[] = [];

      if (currentScore < 40) {
        reasons.push(`Low Mastery (${currentScore}%)`);
      }

      if (velocityData.velocity !== null && velocityData.velocity < 0) {
        reasons.push(`Negative Learning Velocity (${velocityData.velocity})`);
      }

      if (reasons.length > 0) {
        atRiskList.push({
          studentId: sId,
          reasons,
          severity: reasons.length > 1 ? 'High' : 'Medium',
          velocity: velocityData
        });
      }
    }

    return atRiskList;
  }
}
