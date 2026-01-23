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
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  students: string[];
  studentCount: number;
  isJoined: boolean;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  classrooms: Classroom[];
}

const SubjectJoiningInteractive = () => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningClassroomId, setJoiningClassroomId] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    fetchAvailableSubjects();
  }, []);

  const fetchAvailableSubjects = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch available subjects:', error);
    }
  };

  const joinClassroom = async (classroomId: string) => {
    if (!token || !user) return;

    setJoiningClassroomId(classroomId);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ classroomId })
      });

      if (response.ok) {
        // Refresh subjects to update join status
        await fetchAvailableSubjects();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to join classroom');
      }
    } catch (error) {
      console.error('Failed to join classroom:', error);
      alert('Failed to join classroom. Please try again.');
    } finally {
      setLoading(false);
      setJoiningClassroomId(null);
    }
  };

  const joinByCode = async () => {
    if (!token || !joinCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ joinCode: joinCode.trim() })
      });

      if (response.ok) {
        setShowJoinModal(false);
        setJoinCode('');
        // Refresh subjects to update join status
        await fetchAvailableSubjects();
        alert('Successfully joined the classroom!');
      } else {
        const error = await response.json();
        alert(error.message || 'Invalid join code or classroom not found');
      }
    } catch (error) {
      console.error('Failed to join classroom:', error);
      alert('Failed to join classroom. Please try again.');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Join Subjects & Classrooms
            </h1>
            <p className="text-muted-foreground">
              Discover available subjects and join classrooms to start learning.
            </p>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="plus" size={16} />
            Join by Code
          </button>
        </div>
      </div>

      {/* Subjects and Classrooms */}
      <div className="space-y-8">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No subjects available</h3>
            <p className="text-muted-foreground mb-4">There are no subjects or classrooms available to join at the moment.</p>
            <p className="text-sm text-muted-foreground">Check back later or ask your teacher to create classrooms.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="bg-card border border-border rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">{subject.name}</h2>
                <p className="text-muted-foreground">Subject Code: {subject.code}</p>
              </div>

              {/* Classrooms for this subject */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Available Classrooms</h3>

                {subject.classrooms.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">No classrooms available for this subject yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {subject.classrooms.map((classroom) => (
                      <div key={classroom._id} className="bg-background border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{classroom.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {classroom.course} • {classroom.academicYear} • Teacher: {classroom.teacherId.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                              {classroom.studentCount} student{classroom.studentCount !== 1 ? 's' : ''}
                            </div>
                            {classroom.isJoined ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Icon name="check" size={12} className="mr-1" />
                                Joined
                              </span>
                            ) : (
                              <button
                                onClick={() => joinClassroom(classroom._id)}
                                disabled={loading && joiningClassroomId === classroom._id}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading && joiningClassroomId === classroom._id ? 'Joining...' : 'Join Classroom'}
                              </button>
                            )}
                          </div>
                        </div>

                        {classroom.isJoined && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">You've joined this classroom</span>
                              <a
                                href={`/student/curriculum/${subject._id}?classroom=${classroom._id}`}
                                className="text-primary hover:text-primary/80 font-medium"
                              >
                                View Curriculum →
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Join by Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Join Classroom by Code</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground font-mono"
                  placeholder="Enter classroom join code"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your teacher for the join code (6 characters)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={joinByCode}
                disabled={loading || !joinCode.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Classroom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectJoiningInteractive;