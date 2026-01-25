'use client';

import { useState, useEffect } from 'react';
import PersonalGreeting from './PersonalGreeting';
import SkillsRadarChart from './SkillsRadarChart';
import RecommendationEngine from './RecommendationEngine';
import MasteryTimeline from './MasteryTimeline';
import ProjectKanban from './ProjectKanban';

interface StudentProgressInteractiveProps {
  studentData: {
    name: string;
    currentProject: string;
    achievementCount: number;
    recentBadges: Array<{
      id: string;
      name: string;
      icon: string;
      earnedDate: Date;
    }>;
  };
  skillsData: Array<{
    skill: string;
    current: number;
    target: number;
    icon: string;
  }>;
  overallProgress: number;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'Foundation' | 'Reinforcement' | 'Mastery';
    estimatedTime: number;
    skillsTargeted: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'in-progress' | 'upcoming';
    completionDate?: Date;
    dueDate: Date;
    artifactsSubmitted: number;
    artifactsRequired: number;
    masteryScore: number;
  }>;
  kanbanTasks: Array<{
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    priority: 'high' | 'medium' | 'low';
    dueDate: Date;
    peerReviews: number;
    requiredReviews: number;
  }>;
}

const StudentProgressInteractive = ({
  studentData,
  skillsData,
  overallProgress,
  recommendations,
  milestones,
  kanbanTasks,
}: StudentProgressInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border h-32 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg p-6 shadow-warm-sm border border-border h-96 animate-pulse" />
          <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PersonalGreeting
        studentName={studentData.name}
        currentProject={studentData.currentProject}
        achievementCount={studentData.achievementCount}
        recentBadges={studentData.recentBadges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkillsRadarChart skillsData={skillsData} overallProgress={overallProgress} />
        </div>
        <div>
          <RecommendationEngine recommendations={recommendations} />
        </div>
      </div>

      {/* <MasteryTimeline milestones={milestones} />

      <ProjectKanban tasks={kanbanTasks} /> */}
    </div>
  );
};

export default StudentProgressInteractive;