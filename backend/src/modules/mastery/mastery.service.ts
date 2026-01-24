import axios from 'axios';
import { MasteryRecord } from '../../models/MasteryRecord';
import { Concept } from '../../models/Concept';
import { Module } from '../../models/Module';
import { Subject } from '../../models/Subject';
import mongoose from 'mongoose';

const MASTERY_ENGINE_URL = process.env.MASTERY_ENGINE_URL || 'http://localhost:8000';

interface AssessmentAttempt {
  conceptId: string;
  correct: boolean;
  engagement: number;
}

export class MasteryService {
  
  /**
   * Process a batch of assessment attempts and update student mastery.
   */
  static async processAssessmentAttempts(studentId: string, attempts: AssessmentAttempt[]) {
    // 1. Fetch existing state for involved concepts
    const conceptIds = attempts.map(a => a.conceptId);
    const existingRecords = await MasteryRecord.find({
      studentId,
      conceptId: { $in: conceptIds }
    });

    const currentStates: Record<string, any> = {};
    existingRecords.forEach(record => {
      currentStates[record.conceptId.toString()] = {
        concept_id: record.conceptId.toString(),
        probability: record.masteryScore / 100, // Convert 0-100 to 0-1
        confidence: record.confidence
      };
    });

    // 2. Prepare payload for Python Engine
    const payload = {
      student_id: studentId,
      current_states: currentStates,
      attempts: attempts.map(a => ({
        concept_id: a.conceptId,
        correct: a.correct,
        engagement: a.engagement
      }))
    };

    try {
      // 3. Call Python Engine
      const response = await axios.post(`${MASTERY_ENGINE_URL}/mastery/assess`, payload);
      const updates = response.data.updates;

      // 4. Update Database
      const updatePromises = updates.map(async (update: any) => {
        const masteryScore = Math.round(update.probability * 100);
        
        return MasteryRecord.findOneAndUpdate(
          { studentId, conceptId: update.concept_id },
          {
            $set: {
              masteryScore: masteryScore,
              confidence: update.confidence,
              status: update.status,
              lastUpdated: new Date()
            },
            $push: {
              assessmentHistory: {
                quizScore: masteryScore, // Using mastery as score proxy for history if needed, or we could store raw correctness
                addedMastery: 0, // Delta could be calculated
                explanation: update.explanation,
                timestamp: new Date()
              }
            }
          },
          { upsert: true, new: true }
        );
      });

      await Promise.all(updatePromises);
      return updates;

    } catch (error) {
      console.error('Mastery Engine Error:', error);
      throw new Error('Failed to update mastery');
    }
  }

  /**
   * Aggregate module mastery from concept masteries.
   */
  static async getModuleMastery(studentId: string, moduleId: string) {
    const concepts = await Concept.find({ moduleId });
    if (!concepts.length) return { mastery: 0, status: 'Not Ready' };

    const conceptIds = concepts.map(c => c._id);
    const masteryRecords = await MasteryRecord.find({
      studentId,
      conceptId: { $in: conceptIds }
    });

    if (!masteryRecords.length) return { mastery: 0, status: 'Not Ready' };

    // Simple average for now (can be weighted later)
    const totalScore = masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0);
    const avgScore = totalScore / concepts.length; // Divide by total concepts, not just started ones

    return {
      mastery: Math.round(avgScore),
      status: this.getLabel(avgScore)
    };
  }

  /**
   * Aggregate subject mastery from module masteries.
   */
  static async getSubjectMastery(studentId: string, subjectId: string) {
    const modules = await Module.find({ subjectId });
    if (!modules.length) return { subjectId, mastery: 0, status: 'Not Ready', modules: [] };

    let totalModuleMastery = 0;
    const moduleDetails = [];

    for (const mod of modules) {
      // Get concepts for this module to calculate mastery and return details
      const concepts = await Concept.find({ moduleId: mod._id });
      const conceptDetails = [];
      let moduleScoreSum = 0;
      
      if (concepts.length > 0) {
        const conceptIds = concepts.map(c => c._id);
        const masteryRecords = await MasteryRecord.find({
          studentId,
          conceptId: { $in: conceptIds }
        });
        
        const recordMap = new Map(masteryRecords.map(r => [r.conceptId.toString(), r]));
        
        for (const concept of concepts) {
          const record = recordMap.get(concept._id.toString());
          const score = record ? record.masteryScore : 0;
          const status = record ? record.status : 'Not Ready';
          
          moduleScoreSum += score;
          conceptDetails.push({
            conceptId: concept._id,
            name: concept.name,
            mastery: score,
            status: status
          });
        }
        
        const avgModuleScore = Math.round(moduleScoreSum / concepts.length);
        totalModuleMastery += avgModuleScore;
        
        moduleDetails.push({
          moduleId: mod._id,
          name: mod.name,
          mastery: avgModuleScore,
          status: this.getLabel(avgModuleScore),
          concepts: conceptDetails
        });
      } else {
        moduleDetails.push({
          moduleId: mod._id,
          name: mod.name,
          mastery: 0,
          status: 'Not Ready',
          concepts: []
        });
      }
    }

    const subjectMastery = Math.round(totalModuleMastery / modules.length);

    return {
      subjectId,
      mastery: subjectMastery,
      status: this.getLabel(subjectMastery),
      modules: moduleDetails
    };
  }

  private static getLabel(score: number): string {
    if (score < 40) return 'Not Ready';
    if (score < 60) return 'Developing';
    if (score < 80) return 'Proficient';
    return 'Mastered';
  }
  static async getStudentMastery(studentId: string) {
    const records = await MasteryRecord.find({ studentId }).populate('conceptId');
    if (!records.length) return { overallMastery: 0, concepts: [] };

    const totalMastery = records.reduce((sum, r) => sum + r.masteryScore, 0);
    const overallMastery = Math.round(totalMastery / records.length);

    return {
      studentId,
      overallMastery,
      status: this.getLabel(overallMastery),
      concepts: records.map(r => ({
        conceptId: r.conceptId._id,
        // @ts-ignore
        name: r.conceptId.name,
        mastery: r.masteryScore,
        confidence: r.confidence,
        status: r.status
      }))
    };
  }

  static async getConceptMastery(studentId: string, conceptId: string) {
    const record = await MasteryRecord.findOne({ studentId, conceptId }).populate('conceptId');
    if (!record) return { mastery: 0, status: 'Not Ready', confidence: 0 };

    return {
      conceptId,
      // @ts-ignore
      name: record.conceptId.name,
      mastery: record.masteryScore,
      confidence: record.confidence,
      status: record.status,
      history: record.assessmentHistory
    };
  }

  static async getPracticePlan(studentId: string, subjectId: string) {
    // Basic implementation: Find weak concepts in the subject
    // 1. Get all modules in subject
    const modules = await Module.find({ subjectId });
    const moduleIds = modules.map(m => m._id);
    
    // 2. Get concepts for these modules
    const concepts = await Concept.find({ moduleId: { $in: moduleIds } });
    const conceptIds = concepts.map(c => c._id);

    // 3. Find mastery records
    const records = await MasteryRecord.find({
      studentId,
      conceptId: { $in: conceptIds }
    }).populate('conceptId');

    // 4. Identify weak concepts (< 60% mastery)
    const weakConcepts = records
      .filter(r => r.masteryScore < 60)
      .map(r => ({
        // @ts-ignore
        concept: r.conceptId.name,
        conceptId: r.conceptId._id,
        mastery: r.masteryScore,
        priority: r.masteryScore < 40 ? 'High' : 'Medium'
      }));
      
    // 5. Add concepts with NO mastery record (not started)
    // Identify concept IDs that are not in records
    const startedConceptIds = new Set(records.map(r => r.conceptId._id.toString()));
    const notStarted = concepts.filter(c => !startedConceptIds.has(c._id.toString()));
    
    notStarted.forEach(c => {
       weakConcepts.push({
         concept: c.name,
         conceptId: c._id,
         mastery: 0,
         priority: 'High' // Unattempted concepts are high priority for learning? Or low? Assuming High for now as "New"
       });
    });

    return {
      studentId,
      subjectId,
      practiceFocus: weakConcepts.sort((a, b) => a.mastery - b.mastery) // Lowest mastery first
    };
  }

  static async getAtRiskStudents(threshold: number) {
     // Find students with average mastery below threshold
     // This is expensive to do on-the-fly, ideally pre-calculated or aggregated.
     // For now, simple aggregation
     const atRisk = await MasteryRecord.aggregate([
       {
         $group: {
           _id: '$studentId',
           avgMastery: { $avg: '$masteryScore' }
         }
       },
       {
         $match: {
           avgMastery: { $lt: threshold }
         }
       }
     ]);
     
     // Populate student details if needed (requires looking up User model, skipping for now)
     return atRisk;
  }
}
