'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import AnalyticsSubNavigation from '@/components/common/AnalyticsSubNavigation';
import StudentCurriculumView from '../components/StudentCurriculumView';
import { useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function StudentCurriculumPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const classroomId = searchParams.get('classroom');

  const hasAccess = user && user.role === 'student';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to signin if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            Only students can access their curriculum.
          </p>
          <a
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-smooth"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!subjectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Subject Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please access this page from the subject joining page.
          </p>
          <a
            href="/student/subject-joining"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-smooth"
          >
            Go to Subject Joining
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus={{ isConnected: true }} />
      <AnalyticsSubNavigation />
      <main className="pt-32">
        <StudentCurriculumView subjectId={subjectId} classroomId={classroomId} />
      </main>
    </div>
  );
}