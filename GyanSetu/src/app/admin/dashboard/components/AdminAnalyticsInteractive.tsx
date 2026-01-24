'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KPICard from '@/app/teacher-analytics-hub/components/KPICard'; // Reusing generic KPI Card
import Icon from '@/components/ui/AppIcon';

// Define types matching the Admin API response
interface AdminDashboardMetrics {
  masteryRate: number;
  teacherAdoptionRate: number;
  confidenceScore: number;
  averageEngagement: number;
  statistics: {
    totalTeachers: number;
    activeTeachers: number;
    totalStudents: number;
    totalClasses: number;
    totalConcepts: number;
    totalAssessments: number;
  };
  engagementDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

const AdminAnalyticsInteractive = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
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
          <p className="text-error">Failed to load dashboard: {error}</p>
        </div>
      </div>
    );
  }

  // Fallback values if metrics are null (shouldn't happen on success), or use loaded metrics
  const data = metrics || {
    masteryRate: 0,
    teacherAdoptionRate: 0,
    confidenceScore: 0,
    averageEngagement: 0,
    statistics: {
      totalTeachers: 0,
      activeTeachers: 0,
      totalStudents: 0,
      totalClasses: 0,
      totalConcepts: 0,
      totalAssessments: 0
    },
    engagementDistribution: { low: 0, medium: 0, high: 0 }
  };

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">Global insights across all classrooms and teachers.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Global Mastery Rate"
          value={`${data.masteryRate}%`}
          trend={1.5} // Mock trend
          trendData={[65, 68, 70, 72, 71, 73, data.masteryRate]} // Mock trend data ending with actual
          icon="AcademicCapIcon"
          threshold="success"
          subtitle="Average Subject Mastery"
        />
        <KPICard
          title="Teacher Adoption"
          value={`${Math.round(data.teacherAdoptionRate * 100)}%`}
          trend={5.2}
          trendData={[40, 50, 60, 70, 80, 85, data.teacherAdoptionRate * 100]}
          icon="UsersIcon"
          threshold="success"
          subtitle="Active / Total Teachers"
        />
        <KPICard
          title="Confidence Score"
          value={data.confidenceScore.toFixed(2)}
          trend={0.1}
          trendData={[0.6, 0.7, 0.65, 0.72, 0.75, 0.78, data.confidenceScore]}
          icon="ShieldCheckIcon"
          threshold="success"
          subtitle="Admin Operations Index"
        />
        <KPICard
          title="Avg Engagement"
          value={data.averageEngagement.toFixed(2)}
          trend={-0.5}
          trendData={[0.5, 0.6, 0.8, 0.7, 0.6, 0.55, data.averageEngagement]}
          icon="FireIcon"
          threshold="warning"
          subtitle="Global Engagement Level"
        />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Stats */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm lg:col-span-2">
           <h3 className="text-lg font-heading font-semibold text-foreground mb-4">System Statistics</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatItem label="Total Students" value={data.statistics.totalStudents} icon="UserGroupIcon" />
              <StatItem label="Total Teachers" value={data.statistics.totalTeachers} icon="AcademicCapIcon" />
              <StatItem label="Active Classes" value={data.statistics.totalClasses} icon="BookOpenIcon" />
              <StatItem label="Concepts Tracked" value={data.statistics.totalConcepts} icon="LightBulbIcon" />
              <StatItem label="Assessments Created" value={data.statistics.totalAssessments} icon="DocumentTextIcon" />
              <StatItem label="Active Teachers" value={data.statistics.activeTeachers} icon="UserIcon" />
           </div>
        </div>

        {/* Engagement Distribution */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Engagement Distribution</h3>
          <div className="space-y-4">
            <DistributionBar label="High Engagement (> 0.75)" count={data.engagementDistribution.high} color="bg-success" total={data.statistics.totalStudents || 1} />
            <DistributionBar label="Medium Engagement (0.5 - 0.75)" count={data.engagementDistribution.medium} color="bg-warning" total={data.statistics.totalStudents || 1} />
            <DistributionBar label="Low Engagement (< 0.5)" count={data.engagementDistribution.low} color="bg-error" total={data.statistics.totalStudents || 1} />
          </div>
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
             <p className="text-sm text-muted-foreground">
               This metric categorizes all student engagement logs. A higher percentage in High/Medium indicates healthy platform usage.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon }: { label: string, value: number, icon: any }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
    <div className="p-2 bg-primary/10 rounded-md text-primary">
      <Icon name={icon} size={20} />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const DistributionBar = ({ label, count, color, total }: { label: string, count: number, color: string, total: number }) => {
  const percentage = Math.round((count / total) * 100) || 0; // Rough percentage relative to something, normalized later if total is just students
  // Actually the total passed in might be 0, so avoid NaN
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
            className={`h-full ${color}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }} // Just visualization
        />
      </div>
    </div>
  );
};

export default AdminAnalyticsInteractive;
