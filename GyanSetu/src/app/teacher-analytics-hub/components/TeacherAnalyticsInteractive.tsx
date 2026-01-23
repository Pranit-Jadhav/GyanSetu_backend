'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KPICard from './KPICard';
import MasteryTracingChart from './MasteryTracingChart';
import InterventionAlert from './InterventionAlert';
import StudentDataTable from './StudentDataTable';
import Icon from '@/components/ui/AppIcon';

interface KPIData {
  classAverageMastery: number;
  activeConfusionAlerts: number;
  milestoneCompletionRate: number;
  engagementIndex: number;
}

interface ChartDataPoint {
  studentName: string;
  masteryProbability: number;
  confusionIndex: number;
  studentId: string;
}

interface InterventionAlertData {
  id: string;
  studentName: string;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  recommendedAction: string;
  timestamp: string;
  masteryScore: number;
}

interface Student {
  id: string;
  name: string;
  masteryScore: number;
  timeOnTask: number;
  lastActivity: string;
  confusionIndex: number;
  milestonesCompleted: number;
  totalMilestones: number;
}

const TeacherAnalyticsInteractive = () => {
  const { token } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Mathematics 10A');
  const [dateRange, setDateRange] = useState('Week');
  const [isLiveUpdateEnabled, setIsLiveUpdateEnabled] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/teacher`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        // Fallback to mock data if API fails
        setDashboardData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use real API data if available, otherwise fallback to mock data
  const kpiData: KPIData = dashboardData ? {
    classAverageMastery: dashboardData.averageMastery || 78.5,
    activeConfusionAlerts: dashboardData.activeAlerts || 12,
    milestoneCompletionRate: 85.3, // This might need to be calculated from API
    engagementIndex: dashboardData.averageEngagement || 92.1,
  } : {
    classAverageMastery: 78.5,
    activeConfusionAlerts: 12,
    milestoneCompletionRate: 85.3,
    engagementIndex: 92.1,
  };

  const kpiTrendData = {
    mastery: [72, 74, 76, 75, 77, 78, 78.5],
    alerts: [15, 14, 13, 14, 13, 12, 12],
    completion: [80, 81, 83, 84, 84, 85, 85.3],
    engagement: [88, 89, 90, 91, 91, 92, 92.1],
  };

  const chartData: ChartDataPoint[] = [
    {
      studentName: 'Aarav Sharma',
      masteryProbability: 92,
      confusionIndex: 15,
      studentId: 'std-001',
    },
    {
      studentName: 'Priya Patel',
      masteryProbability: 88,
      confusionIndex: 22,
      studentId: 'std-002',
    },
    {
      studentName: 'Rohan Kumar',
      masteryProbability: 65,
      confusionIndex: 68,
      studentId: 'std-003',
    },
    {
      studentName: 'Ananya Singh',
      masteryProbability: 95,
      confusionIndex: 8,
      studentId: 'std-004',
    },
    {
      studentName: 'Arjun Reddy',
      masteryProbability: 72,
      confusionIndex: 45,
      studentId: 'std-005',
    },
    {
      studentName: 'Diya Mehta',
      masteryProbability: 58,
      confusionIndex: 75,
      studentId: 'std-006',
    },
    {
      studentName: 'Kabir Joshi',
      masteryProbability: 85,
      confusionIndex: 28,
      studentId: 'std-007',
    },
    {
      studentName: 'Ishita Gupta',
      masteryProbability: 91,
      confusionIndex: 12,
      studentId: 'std-008',
    },
    {
      studentName: 'Vihaan Desai',
      masteryProbability: 68,
      confusionIndex: 52,
      studentId: 'std-009',
    },
    {
      studentName: 'Aisha Khan',
      masteryProbability: 82,
      confusionIndex: 35,
      studentId: 'std-010',
    },
  ];

  const interventionAlerts: InterventionAlertData[] = [
    {
      id: 'alert-001',
      studentName: 'Diya Mehta',
      urgency: 'high',
      reason: 'Confusion index above 70% for 3 consecutive sessions',
      recommendedAction:
        'Schedule one-on-one session to review quadratic equations fundamentals',
      timestamp: '5m ago',
      masteryScore: 58,
    },
    {
      id: 'alert-002',
      studentName: 'Rohan Kumar',
      urgency: 'high',
      reason: 'Mastery probability dropped 15% in last 2 days',
      recommendedAction:
        'Assign foundation-level practice problems for algebraic expressions',
      timestamp: '12m ago',
      masteryScore: 65,
    },
    {
      id: 'alert-003',
      studentName: 'Vihaan Desai',
      urgency: 'medium',
      reason: 'Time-on-task decreased by 40% this week',
      recommendedAction:
        'Check engagement with current PBL milestone and provide alternative resources',
      timestamp: '28m ago',
      masteryScore: 68,
    },
    {
      id: 'alert-004',
      studentName: 'Arjun Reddy',
      urgency: 'medium',
      reason: 'Confusion index elevated on trigonometry concepts',
      recommendedAction:
        'Recommend peer tutoring session with high-mastery student',
      timestamp: '1h ago',
      masteryScore: 72,
    },
    {
      id: 'alert-005',
      studentName: 'Aisha Khan',
      urgency: 'low',
      reason: 'Milestone completion slower than class average',
      recommendedAction:
        'Provide time management tips and break down complex tasks',
      timestamp: '2h ago',
      masteryScore: 82,
    },
  ];

  const students: Student[] = [
    {
      id: 'std-001',
      name: 'Aarav Sharma',
      masteryScore: 92,
      timeOnTask: 24.5,
      lastActivity: '10 minutes ago',
      confusionIndex: 15,
      milestonesCompleted: 8,
      totalMilestones: 10,
    },
    {
      id: 'std-002',
      name: 'Priya Patel',
      masteryScore: 88,
      timeOnTask: 22.3,
      lastActivity: '25 minutes ago',
      confusionIndex: 22,
      milestonesCompleted: 7,
      totalMilestones: 10,
    },
    {
      id: 'std-003',
      name: 'Rohan Kumar',
      masteryScore: 65,
      timeOnTask: 18.7,
      lastActivity: '1 hour ago',
      confusionIndex: 68,
      milestonesCompleted: 5,
      totalMilestones: 10,
    },
    {
      id: 'std-004',
      name: 'Ananya Singh',
      masteryScore: 95,
      timeOnTask: 26.8,
      lastActivity: '5 minutes ago',
      confusionIndex: 8,
      milestonesCompleted: 9,
      totalMilestones: 10,
    },
    {
      id: 'std-005',
      name: 'Arjun Reddy',
      masteryScore: 72,
      timeOnTask: 20.1,
      lastActivity: '45 minutes ago',
      confusionIndex: 45,
      milestonesCompleted: 6,
      totalMilestones: 10,
    },
    {
      id: 'std-006',
      name: 'Diya Mehta',
      masteryScore: 58,
      timeOnTask: 16.4,
      lastActivity: '2 hours ago',
      confusionIndex: 75,
      milestonesCompleted: 4,
      totalMilestones: 10,
    },
    {
      id: 'std-007',
      name: 'Kabir Joshi',
      masteryScore: 85,
      timeOnTask: 23.6,
      lastActivity: '15 minutes ago',
      confusionIndex: 28,
      milestonesCompleted: 7,
      totalMilestones: 10,
    },
    {
      id: 'std-008',
      name: 'Ishita Gupta',
      masteryScore: 91,
      timeOnTask: 25.2,
      lastActivity: '8 minutes ago',
      confusionIndex: 12,
      milestonesCompleted: 8,
      totalMilestones: 10,
    },
    {
      id: 'std-009',
      name: 'Vihaan Desai',
      masteryScore: 68,
      timeOnTask: 19.3,
      lastActivity: '1.5 hours ago',
      confusionIndex: 52,
      milestonesCompleted: 5,
      totalMilestones: 10,
    },
    {
      id: 'std-010',
      name: 'Aisha Khan',
      masteryScore: 82,
      timeOnTask: 21.9,
      lastActivity: '30 minutes ago',
      confusionIndex: 35,
      milestonesCompleted: 6,
      totalMilestones: 10,
    },
  ];

  const handleStudentClick = (studentId: string) => {
    if (!isHydrated) return;
    console.log('Student clicked:', studentId);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Icon name="ExclamationTriangleIcon" size={24} className="text-error" />
            <div>
              <h3 className="text-sm font-medium text-error">Failed to load dashboard</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">Using demo data instead</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="bg-card rounded-lg border border-border p-4 shadow-warm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 sm:flex-initial">
              <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
                Class Selection
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 rounded-md bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth"
              >
                <option value="Mathematics 10A">Mathematics 10A</option>
                <option value="Physics 11B">Physics 11B</option>
                <option value="Chemistry 12C">Chemistry 12C</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-initial">
              <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
                Date Range
              </label>
              <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1">
                {['Today', 'Week', 'Month', 'Semester'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-smooth ${
                      dateRange === range
                        ? 'bg-primary text-primary-foreground shadow-warm-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiveUpdateEnabled(!isLiveUpdateEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-smooth ${
                isLiveUpdateEnabled
                  ? 'bg-success/10 border-success/20 text-success' :'bg-muted border-border text-muted-foreground'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLiveUpdateEnabled ? 'bg-success' : 'bg-muted-foreground'
                  }`}
                />
                {isLiveUpdateEnabled && (
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-pulse-warm" />
                )}
              </div>
              <span className="text-sm font-medium">
                {isLiveUpdateEnabled ? 'Live Updates' : 'Paused'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Class Average Mastery"
          value={`${kpiData.classAverageMastery}%`}
          trend={2.3}
          trendData={kpiTrendData.mastery}
          icon="AcademicCapIcon"
          threshold="success"
          subtitle="LSTM Prediction"
        />
        <KPICard
          title="Active Confusion Alerts"
          value={kpiData.activeConfusionAlerts}
          trend={-8.5}
          trendData={kpiTrendData.alerts}
          icon="ExclamationTriangleIcon"
          threshold="warning"
          subtitle="Requires Intervention"
        />
        <KPICard
          title="Milestone Completion"
          value={`${kpiData.milestoneCompletionRate}%`}
          trend={3.7}
          trendData={kpiTrendData.completion}
          icon="CheckCircleIcon"
          threshold="success"
          subtitle="PBL Progress"
        />
        <KPICard
          title="Engagement Index"
          value={`${kpiData.engagementIndex}%`}
          trend={1.2}
          trendData={kpiTrendData.engagement}
          icon="FireIcon"
          threshold="success"
          subtitle="Time-on-Task"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MasteryTracingChart
            data={chartData}
            onStudentClick={handleStudentClick}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 shadow-warm h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Intervention Alerts
                </h3>
                <p className="text-sm caption text-muted-foreground mt-1">
                  Real-time student support needs
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-error/10 border border-error/20">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse-warm" />
                <span className="text-xs data-text font-medium text-error">
                  {interventionAlerts.filter((a) => a.urgency === 'high').length}{' '}
                  High
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {interventionAlerts.map((alert) => (
                <InterventionAlert key={alert.id} {...alert} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Student Performance Overview
            </h3>
            <p className="text-sm caption text-muted-foreground mt-1">
              Comprehensive class analytics with sortable metrics
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
            <Icon name="ArrowDownTrayIcon" size={16} />
            <span className="text-sm font-medium">Export Data</span>
          </button>
        </div>
        <StudentDataTable
          students={students}
          onStudentClick={handleStudentClick}
        />
      </div>
    </div>
  );
};

export default TeacherAnalyticsInteractive;