import { Assessment, AssessmentType, AssessmentStatus } from '../../models/Assessment';
import { Attempt } from '../../models/Attempt';
import { Concept } from '../../models/Concept';
import { Class } from '../../models/Class';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/errorHandler';
import { GeminiClient } from '../../utils/geminiClient';
import { MasteryService } from '../mastery/mastery.service';
import mongoose from 'mongoose';

interface CreateManualAssessmentInput {
  title: string;
  description?: string;
  classId: string;
  subjectId: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    conceptId: string;
    points?: number;
  }>;
  dueDate?: Date;
  createdBy: string;
}

interface GenerateAIAssessmentInput {
  title: string;
  description?: string;
  classId: string;
  subjectId: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  conceptId: string;
  dueDate?: Date;
  createdBy: string;
}

interface SubmitAssessmentInput {
  assessmentId: string;
  studentId: string;
  answers: Array<{
    questionId: string;
    selectedOption: number;
  }>;
  timeSpent: number;
  engagement: number;
}

export class AssessmentService {
  private masteryService: MasteryService;

  constructor() {
    this.masteryService = new MasteryService();
  }

  async createManualAssessment(input: CreateManualAssessmentInput) {
    const { title, description, classId, subjectId, questions, dueDate, createdBy } = input;

    // Validate class and subject
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    // Validate concepts
    for (const q of questions) {
      const concept = await Concept.findById(q.conceptId);
      if (!concept) {
        throw new AppError(`Concept ${q.conceptId} not found`, 404);
      }
    }

    const assessment = await Assessment.create({
      title,
      description,
      type: AssessmentType.MANUAL,
      status: AssessmentStatus.DRAFT,
      classId: new mongoose.Types.ObjectId(classId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        conceptId: new mongoose.Types.ObjectId(q.conceptId),
        points: q.points || 1
      })),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      dueDate
    });

    return assessment;
  }

  async generateAIAssessment(input: GenerateAIAssessmentInput) {
    const { title, description, classId, subjectId, topic, difficulty, questionCount, conceptId, dueDate, createdBy } = input;

    // Validate class and concept
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    const concept = await Concept.findById(conceptId);
    if (!concept) {
      throw new AppError('Concept not found', 404);
    }

    // Generate questions using Gemini
    const generatedQuestions = await GeminiClient.generateAssessment({
      topic,
      difficulty,
      questionCount,
      conceptName: concept.name
    });

    const assessment = await Assessment.create({
      title,
      description,
      type: AssessmentType.AI_GENERATED,
      status: AssessmentStatus.DRAFT,
      classId: new mongoose.Types.ObjectId(classId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      questions: generatedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        conceptId: new mongoose.Types.ObjectId(conceptId),
        points: 1
      })),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      dueDate
    });

    return assessment;
  }

  async launchAssessment(assessmentId: string, teacherId: string) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    if (assessment.createdBy.toString() !== teacherId) {
      throw new AppError('Unauthorized', 403);
    }

    if (assessment.status !== AssessmentStatus.DRAFT) {
      throw new AppError('Assessment already launched', 400);
    }

    assessment.status = AssessmentStatus.LAUNCHED;
    assessment.launchedAt = new Date();
    await assessment.save();

    return assessment;
  }

  async submitAssessment(input: SubmitAssessmentInput) {
    const { assessmentId, studentId, answers, timeSpent, engagement } = input;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    if (assessment.status !== AssessmentStatus.LAUNCHED) {
      throw new AppError('Assessment is not available', 400);
    }

    // Check if already submitted
    const existingAttempt = await Attempt.findOne({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    });

    if (existingAttempt) {
      throw new AppError('Assessment already submitted', 400);
    }

    // Calculate score
    let score = 0;
    const maxScore = assessment.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const answerMap = new Map(answers.map(a => [a.questionId, a.selectedOption]));

    const detailedAnswers = assessment.questions.map((question, idx) => {
      const selectedOption = answerMap.get(question._id.toString()) ?? -1;
      const isCorrect = selectedOption === question.correctAnswer;
      
      if (isCorrect) {
        score += question.points || 1;
      }

      // Update mastery for each question answered
      this.masteryService.updateMastery({
        studentId,
        conceptId: question.conceptId.toString(),
        correct: isCorrect,
        engagement: Math.max(0.5, Math.min(2.0, engagement))
      }).catch(err => console.error('Mastery update error:', err));

      return {
        questionId: question._id,
        selectedOption,
        isCorrect
      };
    });

    const percentage = (score / maxScore) * 100;

    const attempt = await Attempt.create({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId),
      answers: detailedAnswers,
      score,
      maxScore,
      percentage,
      timeSpent,
      engagement: Math.max(0.5, Math.min(2.0, engagement)),
      submittedAt: new Date()
    });

    return attempt;
  }

  async getAssessment(assessmentId: string, userId: string, userRole: string) {
    const assessment = await Assessment.findById(assessmentId)
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .populate('createdBy', 'name email');

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    // Students can only see launched assessments
    if (userRole === 'STUDENT' && assessment.status !== AssessmentStatus.LAUNCHED) {
      throw new AppError('Assessment not available', 403);
    }

    // If student, check if they're in the class
    if (userRole === 'STUDENT') {
      const classData = await Class.findById(assessment.classId);
      const studentObjectId = new mongoose.Types.ObjectId(userId);
      if (!classData?.students.includes(studentObjectId)) {
        throw new AppError('Not enrolled in this class', 403);
      }
    }

    return assessment;
  }

  async getAssessmentResults(assessmentId: string, teacherId: string) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    if (assessment.createdBy.toString() !== teacherId) {
      throw new AppError('Unauthorized', 403);
    }

    const attempts = await Attempt.find({ assessmentId: new mongoose.Types.ObjectId(assessmentId) })
      .populate('studentId', 'name email');

    return {
      assessment: {
        id: assessment._id,
        title: assessment.title,
        status: assessment.status
      },
      results: attempts.map(attempt => ({
        studentId: (attempt.studentId as any)._id.toString(),
        studentName: (attempt.studentId as any).name || (attempt.studentId as any).email,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt
      })),
      statistics: {
        totalSubmissions: attempts.length,
        averageScore: attempts.length > 0 
          ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length 
          : 0,
        averageTimeSpent: attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length
          : 0
      }
    };
  }

  async getStudentAttempt(assessmentId: string, studentId: string) {
    const attempt = await Attempt.findOne({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      studentId: new mongoose.Types.ObjectId(studentId)
    })
      .populate('assessmentId');

    return attempt;
  }
}
