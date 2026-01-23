'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Classroom {
  _id: string;
  name: string;
  academicYear: string;
  course: string;
  joinCode: string;
  students: string[];
  createdAt: string;
}

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
  subjectId: string;
  concepts: Concept[];
}

interface Concept {
  _id: string;
  name: string;
  code: string;
  moduleId: string;
  subjectId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  type: 'MANUAL' | 'AI_GENERATED';
  status: 'DRAFT' | 'LAUNCHED' | 'COMPLETED';
  classroom: {
    _id: string;
    name: string;
    course: string;
    academicYear: string;
  };
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  questionCount: number;
  duration: number;
  launchedAt?: string;
  createdAt: string;
}

const ClassroomManagementInteractive = () => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'classrooms' | 'curriculum' | 'assessments'>('classrooms');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateConcept, setShowCreateConcept] = useState(false);

  // Form states
  const [classroomForm, setClassroomForm] = useState({
    name: '',
    academicYear: new Date().getFullYear().toString(),
    course: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: ''
  });

  const [moduleForm, setModuleForm] = useState({
    name: '',
    code: '',
    subjectId: '',
    description: ''
  });

  const [conceptForm, setConceptForm] = useState({
    name: '',
    code: '',
    moduleId: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    description: ''
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    setIsHydrated(true);
    fetchClassrooms();
    fetchSubjects();
    fetchAssessments();
  }, []);

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

  const fetchAssessments = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/teacher`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const launchAssessment = async (assessmentId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/${assessmentId}/launch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Refresh assessments
        await fetchAssessments();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to launch assessment');
      }
    } catch (error) {
      console.error('Failed to launch assessment:', error);
      alert('Failed to launch assessment');
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    if (!token || !classroomForm.name || !classroomForm.academicYear || !classroomForm.course) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classroomForm)
      });

      if (response.ok) {
        const newClassroom = await response.json();
        setClassrooms(prev => [...prev, newClassroom.classroom]);
        setClassroomForm({
          name: '',
          academicYear: new Date().getFullYear().toString(),
          course: ''
        });
        setShowCreateClassroom(false);
      }
    } catch (error) {
      console.error('Failed to create classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!token || !subjectForm.name || !subjectForm.code) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subjectForm)
      });

      if (response.ok) {
        const newSubject = await response.json();
        setSubjects(prev => [...prev, newSubject.subject]);
        setSubjectForm({ name: '', code: '' });
        setShowCreateSubject(false);
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const createModule = async () => {
    if (!token || !moduleForm.name || !moduleForm.code || !moduleForm.subjectId) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleForm)
      });

      if (response.ok) {
        await fetchSubjects(); // Refresh subjects to get updated modules
        setModuleForm({ name: '', code: '', subjectId: '', description: '' });
        setShowCreateModule(false);
      }
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConcept = async () => {
    if (!token || !conceptForm.name || !conceptForm.code || !conceptForm.moduleId) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/concepts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(conceptForm)
      });

      if (response.ok) {
        await fetchSubjects(); // Refresh subjects to get updated concepts
        setConceptForm({
          name: '',
          code: '',
          moduleId: '',
          difficulty: 'MEDIUM',
          description: ''
        });
        setShowCreateConcept(false);
      }
    } catch (error) {
      console.error('Failed to create concept:', error);
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
          Classroom Management
        </h1>
        <p className="text-muted-foreground">
          Create and manage your classrooms, curriculum structure, and learning content.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('classrooms')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'classrooms'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Classrooms
        </button>
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

      {/* Classrooms Tab */}
      {activeTab === 'classrooms' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Classrooms</h2>
            <button
              onClick={() => setShowCreateClassroom(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              <Icon name="plus" size={16} />
              Create Classroom
            </button>
          </div>

          {/* Classrooms List */}
          <div className="grid gap-4">
            {classrooms.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No classrooms yet</h3>
                <p className="text-muted-foreground mb-4">Create your first classroom to get started.</p>
                <button
                  onClick={() => setShowCreateClassroom(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Create Your First Classroom
                </button>
              </div>
            ) : (
              classrooms.map((classroom) => (
                <div key={classroom._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{classroom.name}</h3>
                      <p className="text-muted-foreground">{classroom.course} - {classroom.academicYear}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-muted px-3 py-1 rounded-md">
                        <span className="text-sm font-medium text-foreground">Join Code:</span>
                        <span className="ml-2 font-mono text-primary">{classroom.joinCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {classroom.students.length} student{classroom.students.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-primary hover:text-primary/80 text-sm font-medium">
                        View Details
                      </button>
                      <button className="text-muted-foreground hover:text-foreground text-sm">
                        Manage Students
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Curriculum Structure</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateSubject(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                Add Subject
              </button>
            </div>
          </div>

          {/* Curriculum Hierarchy */}
          <div className="space-y-6">
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No curriculum yet</h3>
                <p className="text-muted-foreground mb-4">Create your first subject to build your curriculum.</p>
                <button
                  onClick={() => setShowCreateSubject(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Create Your First Subject
                </button>
              </div>
            ) : (
              subjects.map((subject) => (
                <div key={subject._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{subject.name}</h3>
                      <p className="text-muted-foreground">Code: {subject.code}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubject(subject._id);
                        setShowCreateModule(true);
                      }}
                      className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                    >
                      <Icon name="plus" size={14} />
                      Add Module
                    </button>
                  </div>

                  {/* Modules */}
                  <div className="space-y-4">
                    {subject.modules?.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No modules created yet.</p>
                    ) : (
                      subject.modules?.map((module) => (
                        <div key={module._id} className="bg-muted/50 rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{module.name}</h4>
                              <p className="text-sm text-muted-foreground">Code: {module.code}</p>
                            </div>
                            <button
                              onClick={() => {
                                setConceptForm(prev => ({ ...prev, moduleId: module._id }));
                                setShowCreateConcept(true);
                              }}
                              className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                            >
                              <Icon name="plus" size={12} />
                              Add Concept
                            </button>
                          </div>

                          {/* Concepts */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                            {module.concepts?.length === 0 ? (
                              <p className="text-muted-foreground text-xs col-span-full">No concepts yet.</p>
                            ) : (
                              module.concepts?.map((concept) => (
                                <div key={concept._id} className="bg-background rounded px-3 py-2 flex justify-between items-center">
                                  <div>
                                    <span className="text-sm font-medium">{concept.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({concept.code})</span>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    concept.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                    concept.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {concept.difficulty}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Assessments</h2>
            <a
              href="/teacher/assessment-creation"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              <Icon name="plus" size={16} />
              Create Assessment
            </a>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="document-text" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No assessments yet</h3>
                <p className="text-muted-foreground mb-4">Create your first assessment to get started.</p>
                <a
                  href="/teacher/assessment-creation"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Create Your First Assessment
                </a>
              </div>
            ) : (
              assessments.map((assessment) => (
                <div key={assessment._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{assessment.title}</h3>
                      {assessment.description && (
                        <p className="text-muted-foreground text-sm mb-2">{assessment.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="book-open" size={14} />
                          {assessment.subject.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="users" size={14} />
                          {assessment.classroom.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="question-mark-circle" size={14} />
                          {assessment.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="clock" size={14} />
                          {assessment.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        assessment.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : assessment.status === 'LAUNCHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assessment.status === 'DRAFT' && <Icon name="pencil" size={12} className="mr-1" />}
                        {assessment.status === 'LAUNCHED' && <Icon name="rocket" size={12} className="mr-1" />}
                        {assessment.status === 'COMPLETED' && <Icon name="check-circle" size={12} className="mr-1" />}
                        {assessment.status}
                      </span>
                      {assessment.type === 'AI_GENERATED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Icon name="sparkles" size={12} className="mr-1" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(assessment.createdAt).toLocaleDateString()}
                      {assessment.launchedAt && (
                        <span className="ml-2">
                          • Launched {new Date(assessment.launchedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {assessment.status === 'DRAFT' && (
                        <button
                          onClick={() => launchAssessment(assessment._id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Icon name="rocket" size={14} />
                          Launch
                        </button>
                      )}
                      <button className="text-primary hover:text-primary/80 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Classroom Modal */}
      {showCreateClassroom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Classroom</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Classroom Name</label>
                <input
                  type="text"
                  value={classroomForm.name}
                  onChange={(e) => setClassroomForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Mathematics 10A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Academic Year</label>
                <input
                  type="text"
                  value={classroomForm.academicYear}
                  onChange={(e) => setClassroomForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Course</label>
                <input
                  type="text"
                  value={classroomForm.course}
                  onChange={(e) => setClassroomForm(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateClassroom(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createClassroom}
                disabled={loading || !classroomForm.name || !classroomForm.academicYear || !classroomForm.course}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Classroom'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {showCreateSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Subject</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., DSA"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateSubject(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSubject}
                disabled={loading || !subjectForm.name || !subjectForm.code}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                <select
                  value={moduleForm.subjectId}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Module Name</label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Arrays and Strings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Module Code</label>
                <input
                  type="text"
                  value={moduleForm.code}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., ARRAYS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Brief description of the module"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModule(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createModule}
                disabled={loading || !moduleForm.name || !moduleForm.code || !moduleForm.subjectId}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Concept Modal */}
      {showCreateConcept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Concept</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Module</label>
                <select
                  value={conceptForm.moduleId}
                  onChange={(e) => setConceptForm(prev => ({ ...prev, moduleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Select a module</option>
                  {subjects.flatMap(subject =>
                    subject.modules?.map(module => (
                      <option key={module._id} value={module._id}>
                        {subject.name} → {module.name}
                      </option>
                    )) || []
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Concept Name</label>
                <input
                  type="text"
                  value={conceptForm.name}
                  onChange={(e) => setConceptForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Binary Search"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Concept Code</label>
                <input
                  type="text"
                  value={conceptForm.code}
                  onChange={(e) => setConceptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., BS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                <select
                  value={conceptForm.difficulty}
                  onChange={(e) => setConceptForm(prev => ({ ...prev, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
                <textarea
                  value={conceptForm.description}
                  onChange={(e) => setConceptForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={3}
                  placeholder="Brief description of the concept"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateConcept(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createConcept}
                disabled={loading || !conceptForm.name || !conceptForm.code || !conceptForm.moduleId}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Concept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagementInteractive;