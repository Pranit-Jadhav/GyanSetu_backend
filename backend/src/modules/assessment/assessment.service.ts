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
  classroomId: string;
  subjectId: string;
  duration?: number;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    conceptId?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  }>;
  createdBy: string;
}

interface GenerateAIAssessmentInput {
  topic: string;
  subjectId: string;
  classroomId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  duration?: number;
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
  constructor() {
    
  }

  async createManualAssessment(input: CreateManualAssessmentInput) {
    const { title, description, classroomId, subjectId, duration, questions, createdBy } = input;

    // Validate classroom and subject
    const classroom = await Class.findById(classroomId);
    if (!classroom) {
      throw new AppError('Classroom not found', 404);
    }

    // Validate concepts (optional since conceptId is now optional)
    for (const q of questions) {
      if (q.conceptId) {
        const concept = await Concept.findById(q.conceptId);
        if (!concept) {
          throw new AppError(`Concept ${q.conceptId} not found`, 404);
        }
      }
    }

    const assessment = await Assessment.create({
      title,
      description,
      type: AssessmentType.MANUAL,
      status: AssessmentStatus.DRAFT,
      classId: new mongoose.Types.ObjectId(classroomId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      duration: duration || 30,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        conceptId: q.conceptId ? new mongoose.Types.ObjectId(q.conceptId) : undefined,
        difficulty: q.difficulty || 'MEDIUM',
        points: 1
      })),
      createdBy: new mongoose.Types.ObjectId(createdBy)
    });

    return assessment;
  }

  async generateAIAssessment(input: GenerateAIAssessmentInput) {
    const { topic, subjectId, classroomId, difficulty, questionCount, duration, createdBy } = input;

    // Validate classroom
    const classroom = await Class.findById(classroomId);
    if (!classroom) {
      throw new AppError('Classroom not found', 404);
    }

    // Find concepts in the subject that might be related to the topic
    const concepts = await Concept.find({ subjectId: new mongoose.Types.ObjectId(subjectId) });

    // Generate questions using Gemini
    const generatedQuestions = await GeminiClient.generateAssessment({
      topic,
      difficulty,
      questionCount,
      subjectConcepts: concepts.map(c => c.name)
    });

    // Create title from topic
    const title = `${topic} Assessment`;

    // Create a map of concept names to IDs for mapping
    const conceptMap = new Map();
    concepts.forEach(c => conceptMap.set(c.name.toLowerCase(), c._id));

    const assessment = await Assessment.create({
      title,
      description: `AI-generated assessment on ${topic}`,
      type: AssessmentType.AI_GENERATED,
      status: AssessmentStatus.DRAFT,
      classId: new mongoose.Types.ObjectId(classroomId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      duration: duration || 30,
      questions: generatedQuestions.map(q => {
        // Try to map concept name to concept ID
        let conceptId = undefined;
        if (q.conceptId) {
          conceptId = conceptMap.get(q.conceptId.toLowerCase());
        }
        return {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          conceptId: conceptId,
          difficulty: difficulty,
          points: 1
        };
      }),
      createdBy: new mongoose.Types.ObjectId(createdBy)
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

      return {
        questionId: question._id,
        selectedOption,
        isCorrect
      };
    });

    // Prepare attempts for batch processing
    const attempts = detailedAnswers
      .filter(a => a.isCorrect !== undefined && answerMap.has(a.questionId.toString()))
      .map((answer, idx) => {
         const question = assessment.questions.find(q => q._id.toString() === answer.questionId.toString());
         if (!question || !question.conceptId) return null;
         
         return {
           conceptId: question.conceptId.toString(),
           correct: answer.isCorrect,
           engagement: Math.max(0.5, Math.min(2.0, engagement))
         };
      })
      .filter(a => a !== null) as Array<{conceptId: string, correct: boolean, engagement: number}>;

    // Batch update mastery
    if (attempts.length > 0) {
      MasteryService.processAssessmentAttempts(studentId, attempts)
        .catch(err => console.error('Mastery batch update error:', err));
    }

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
      .populate('createdBy', 'name email')
      .populate('questions.conceptId', 'name code');

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    // Students can only see launched assessments
    if (userRole === 'STUDENT' && assessment.status !== AssessmentStatus.LAUNCHED) {
      throw new AppError('Assessment not available', 403);
    }

    // If student, check if they're in the class
    if (userRole === 'STUDENT') {
      const classId = assessment.classId._id || assessment.classId;
      const classData = await Class.findById(classId);
      const studentObjectId = new mongoose.Types.ObjectId(userId);
      if (!classData?.students.some(s => s.equals(studentObjectId))) {
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

  async getTeacherAssessments(teacherId: string) {
    const assessments = await Assessment.find({
      createdBy: new mongoose.Types.ObjectId(teacherId)
    })
      .populate('classId', 'name course academicYear')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    return assessments.map(assessment => ({
      _id: assessment._id.toString(),
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      status: assessment.status,
      classroom: assessment.classId,
      subject: assessment.subjectId,
      questionCount: assessment.questions?.length || 0,
      duration: assessment.duration || 30,
      launchedAt: assessment.launchedAt,
      createdAt: assessment.createdAt
    }));
  }

  async getAssessmentsByClassroom(classroomId: string, studentId: string) {
    const assessments = await Assessment.find({
      classId: new mongoose.Types.ObjectId(classroomId),
      status: AssessmentStatus.LAUNCHED
    })
      .populate('subjectId', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Get attempt information for each assessment
    const assessmentsWithAttempts = await Promise.all(
      assessments.map(async (assessment) => {
        const attempt = await Attempt.findOne({
          assessmentId: assessment._id,
          studentId: new mongoose.Types.ObjectId(studentId)
        });

        return {
          _id: assessment._id.toString(),
          title: assessment.title,
          description: assessment.description,
          subject: assessment.subjectId,
          status: assessment.status,
          type: assessment.type,
          duration: assessment.duration || 30,
          questionCount: assessment.questions?.length || 0,
          isAttempted: !!attempt,
          score: attempt?.percentage
        };
      })
    );

    return assessmentsWithAttempts;
  }
}
