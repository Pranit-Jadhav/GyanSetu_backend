'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import AnalyticsSubNavigation from '@/components/common/AnalyticsSubNavigation';
import TeacherAnalyticsInteractive from './components/TeacherAnalyticsInteractive';

export default function TeacherAnalyticsHubPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasAccess = user && (user.role === 'teacher' || user.role === 'admin');

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
            You don't have permission to access this page.
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

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus={{ isConnected: true }} />
      <AnalyticsSubNavigation />
      <main className="pt-32">
        <TeacherAnalyticsInteractive />
      </main>
    </div>
  );
}