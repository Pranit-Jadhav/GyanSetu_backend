'use client';

import { useState, useEffect } from 'react';
import ExecutiveSummaryCard from './ExecutiveSummaryCard';
import ClassRankingCard from './ClassRankingCard';
import MasteryDistributionChart from './MasteryDistributionChart';
import EngagementCorrelationChart from './EngagementCorrelationChart';
import ConceptDifficultyHeatmap from './ConceptDifficultyHeatmap';
import PerformanceDataGrid from './PerformanceDataGrid';
import Icon from '@/components/ui/AppIcon';

interface ClassPerformanceInteractiveProps {}

const ClassPerformanceInteractive = ({}: ClassPerformanceInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([
  'all-classes']
  );
  const [academicPeriod, setAcademicPeriod] = useState('current-semester');
  const [comparisonMode, setComparisonMode] = useState<
    'class-to-class' | 'historical'>(
    'class-to-class');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const executiveSummaryData = [
  {
    title: 'Overall Mastery Achievement',
    value: '78.4%',
    change: 5.2,
    benchmark: '75.0%',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    trend: 'up' as const
  },
  {
    title: 'Student Engagement Index',
    value: '8.2',
    change: 3.8,
    benchmark: '7.5',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    trend: 'up' as const
  },
  {
    title: 'Project Completion Velocity',
    value: '1.3x',
    change: -2.1,
    benchmark: '1.4x',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    trend: 'down' as const
  },
  {
    title: 'Intervention Success Rate',
    value: '92.7%',
    change: 7.5,
    benchmark: '88.0%',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    trend: 'up' as const
  }];


  const classRankingData = [
  {
    id: 'class-1',
    name: 'Mathematics 10A',
    teacher: 'Dr. Sarah Johnson',
    teacherImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1fe961467-1763294677353.png",
    teacherImageAlt: 'Professional headshot of Dr. Sarah Johnson, female mathematics teacher with brown hair in navy blazer',
    masteryRate: 85,
    engagementScore: 9.2,
    studentsCount: 32,
    trend: 'up' as const
  },
  {
    id: 'class-2',
    name: 'Physics 11B',
    teacher: 'Prof. Michael Chen',
    teacherImage: "https://img.rocket.new/generatedImages/rocket_gen_img_11104c31c-1763292144173.png",
    teacherImageAlt: 'Professional headshot of Prof. Michael Chen, male physics teacher with glasses in gray suit',
    masteryRate: 82,
    engagementScore: 8.8,
    studentsCount: 28,
    trend: 'up' as const
  },
  {
    id: 'class-3',
    name: 'Chemistry 12C',
    teacher: 'Dr. Emily Rodriguez',
    teacherImage: "https://img.rocket.new/generatedImages/rocket_gen_img_10d041d7e-1763296376425.png",
    teacherImageAlt: 'Professional headshot of Dr. Emily Rodriguez, female chemistry teacher with long dark hair in white lab coat',
    masteryRate: 79,
    engagementScore: 8.5,
    studentsCount: 30,
    trend: 'neutral' as const
  },
  {
    id: 'class-4',
    name: 'Biology 9D',
    teacher: 'Mr. James Wilson',
    teacherImage: "https://img.rocket.new/generatedImages/rocket_gen_img_11efe0564-1763295966459.png",
    teacherImageAlt: 'Professional headshot of Mr. James Wilson, male biology teacher with beard in green shirt',
    masteryRate: 74,
    engagementScore: 7.9,
    studentsCount: 35,
    trend: 'down' as const
  }];


  const masteryDistributionData = [
  { week: 'Week 1', class10A: 65, class11B: 62, class12C: 60, class9D: 58 },
  { week: 'Week 2', class10A: 68, class11B: 65, class12C: 63, class9D: 60 },
  { week: 'Week 3', class10A: 72, class11B: 68, class12C: 66, class9D: 62 },
  { week: 'Week 4', class10A: 75, class11B: 72, class12C: 69, class9D: 65 },
  { week: 'Week 5', class10A: 78, class11B: 75, class12C: 72, class9D: 68 },
  { week: 'Week 6', class10A: 81, class11B: 78, class12C: 75, class9D: 70 },
  { week: 'Week 7', class10A: 83, class11B: 80, class12C: 77, class9D: 72 },
  { week: 'Week 8', class10A: 85, class11B: 82, class12C: 79, class9D: 74 }];


  const engagementCorrelationData = [
  { name: 'Math 10A', engagement: 9.2, mastery: 85, students: 32 },
  { name: 'Physics 11B', engagement: 8.8, mastery: 82, students: 28 },
  { name: 'Chem 12C', engagement: 8.5, mastery: 79, students: 30 },
  { name: 'Bio 9D', engagement: 7.9, mastery: 74, students: 35 },
  { name: 'Math 11E', engagement: 8.3, mastery: 80, students: 29 },
  { name: 'Physics 10F', engagement: 7.5, mastery: 72, students: 31 }];


  const conceptDifficultyData = [
  { concept: 'Quadratic Equations', class: 'Math 10A', difficulty: 45 },
  { concept: 'Quadratic Equations', class: 'Math 11E', difficulty: 52 },
  { concept: 'Quadratic Equations', class: 'Physics 11B', difficulty: 38 },
  { concept: 'Quadratic Equations', class: 'Chem 12C', difficulty: 41 },
  { concept: 'Newton\'s Laws', class: 'Math 10A', difficulty: 35 },
  { concept: 'Newton\'s Laws', class: 'Math 11E', difficulty: 40 },
  { concept: 'Newton\'s Laws', class: 'Physics 11B', difficulty: 68 },
  { concept: 'Newton\'s Laws', class: 'Chem 12C', difficulty: 32 },
  { concept: 'Chemical Bonding', class: 'Math 10A', difficulty: 28 },
  { concept: 'Chemical Bonding', class: 'Math 11E', difficulty: 30 },
  { concept: 'Chemical Bonding', class: 'Physics 11B', difficulty: 42 },
  { concept: 'Chemical Bonding', class: 'Chem 12C', difficulty: 75 },
  { concept: 'Cell Division', class: 'Math 10A', difficulty: 22 },
  { concept: 'Cell Division', class: 'Math 11E', difficulty: 25 },
  { concept: 'Cell Division', class: 'Physics 11B', difficulty: 30 },
  { concept: 'Cell Division', class: 'Chem 12C', difficulty: 48 },
  { concept: 'Probability Theory', class: 'Math 10A', difficulty: 58 },
  { concept: 'Probability Theory', class: 'Math 11E', difficulty: 62 },
  { concept: 'Probability Theory', class: 'Physics 11B', difficulty: 55 },
  { concept: 'Probability Theory', class: 'Chem 12C', difficulty: 50 }];


  const performanceGridData = [
  {
    id: '1',
    className: 'Mathematics 10A',
    teacher: 'Dr. Sarah Johnson',
    students: 32,
    masteryRate: 85,
    engagementScore: 9.2,
    completionVelocity: 1.4,
    interventionRate: 8,
    projectsCompleted: 12
  },
  {
    id: '2',
    className: 'Physics 11B',
    teacher: 'Prof. Michael Chen',
    students: 28,
    masteryRate: 82,
    engagementScore: 8.8,
    completionVelocity: 1.3,
    interventionRate: 10,
    projectsCompleted: 11
  },
  {
    id: '3',
    className: 'Chemistry 12C',
    teacher: 'Dr. Emily Rodriguez',
    students: 30,
    masteryRate: 79,
    engagementScore: 8.5,
    completionVelocity: 1.2,
    interventionRate: 12,
    projectsCompleted: 10
  },
  {
    id: '4',
    className: 'Biology 9D',
    teacher: 'Mr. James Wilson',
    students: 35,
    masteryRate: 74,
    engagementScore: 7.9,
    completionVelocity: 1.1,
    interventionRate: 15,
    projectsCompleted: 9
  },
  {
    id: '5',
    className: 'Mathematics 11E',
    teacher: 'Ms. Lisa Anderson',
    students: 29,
    masteryRate: 80,
    engagementScore: 8.3,
    completionVelocity: 1.3,
    interventionRate: 9,
    projectsCompleted: 11
  },
  {
    id: '6',
    className: 'Physics 10F',
    teacher: 'Dr. Robert Taylor',
    students: 31,
    masteryRate: 72,
    engagementScore: 7.5,
    completionVelocity: 1.0,
    interventionRate: 18,
    projectsCompleted: 8
  }];


  const availableClasses = [
  { id: 'all-classes', name: 'All Classes' },
  { id: 'class-1', name: 'Mathematics 10A' },
  { id: 'class-2', name: 'Physics 11B' },
  { id: 'class-3', name: 'Chemistry 12C' },
  { id: 'class-4', name: 'Biology 9D' },
  { id: 'class-5', name: 'Mathematics 11E' },
  { id: 'class-6', name: 'Physics 10F' }];


  const academicPeriods = [
  { id: 'current-semester', name: 'Current Semester (Fall 2024)' },
  { id: 'previous-semester', name: 'Previous Semester (Spring 2024)' },
  { id: 'current-year', name: 'Current Academic Year' },
  { id: 'previous-year', name: 'Previous Academic Year' }];


  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) =>
            <div key={i} className="h-40 bg-muted rounded-lg" />
            )}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
              Select Classes
            </label>
            <select
              value={selectedClasses[0]}
              onChange={(e) => setSelectedClasses([e.target.value])}
              className="w-full px-4 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth">

              {availableClasses.map((cls) =>
              <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
              Academic Period
            </label>
            <select
              value={academicPeriod}
              onChange={(e) => setAcademicPeriod(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth">

              {academicPeriods.map((period) =>
              <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
              Comparison Mode
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setComparisonMode('class-to-class')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                comparisonMode === 'class-to-class' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`
                }>

                Class-to-Class
              </button>
              <button
                onClick={() => setComparisonMode('historical')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                comparisonMode === 'historical' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`
                }>

                Historical
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
              Report Scheduling
            </label>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-smooth">
              <Icon name="CalendarIcon" size={18} />
              <span className="text-sm font-medium">Schedule Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {executiveSummaryData.map((item, index) =>
        <ExecutiveSummaryCard key={index} {...item} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MasteryDistributionChart data={masteryDistributionData} />
          <EngagementCorrelationChart data={engagementCorrelationData} />
          <ConceptDifficultyHeatmap data={conceptDifficultyData} />
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Class Rankings
              </h3>
              <Icon
                name="TrophyIcon"
                size={20}
                className="text-primary" />

            </div>
            <div className="space-y-3">
              {classRankingData.map((classData, index) =>
              <ClassRankingCard
                key={classData.id}
                classData={classData}
                rank={index + 1}
                onDrillDown={() => {
                  window.location.href = '/teacher-analytics-hub';
                }} />

              )}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Icon name="BoltIcon" size={20} className="text-success" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Quick Insights
                </h4>
                <p className="text-xs caption text-muted-foreground">
                  AI-generated recommendations
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-foreground mb-1">
                  Top Performing Concept
                </p>
                <p className="text-xs caption text-muted-foreground">
                  Cell Division shows 78% average mastery across all classes
                </p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-foreground mb-1">
                  Intervention Priority
                </p>
                <p className="text-xs caption text-muted-foreground">
                  Chemical Bonding requires additional support in Chemistry 12C
                </p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-foreground mb-1">
                  Engagement Trend
                </p>
                <p className="text-xs caption text-muted-foreground">
                  Overall engagement increased by 3.8% this semester
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PerformanceDataGrid data={performanceGridData} />

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={20}
            className="text-primary mt-0.5" />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Data Refresh Information
            </h4>
            <p className="text-xs caption text-muted-foreground">
              Analytics data is refreshed every 15 minutes. Last update: Just now. Next scheduled update in 14 minutes. Historical data processing uses cached optimization for improved performance.
            </p>
          </div>
        </div>
      </div>
    </div>);

};

export default ClassPerformanceInteractive;