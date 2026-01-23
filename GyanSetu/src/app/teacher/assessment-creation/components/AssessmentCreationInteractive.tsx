'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Classroom {
  _id: string;
  name: string;
  course: string;
  academicYear: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  conceptId?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Concept {
  _id: string;
  name: string;
  code: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const AssessmentCreationInteractive = () => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);

  // Manual assessment form
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    classroomId: '',
    duration: 30, // minutes
    questions: [] as Question[]
  });

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    conceptId: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD'
  });

  // AI assessment form
  const [aiForm, setAiForm] = useState({
    topic: '',
    subjectId: '',
    classroomId: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    questionCount: 10,
    duration: 30
  });

  useEffect(() => {
    setIsHydrated(true);
    fetchSubjects();
    fetchClassrooms();
  }, []);

  // Fetch concepts when subject changes
  useEffect(() => {
    if (manualForm.subjectId) {
      fetchConcepts(manualForm.subjectId);
    } else {
      setConcepts([]);
    }
  }, [manualForm.subjectId]);

  const fetchSubjects = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchClassrooms = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    }
  };

  const fetchConcepts = async (subjectId: string) => {
    if (!token || !subjectId) {
      setConcepts([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/concepts/subject/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConcepts(data.concepts || []);
      }
    } catch (error) {
      console.error('Failed to fetch concepts:', error);
      setConcepts([]);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() ||
        !currentQuestion.option1.trim() ||
        !currentQuestion.option2.trim() ||
        !currentQuestion.option3.trim() ||
        !currentQuestion.option4.trim()) {
      alert('Please fill in all question fields');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      options: [
        currentQuestion.option1,
        currentQuestion.option2,
        currentQuestion.option3,
        currentQuestion.option4
      ],
      correctAnswer: currentQuestion.correctAnswer,
      conceptId: currentQuestion.conceptId || undefined,
      difficulty: currentQuestion.difficulty
    };

    setManualForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      conceptId: '',
      difficulty: 'MEDIUM'
    });
  };

  const removeQuestion = (questionId: string) => {
    setManualForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const createManualAssessment = async () => {
    if (!manualForm.title || !manualForm.subjectId || !manualForm.classroomId || manualForm.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question');
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        title: manualForm.title,
        description: manualForm.description,
        subjectId: manualForm.subjectId,
        classroomId: manualForm.classroomId,
        duration: manualForm.duration,
        questions: manualForm.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          conceptId: q.conceptId || undefined,
          difficulty: q.difficulty
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Assessment created successfully!');
        // Reset form
        setManualForm({
          title: '',
          description: '',
          subjectId: '',
          classroomId: '',
          duration: 30,
          questions: []
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create assessment');
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAIAssessment = async () => {
    if (!aiForm.topic || !aiForm.subjectId || !aiForm.classroomId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aiForm)
      });

      if (response.ok) {
        const result = await response.json();
        alert('AI assessment generated successfully!');
        // Reset form
        setAiForm({
          topic: '',
          subjectId: '',
          classroomId: '',
          difficulty: 'MEDIUM',
          questionCount: 10,
          duration: 30
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to generate AI assessment');
      }
    } catch (error) {
      console.error('Failed to generate AI assessment:', error);
      alert('Failed to generate AI assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          Assessment Creation
        </h1>
        <p className="text-muted-foreground">
          Create assessments for your students using manual creation or AI assistance.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Manual Creation
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'ai'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Generation
        </button>
      </div>

      {/* Manual Assessment Creation */}
      {activeTab === 'manual' && (
        <div className="space-y-8">
          {/* Assessment Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Assessment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Arrays and Basic Operations"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={manualForm.duration}
                  onChange={(e) => setManualForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  min="5"
                  max="180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                <select
                  value={manualForm.subjectId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Classroom</label>
                <select
                  value={manualForm.classroomId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, classroomId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Select a classroom</option>
                  {classrooms.map(classroom => (
                    <option key={classroom._id} value={classroom._id}>
                      {classroom.name} ({classroom.course})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={3}
                placeholder="Brief description of the assessment"
              />
            </div>
          </div>

          {/* Add Question */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Enter your question here"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Option A</label>
                  <input
                    type="text"
                    value={currentQuestion.option1}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option1: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Option A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Option B</label>
                  <input
                    type="text"
                    value={currentQuestion.option2}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option2: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Option B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Option C</label>
                  <input
                    type="text"
                    value={currentQuestion.option3}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option3: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Option C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Option D</label>
                  <input
                    type="text"
                    value={currentQuestion.option4}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option4: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Option D"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Correct Answer</label>
                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                  <select
                    value={currentQuestion.difficulty}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Concept (Optional)</label>
                  <select
                    value={currentQuestion.conceptId}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, conceptId: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    disabled={concepts.length === 0}
                  >
                    <option value="">
                      {concepts.length === 0 ? 'Select subject first' : 'No concept mapping'}
                    </option>
                    {concepts.map((concept) => (
                      <option key={concept._id} value={concept._id}>
                        {concept.name} ({concept.code}) - {concept.difficulty}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Map question to a specific concept for better mastery tracking
                  </p>
                </div>
              </div>
              <button
                onClick={addQuestion}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Questions ({manualForm.questions.length})
            </h2>
            {manualForm.questions.length === 0 ? (
              <p className="text-muted-foreground">No questions added yet.</p>
            ) : (
              <div className="space-y-4">
                {manualForm.questions.map((question, index) => (
                  <div key={question.id} className="bg-muted/50 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground">Q{index + 1}: {question.question}</h3>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`p-2 rounded ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-background'
                        }`}>
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {optionIndex === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Difficulty: {question.difficulty}
                      {question.conceptId && (
                        <span className="ml-2">
                          • Concept: {concepts.find(c => c._id === question.conceptId)?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Assessment Button */}
          <div className="flex justify-end">
            <button
              onClick={createManualAssessment}
              disabled={loading || manualForm.questions.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Assessment'}
              <Icon name="check" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI Assessment Generation */}
      {activeTab === 'ai' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">AI Assessment Generation</h2>
            <p className="text-muted-foreground mb-6">
              Let AI generate MCQ questions based on your topic. Questions will be automatically mapped to relevant concepts.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Topic</label>
                <input
                  type="text"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Binary Search Algorithm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                  <select
                    value={aiForm.subjectId}
                    onChange={(e) => setAiForm(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Classroom</label>
                  <select
                    value={aiForm.classroomId}
                    onChange={(e) => setAiForm(prev => ({ ...prev, classroomId: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select a classroom</option>
                    {classrooms.map(classroom => (
                      <option key={classroom._id} value={classroom._id}>
                        {classroom.name} ({classroom.course})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Number of Questions</label>
                  <input
                    type="number"
                    value={aiForm.questionCount}
                    onChange={(e) => setAiForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    min="5"
                    max="50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={aiForm.duration}
                  onChange={(e) => setAiForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  min="5"
                  max="180"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
                <div className="flex items-start">
                  <Icon name="alert-triangle" size={20} className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">AI Generation Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      AI-generated questions will be reviewed by you before the assessment is launched.
                      The AI will attempt to map questions to relevant concepts in your curriculum.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={generateAIAssessment}
                disabled={loading || !aiForm.topic || !aiForm.subjectId || !aiForm.classroomId}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Generating...' : 'Generate AI Assessment'}
                <Icon name="sparkles" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentCreationInteractive;