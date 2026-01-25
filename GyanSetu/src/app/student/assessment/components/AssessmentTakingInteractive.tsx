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
  // Secure Mode State
  const [secureModeActive, setSecureModeActive] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [attemptExists, setAttemptExists] = useState(false); // Added for attempt check

  // ... (keep existing useEffects)

  useEffect(() => {
    setIsHydrated(true);
    if (token && assessmentId) {
       fetchAssessment();
       fetchMyAttempt();
    }
  }, [assessmentId, token]); // Added token dependency

  // Timer useEffect (assuming this is an existing useEffect)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (secureModeActive && timeRemaining > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && secureModeActive && !showResults) {
      handleSubmit(); // Auto-submit when time runs out
    }
    return () => clearInterval(timer);
  }, [secureModeActive, timeRemaining, showResults]);

  // Secure Mode Listeners
  useEffect(() => {
     if (!secureModeActive) return;

     const handleKeydown = (e: KeyboardEvent) => {
        // Block restricted keys: Alt, Tab, Esc, F11, Meta (Windows/Cmd)
        if (
           e.key === 'Escape' || 
           e.key === 'Tab' || 
           e.altKey || 
           e.metaKey || 
           e.key === 'F11'
        ) {
           e.preventDefault();
           handleViolation('Restricted Key Pressed');
        }
     };

     const handleVisibilityChange = () => {
        if (document.hidden) {
           handleViolation('Tab Switch Detected');
        }
     };

     const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
           handleViolation('Exited Full Screen Mode');
        }
     };

     document.addEventListener('keydown', handleKeydown);
     document.addEventListener('visibilitychange', handleVisibilityChange);
     document.addEventListener('fullscreenchange', handleFullscreenChange);

     // Initial Fullscreen Request (handled in start button, but valid here too)
     
     return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
     };
  }, [secureModeActive, warnings]); // Depend on warnings to update count logic in violation

  const fetchAssessment = async () => {
    if (!token) return;
    setLoading(true); // Use loading state
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
        const duration = data.assessment.duration || 30;
        setTimeRemaining(duration * 60); 
        setStartTime(Date.now());
      } else {
        // Handle errors...
        let errorMessage = 'Unknown error';
        try {
           const errorData = await response.json();
           errorMessage = errorData.message;
        } catch(e) {}
        console.error('Fetch error:', response.status, errorMessage);
        
        if (response.status === 404) alert('Assessment not found');
        else alert('Failed to load assessment');
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttempt = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${assessmentId}/attempt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data._id) {
          setAttemptExists(true);
          setAttemptResult({
             ...data,
             totalQuestions: assessment?.questions?.length || 0 // Inject fallback
          });
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attempt:', error);
    }
  };

  const startSecureMode = async () => {
     try {
        await document.documentElement.requestFullscreen();
        setSecureModeActive(true);
     } catch (err) {
        alert('Full screen mode is required for this assessment. Please allow full screen permissions.');
     }
  };

  const handleViolation = (reason: string) => {
     // Prevent multiple rapid-fire violations
     if (submitting) return;

     const newWarnings = warnings + 1;
     setWarnings(newWarnings);
     
     // Warning Logic
     if (newWarnings < 3) {
        setWarningMessage(`Warning ${newWarnings}/3: ${reason}. Please stay in the secure environment.`);
     } else {
        setWarningMessage(`Violation 3/3: ${reason}. Assessment is being auto-submitted.`);
        // Force Submit logic - ensure it handles async correctly
        // We set warning message first so user sees it during any slight delay
        
        // Disable secure mode immediately to prevent further triggering
        setSecureModeActive(false); 
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        
        handleSubmit();
     }
  };

  const handleSubmit = async () => {
    if (!assessment || !user) return;

    setSubmitting(true);
    try {
      // Exit fullscreen immediately on submit intent to avoid violation loops
      if (document.fullscreenElement) {
         try { await document.exitFullscreen(); } catch(e) {}
      }
      setSecureModeActive(false);

      const durationMinutes = assessment.duration || 30; // Default fallback
      const currentRemaining = typeof timeRemaining === 'number' ? timeRemaining : durationMinutes * 60;
      const timeSpent = Math.max(0, Math.floor(durationMinutes * 60 - currentRemaining));

      // Construct answers array (only includes what user selected)
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
          engagement: 1.2
        })
      });

      if (response.ok) {
        const attempt = await response.json(); // Backend returns the attempt object directly
        // Inject totalQuestions manually since backend might not return it directly/uses maxScore
        setAttemptResult({
           ...attempt,
           totalQuestions: assessment.questions.length 
        });
        setAttemptExists(true);
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min((assessment?.questions.length || 1) - 1, prev + 1));
  };

  const totalQuestions = assessment?.questions.length || 0;
  const currentQuestion = assessment?.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;

  // ... (existing helper functions)

  // Modified Render
  // 1. Loading/Error states (keep same)
  if (!isHydrated || loading) {
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
          <button onClick={fetchAssessment} className="mt-4 text-primary hover:underline">Retry</button>
        </div>
      </div>
    );
  }
  if ((attemptExists || showResults) && attemptResult) {
      // Return Result View (keep same)
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
                {/* Prevent NaN if totalQuestions 0 */}
                {attemptResult.totalQuestions > 0 
                  ? Math.round((attemptResult.score / attemptResult.totalQuestions) * 100) 
                  : 0}%
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

           <div className="text-center mt-8">
             <button onClick={() => window.history.back()} className="bg-primary text-primary-foreground px-6 py-2 rounded">Back</button>
           </div>
        </div>
      </div>
      );
  }

  // 2. Secure Mode Intro Screen
  if (!secureModeActive) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
           <div className="bg-card border border-border max-w-md w-full p-8 rounded-xl shadow-lg text-center space-y-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                 <Icon name="lock-closed" size={32} />
              </div>
              <h1 className="text-2xl font-bold">{assessment.title}</h1>
              <div className="text-left space-y-3 bg-muted/50 p-4 rounded-lg text-sm">
                 <p className="font-semibold text-foreground">Secure Mode Requirements:</p>
                 <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Full Screen Only</li>
                    <li>No Tab Switching Allowed</li>
                    <li>Restricted Keys (Alt, Tab, Esc) Disabled</li>
                    <li><strong>3 Warnings = Auto-Fail/Submit</strong></li>
                 </ul>
              </div>
              <button 
                onClick={startSecureMode}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold text-lg transition-transform hover:scale-[1.02]"
              >
                 Start Assessment
              </button>
           </div>
        </div>
     );
  }

  // 3. Main Assessment UI (Secure)
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 relative">
       {/* Violation Modal */}
       {warningMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-card border-2 border-error text-card-foreground p-8 rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex flex-col items-center text-center gap-6">
                   <Icon name="exclamation-triangle" size={48} className="text-error animate-pulse" />
                   <h3 className="text-2xl font-bold text-error">Security Violation</h3>
                   <p className="font-medium text-lg border-2 border-dashed border-error/50 p-4 rounded bg-error/5">
                      {warningMessage}
                   </p>
                   {process.env.NODE_ENV === 'development' && <p className="text-xs text-muted-foreground">Dev Note: Fullscreen change might trigger easily in dev mode.</p>}
                   
                   {warnings < 3 && (
                      <button 
                        onClick={() => {
                           setWarningMessage(null);
                           // Re-enter fullscreen if kicked out
                           document.documentElement.requestFullscreen().catch((err) => {
                              console.error('Failed to re-enter fullscreen:', err);
                              alert('Please manually enable full screen to continue.');
                           }); 
                        }}
                        className="bg-error hover:bg-error/90 text-error-foreground px-8 py-3 rounded-lg font-bold w-full transition-colors"
                      >
                        I Understand & Resume
                      </button>
                   )}
                </div>
             </div>
          </div>
       )}

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              {assessment.title} <span className="text-sm font-normal text-success bg-success/10 px-2 py-0.5 rounded ml-2 border border-success/20">Secure Mode Active</span>
            </h1>
            {assessment.description && (
              <p className="text-muted-foreground">{assessment.description}</p>
            )}
          </div>
          <div className="text-right">
             <div className="flex items-center gap-2 mb-1 justify-end">
                <Icon name="clock" size={16} className="text-primary" />
                <span className="text-sm text-muted-foreground">Time Remaining</span>
             </div>
            <div className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-error animate-pulse' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Warnings: {warnings}/3</div>
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
        <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-start gap-3">
               <span className="bg-muted text-muted-foreground w-8 h-8 flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">{currentQuestionIndex + 1}</span>
               {currentQuestion.question}
            </h2>

            <div className="space-y-3 pl-11">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all group ${answers[currentQuestion._id] === index ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary)_/_1)]' : 'border-border hover:bg-muted/50 hover:border-primary/50'}`}>
                  <div className="relative flex items-center justify-center w-5 h-5">
                     <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={index}
                        checked={answers[currentQuestion._id] === index}
                        onChange={() => handleAnswerSelect(currentQuestion._id, index)}
                        className="peer appearance-none w-5 h-5 border-2 border-muted-foreground rounded-full checked:border-primary checked:bg-primary transition-colors cursor-pointer"
                     />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                     </div>
                  </div>
                  <span className={`flex-1 ${answers[currentQuestion._id] === index ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-border mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <Icon name="arrow-left" size={16} />
              Previous
            </button>

            <div className="flex gap-2">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors shadow-sm"
                >
                  Next
                  <Icon name="arrow-right" size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredQuestions !== totalQuestions}
                  className="flex items-center gap-2 px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Final Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Warning */}
      {answeredQuestions !== totalQuestions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-center text-center">
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                {totalQuestions - answeredQuestions} questions remaining
              </p>
            </div>
        </div>
      )}
    </div>
  );
};
export default AssessmentTakingInteractive;