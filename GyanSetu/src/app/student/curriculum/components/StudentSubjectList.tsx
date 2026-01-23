'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface Classroom {
  _id: string;
  name: string;
  academicYear: string;
  course: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  assessmentsCount: number;
  classroomName: string;
}

const StudentSubjectList = () => {
  const { token, user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    fetchStudentClassrooms();
  }, []);

  const fetchStudentClassrooms = async () => {
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
        await fetchSubjectsForClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    }
  };

  const fetchSubjectsForClassrooms = async (studentClassrooms: Classroom[]) => {
    if (!token || studentClassrooms.length === 0) return;

    setLoading(true);
    try {
      const subjectMap = new Map<string, Subject>();

      // For each classroom, get assessments and extract subjects
      await Promise.all(
        studentClassrooms.map(async (classroom) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments/classroom/${classroom._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              const assessments = data.assessments || [];

              // Group assessments by subject
              assessments.forEach((assessment: any) => {
                if (assessment.subject && assessment.subject._id) {
                  const subjectId = assessment.subject._id;
                  if (!subjectMap.has(subjectId)) {
                    subjectMap.set(subjectId, {
                      _id: subjectId,
                      name: assessment.subject.name,
                      code: assessment.subject.code || subjectId,
                      assessmentsCount: 0,
                      classroomName: classroom.name
                    });
                  }
                  subjectMap.get(subjectId)!.assessmentsCount++;
                }
              });
            }
          } catch (error) {
            console.error(`Failed to fetch assessments for classroom ${classroom._id}:`, error);
          }
        })
      );

      setSubjects(Array.from(subjectMap.values()));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
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
          My Subjects
        </h1>
        <p className="text-muted-foreground">
          View curriculum and take assessments for subjects in your joined classrooms.
        </p>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="book-open" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No classrooms joined yet</h3>
          <p className="text-muted-foreground mb-4">
            Join a classroom to access subjects and curriculum.
          </p>
          <a
            href="/student/subject-joining"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
          >
            Join Subjects
          </a>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="document-text" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No curriculum available</h3>
          <p className="text-muted-foreground mb-4">
            Your joined classrooms don't have curriculum or assessments set up yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later or ask your teacher to create assessments.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject._id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Code: {subject.code}</p>
                  <p className="text-xs text-muted-foreground">Classroom: {subject.classroomName}</p>
                </div>
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {subject.assessmentsCount} assessment{subject.assessmentsCount !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <Icon name="academic-cap" size={16} className="inline mr-1" />
                  Curriculum available
                </div>
                <a
                  href={`/student/curriculum/${subject._id}`}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Curriculum
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Joined Classrooms Summary */}
      {classrooms.length > 0 && (
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Joined Classrooms</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {classrooms.map((classroom) => (
              <div key={classroom._id} className="bg-background border border-border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">{classroom.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {classroom.course} • {classroom.academicYear}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Teacher: {classroom.teacher.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="check-circle" size={12} className="mr-1" />
                      Joined
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubjectList;