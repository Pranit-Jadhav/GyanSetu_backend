'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import AnalyticsSubNavigation from '@/components/common/AnalyticsSubNavigation';
import StudentLiveInteractive from './components/StudentLiveInteractive';

export default function StudentLiveSessionPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Basic access control
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus={{ isConnected: true }} />
      <AnalyticsSubNavigation />
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-foreground">Live Classroom</h1>
           <p className="text-muted-foreground">Join your teacher's live session to participate in polls and provide feedback.</p>
        </div>
        <StudentLiveInteractive />
      </main>
    </div>
  );
}
