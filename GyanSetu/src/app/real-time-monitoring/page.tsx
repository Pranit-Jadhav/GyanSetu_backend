'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import AnalyticsSubNavigation from '@/components/common/AnalyticsSubNavigation';
import RealTimeMonitoringInteractive from './components/RealTimeMonitoringInteractive';

export default function RealTimeMonitoringPage() {
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
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
    <>
      <Header
        connectionStatus={{ isConnected: true, lastUpdate: new Date() }}
      />
      <AnalyticsSubNavigation />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Real-Time Monitoring
                </h1>
                <p className="text-muted-foreground mt-1">
                  Live learning activity surveillance with ML-powered intervention alerts
                </p>
              </div>
            </div>
          </div>

          <RealTimeMonitoringInteractive />
        </div>
      </main>
    </>
  );
}