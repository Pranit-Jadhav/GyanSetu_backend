'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PersonalGreetingProps {
  studentName: string;
  currentProject: string;
  achievementCount: number;
  recentBadges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedDate: Date;
  }>;
}

const PersonalGreeting = ({
  studentName,
  currentProject,
  achievementCount,
  recentBadges,
}: PersonalGreetingProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    setIsHydrated(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Hello, {studentName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Current Project: {currentProject}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {achievementCount}
              </div>
              <div className="text-xs caption text-muted-foreground">
                Achievements
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
            {greeting}, {studentName}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Icon name="AcademicCapIcon" size={16} className="text-primary" />
            <p className="text-sm text-muted-foreground">
              Current Project: <span className="font-medium text-foreground">{currentProject}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary animate-pulse-warm">
              {achievementCount}
            </div>
            <div className="text-xs caption text-muted-foreground mt-1">
              Total Achievements
            </div>
          </div>

          {recentBadges.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-xs caption text-muted-foreground">Recent:</div>
              <div className="flex -space-x-2">
                {recentBadges.slice(0, 3).map((badge) => (
                  <div
                    key={badge.id}
                    className="w-10 h-10 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center hover:scale-110 transition-smooth cursor-pointer"
                    title={badge.name}
                  >
                    <Icon name={badge.icon as any} size={20} className="text-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalGreeting;