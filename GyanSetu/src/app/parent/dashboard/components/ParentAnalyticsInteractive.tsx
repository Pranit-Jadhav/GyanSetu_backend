import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KPICard from '@/app/teacher-analytics-hub/components/KPICard';
import Icon from '@/components/ui/AppIcon';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// Define types matching the Parent API response
interface ParentDashboardMetrics {
  studentId: string;
  studentName: string;
  averageMastery: number;
  averageEngagement: number;
  masteryTrend: number[];
  completionRate: number;
  recentAlerts: any[];
}

const ParentAnalyticsInteractive = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<ParentDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/parent`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch child analytics');
        }

        const data = await response.json();
        // Check if data is empty (no children)
        if (data.children && data.children.length === 0) {
           setError('No children linked to this parent account.');
           setMetrics(null);
        } else {
           setMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching parent dashboard:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (isLoading) {
    return (
      <div className="px-6 py-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6 flex items-center gap-3">
          <Icon name="ExclamationTriangleIcon" size={24} className="text-error" />
          <p className="text-error">Attention: {error}</p>
        </div>
      </div>
    );
  }

  // Fallback if null (though handled above)
  const data = metrics || {
    studentId: '',
    studentName: 'Student',
    averageMastery: 0,
    averageEngagement: 0,
    masteryTrend: [],
    completionRate: 0,
    recentAlerts: []
  };

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Analytics for {data.studentName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time performance overview and progress tracking.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Average Mastery"
          value={`${data.averageMastery}%`}
          trend={2.5}
          trendData={data.masteryTrend}
          icon="AcademicCapIcon"
          threshold={data.averageMastery > 70 ? 'success' : data.averageMastery > 40 ? 'warning' : 'error'}
          subtitle="Overall Concept Mastery"
        />
        <KPICard
          title="Engagement Score"
          value={data.averageEngagement.toFixed(1)}
          trend={0.2}
          trendData={[0.5, 0.6, 0.8, 0.7, 0.7, 0.8]} // Mock for visualization if not fully populated
          icon="FireIcon"
          threshold={data.averageEngagement > 0.7 ? 'success' : 'warning'}
          subtitle="Recent Class Activity"
        />
        <KPICard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          trend={5}
          trendData={[70, 75, 80, 82, 85]}
          icon="CheckCircleIcon"
          threshold="success"
          subtitle="Project/Task Completion"
        />
        <KPICard
          title="Assessments Taken"
          value="4" // Simplified static value or add to backend
          trend={1}
          trendData={[1, 1, 2, 3, 4]} 
          icon="DocumentTextIcon"
          threshold="success"
          subtitle="This Semester"
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Growth Chart */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
           <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Mastery Growth</h3>
           <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                  { name: 'Week 1', mastery: 65, engagement: 70 },
                  { name: 'Week 2', mastery: 68, engagement: 75 },
                  { name: 'Week 3', mastery: 72, engagement: 72 },
                  { name: 'Week 4', mastery: 75, engagement: 80 },
                  { name: 'Current', mastery: data.averageMastery, engagement: data.averageEngagement * 100 },
              ]}>
                <defs>
                  <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis unit="%" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="mastery" stroke="#0F766E" fillOpacity={1} fill="url(#colorMastery)" />
                <Area type="monotone" dataKey="engagement" stroke="#F59E0B" fill="none" strokeDasharray="5 5" />
              </AreaChart>
           </ResponsiveContainer>
        </div>

        {/* Recent Assessment Performance (Bar Chart) */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Assessment Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                    { subject: 'Math', score: 85, avg: 78 },
                    { subject: 'Physics', score: 72, avg: 75 },
                    { subject: 'Chem', score: 90, avg: 82 },
                    { subject: 'Bio', score: 88, avg: 80 },
                ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="subject" tick={{fontSize: 12}} />
                    <YAxis unit="%" tick={{fontSize: 12}} />
                    <Tooltip 
                         cursor={{fill: 'var(--muted)', opacity: 0.2}}
                         contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="score" name="Your Child" fill="#0F766E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name="Class Avg" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ParentAnalyticsInteractive;
