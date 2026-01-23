'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Question {
  _id: string;
  question: string;
  options: string[];
  conceptId?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  subject: {
    _id: string;
    name: string;
  };
  duration: number;
  questions: Question[];
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
}

interface StudentAttempt {
  _id?: string;
  assessmentId: string;
  studentId: string;
  answers: Array<{
    questionId: string;
    selectedOption: number;
  }>;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt?: string;
  engagement?: number;
}

interface AssessmentTakingInteractiveProps {
  assessmentId: string;
}

const AssessmentTakingInteractive = ({ assessmentId }: AssessmentTakingInteractiveProps) => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [attemptResult, setAttemptResult] = useState<StudentAttempt | null>(null);
  const [attemptExists, setAttemptExists] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    fetchAssessment();
    fetchMyAttempt();
  }, [assessmentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0 && !showResults && !attemptExists) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, showResults, attemptExists]);

  const fetchAssessment = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${assessmentId}?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-cache'
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        setTimeRemaining(data.assessment.duration * 60); // Convert minutes to seconds
        setStartTime(Date.now());
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
          console.error('Failed to fetch assessment:', response.status, errorData);
        } catch (e) {
          console.error('Failed to parse error response:', response.status, response.statusText);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Show specific error messages
        if (response.status === 304) {
          // Cache hit - try again with forced refresh
          console.log('Received 304, trying again with cache busting...');
          setTimeout(() => fetchAssessment(), 100);
          return;
        } else if (response.status === 404) {
          alert('Assessment not found. It may have been deleted.');
        } else if (response.status === 403) {
          alert(`Access denied: ${errorMessage}. Make sure you are enrolled in the class and the assessment is launched.`);
        } else {
          alert(`Failed to load assessment: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    }
  };

  const fetchMyAttempt = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${assessmentId}/attempt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data._id) {
          setAttemptExists(true);
          setAttemptResult(data);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attempt:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, selectedOption: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment || !user) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time spent in seconds

      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answersArray,
          timeSpent,
          engagement: 1.2 // Default engagement score
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAttemptResult(result.attempt);
        setShowResults(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Icon name="document-text" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Assessment not found</h3>
          <p className="text-muted-foreground">The assessment you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (attemptExists && showResults && attemptResult) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <Icon name="trophy" size={64} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Assessment Completed
            </h1>
            <p className="text-muted-foreground">
              {assessment.title}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {attemptResult.score}/{attemptResult.totalQuestions}
              </div>
              <p className="text-muted-foreground">Questions Correct</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round((attemptResult.score / attemptResult.totalQuestions) * 100)}%
              </div>
              <p className="text-muted-foreground">Score</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.floor(attemptResult.timeSpent / 60)}:{(attemptResult.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-muted-foreground">Time Spent</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.history.back()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors"
            >
              Back to Curriculum
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = assessment.questions.length;
  const isAnswered = answers[currentQuestion?._id] !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="text-muted-foreground">{assessment.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
            <div className="text-2xl font-mono font-bold text-primary">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{answeredQuestions}/{totalQuestions} answered</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-foreground text-lg leading-relaxed mb-6">
              {currentQuestion.question}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={answers[currentQuestion._id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion._id, index)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-foreground flex-1">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredQuestions !== totalQuestions}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Warning */}
      {answeredQuestions !== totalQuestions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="alert-triangle" size={20} className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Incomplete Assessment</h3>
              <p className="text-sm text-yellow-700">
                You have answered {answeredQuestions} out of {totalQuestions} questions.
                Please answer all questions before submitting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTakingInteractive;