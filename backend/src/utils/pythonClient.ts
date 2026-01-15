import axios, { AxiosInstance } from 'axios';

const PYTHON_MASTERY_API_URL = process.env.PYTHON_MASTERY_API_URL || 'http://localhost:8000';

class PythonMasteryClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: PYTHON_MASTERY_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Update concept mastery after assessment attempt
   */
  async updateMastery(studentId: string, conceptId: string, correct: boolean, engagement: number = 1.0) {
    try {
      const response = await this.client.post('/mastery/update', {
        student_id: studentId,
        concept_id: conceptId,
        correct,
        engagement
      });
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to update mastery: ${error.message}`);
    }
  }

  /**
   * Get concept mastery for a student
   */
  async getConceptMastery(studentId: string, conceptId: string) {
    try {
      const response = await this.client.get(`/mastery/concept/${studentId}/${conceptId}`);
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to get concept mastery: ${error.message}`);
    }
  }

  /**
   * Get module mastery for a student
   */
  async getModuleMastery(studentId: string, moduleId: string) {
    try {
      const response = await this.client.get(`/mastery/module/${studentId}/${moduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to get module mastery: ${error.message}`);
    }
  }

  /**
   * Get subject mastery for a student
   */
  async getSubjectMastery(studentId: string, subjectId: string) {
    try {
      const response = await this.client.get(`/mastery/subject/${studentId}/${subjectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to get subject mastery: ${error.message}`);
    }
  }

  /**
   * Get overall student mastery
   */
  async getStudentMastery(studentId: string) {
    try {
      const response = await this.client.get(`/mastery/student/${studentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to get student mastery: ${error.message}`);
    }
  }

  /**
   * Get adaptive practice plan for a student
   */
  async getPracticePlan(studentId: string, subjectId: string) {
    try {
      const response = await this.client.get(`/mastery/practice/${studentId}/${subjectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Python mastery API error:', error.message);
      throw new Error(`Failed to get practice plan: ${error.message}`);
    }
  }
}

export const pythonMasteryClient = new PythonMasteryClient();
