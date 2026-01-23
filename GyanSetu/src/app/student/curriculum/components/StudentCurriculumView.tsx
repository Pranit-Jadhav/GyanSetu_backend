'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Subject {
  _id: string;
  name: string;
  code: string;
  modules: Module[];
}

interface Module {
  _id: string;
  name: string;
  code: string;
  concepts: Concept[];
}

interface Concept {
  _id: string;
  name: string;
  code: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description?: string;
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  type: 'MANUAL' | 'AI_GENERATED';
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
  duration: number;
  questionCount: number;
  isAttempted: boolean;
  score?: number;
  classroomName?: string;
  classroomId?: string;
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
}

interface MasteryData {
  concept: string;
  masteryScore: number;
  probability: number;
}

interface StudentCurriculumViewProps {
  subjectId: string;
  classroomId?: string | null;
}

const StudentCurriculumView = ({ subjectId, classroomId }: StudentCurriculumViewProps) => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [masteryData, setMasteryData] = useState<Map<string, MasteryData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'assessments'>('curriculum');

  useEffect(() => {
    setIsHydrated(true);
    fetchSubjectCurriculum();
    fetchAssessments();
    fetchMasteryData();
  }, [subjectId, classroomId]);

  const fetchSubjectCurriculum = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/subjects/${subjectId}/full`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubject(data.subject);
      } else if (response.status === 404) {
        // Subject not found
        setSubject(null);
      }
    } catch (error) {
      console.error('Failed to fetch subject curriculum:', error);
    }
  };

  const fetchAssessments = async () => {
    if (!token || !user) return;
    try {
      // Get all classrooms the student has joined
      const classroomResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!classroomResponse.ok) return;

      const classroomData = await classroomResponse.json();
      const joinedClassrooms = classroomData.classrooms || [];

      // Fetch assessments for all joined classrooms
      const allAssessments = [];
      for (const classroom of joinedClassrooms) {
        try {
          const assessmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/classroom/${classroom._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (assessmentResponse.ok) {
            const assessmentData = await assessmentResponse.json();
            const classroomAssessments = (assessmentData.assessments || []).map((assessment: any) => ({
              ...assessment,
              classroomName: classroom.name,
              classroomId: classroom._id
            }));
            allAssessments.push(...classroomAssessments);
          }
        } catch (error) {
          console.error(`Failed to fetch assessments for classroom ${classroom._id}:`, error);
        }
      }

      // Filter assessments by subject if we have a subjectId
      const subjectAssessments = subjectId
        ? allAssessments.filter((assessment: any) => assessment.subject && assessment.subject._id === subjectId)
        : allAssessments;

      setAssessments(subjectAssessments);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const fetchMasteryData = async () => {
    if (!token || !user) return;
    try {
      // Fetch mastery data for all concepts in the subject
      const masteryPromises = subject?.modules?.flatMap(module =>
        module.concepts?.map(concept =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mastery/concept/${user._id}/${concept._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(res => res.ok ? res.json() : null)
        ) || []
      ) || [];

      const results = await Promise.all(masteryPromises);
      const masteryMap = new Map<string, MasteryData>();

      results.forEach(result => {
        if (result) {
          masteryMap.set(result.concept, result);
        }
      });

      setMasteryData(masteryMap);
    } catch (error) {
      console.error('Failed to fetch mastery data:', error);
    }
  };

  const startAssessment = (assessmentId: string) => {
    // Navigate to assessment taking page
    window.location.href = `/student/assessment/${assessmentId}`;
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

  // If subject is null, it means the subject doesn't exist or user doesn't have access
  if (subject === null) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Subject Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The subject you're looking for doesn't exist or you don't have access to it.
          </p>
          <a
            href="/student/curriculum"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
          >
            View My Subjects
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {subject?.name || 'Subject Curriculum'}
        </h1>
        <p className="text-muted-foreground">
          Explore the curriculum modules, concepts, and available assessments.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'curriculum'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'assessments'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Assessments ({assessments.length})
        </button>
      </div>

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && (
        <div>
          {subject?.modules?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No curriculum yet</h3>
              <p className="text-muted-foreground">The curriculum for this subject hasn't been set up yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {subject?.modules?.map((module) => (
                <div key={module._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-foreground mb-2">{module.name}</h2>
                    <p className="text-muted-foreground">Code: {module.code}</p>
                  </div>

                  {/* Concepts Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {module.concepts?.length === 0 ? (
                      <div className="col-span-full text-center py-8 bg-muted/50 rounded-md">
                        <p className="text-muted-foreground">No concepts defined yet.</p>
                      </div>
                    ) : (
                      module.concepts?.map((concept) => {
                        const mastery = masteryData.get(concept.name);
                        return (
                          <div key={concept._id} className="bg-background border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-foreground">{concept.name}</h3>
                                <p className="text-sm text-muted-foreground">{concept.code}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                concept.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                concept.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {concept.difficulty}
                              </span>
                            </div>

                            {concept.description && (
                              <p className="text-sm text-muted-foreground mb-3">{concept.description}</p>
                            )}

                            {/* Mastery Status */}
                            {mastery && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Mastery:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${mastery.masteryScore}%` }}
                                      />
                                    </div>
                                    <span className="font-medium">{mastery.masteryScore}%</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div>
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="document-text" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No assessments available</h3>
              <p className="text-muted-foreground mb-4">There are no launched assessments available for this subject yet.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure you've joined classrooms for this subject and that your teacher has launched assessments.
              </p>
              <a
                href="/student/curriculum"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
              >
                View All Subjects
              </a>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assessments.map((assessment) => (
                <div key={assessment._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{assessment.title}</h3>
                    {assessment.description && (
                      <p className="text-muted-foreground text-sm mb-3">{assessment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="users" size={14} />
                        {assessment.classroomName || 'Classroom'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={14} />
                        {assessment.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="question-mark-circle" size={14} />
                        {assessment.questionCount} questions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {assessment.type === 'AI_GENERATED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Icon name="sparkles" size={12} className="mr-1" />
                          AI Generated
                        </span>
                      )}
                      {assessment.isAttempted ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Icon name="check-circle" size={12} className="mr-1" />
                          Completed ({assessment.score}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Icon name="play" size={12} className="mr-1" />
                          Available
                        </span>
                      )}
                    </div>

                    {!assessment.isAttempted && (
                      <button
                        onClick={() => startAssessment(assessment._id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Start Assessment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCurriculumView;