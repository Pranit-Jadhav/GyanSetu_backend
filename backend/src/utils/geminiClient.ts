import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found. AI assessment generation will not work.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface GenerateAssessmentParams {
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  conceptName: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export class GeminiClient {
  /**
   * Generate MCQ questions using Gemini
   */
  static async generateAssessment(params: GenerateAssessmentParams): Promise<GeneratedQuestion[]> {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const { topic, difficulty, questionCount, conceptName } = params;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate ${questionCount} multiple-choice questions on the topic "${topic}" related to the concept "${conceptName}".

Difficulty level: ${difficulty}

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should test understanding, not just memorization
- For EASY: Focus on basic concepts and definitions
- For MEDIUM: Focus on application and analysis
- For HARD: Focus on synthesis and evaluation

Format your response as a JSON array. Each question should be an object with this exact structure:
{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}

Where correctAnswer is the index (0-3) of the correct option.

Return ONLY the JSON array, no other text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (handle markdown code blocks if present)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const questions = JSON.parse(jsonText) as GeneratedQuestion[];

      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid question format received from AI');
      }

      // Validate each question
      questions.forEach((q, idx) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${idx}`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correctAnswer at index ${idx}`);
        }
      });

      return questions.slice(0, questionCount); // Ensure we don't return more than requested
    } catch (error: any) {
      console.error('Gemini API error:', error.message);
      throw new Error(`Failed to generate assessment: ${error.message}`);
    }
  }
}
