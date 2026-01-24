'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import AdminAnalyticsInteractive from './components/AdminAnalyticsInteractive';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
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

  if (!isAuthenticated || user?.role !== 'admin') {
     if (typeof window !== 'undefined') {
       if (!isAuthenticated) window.location.href = '/auth/signin';
       else window.location.href = '/'; 
     }
    return (
       <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You do not have permission to view the Admin Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus={{ isConnected: true }} />
      <main className="pt-24">
        <AdminAnalyticsInteractive />
      </main>
    </div>
  );
}
