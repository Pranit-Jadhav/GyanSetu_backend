'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Activity {
  id: string;
  studentName: string;
  activityType: 'quiz' | 'milestone' | 'peer_review' | 'submission';
  description: string;
  timestamp: Date;
  engagementScore: number;
}

interface LiveActivityFeedProps {
  activities: Activity[];
}

const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [displayActivities, setDisplayActivities] = useState(activities);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    setDisplayActivities(activities);
  }, [isHydrated, activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'DocumentTextIcon';
      case 'milestone':
        return 'FlagIcon';
      case 'peer_review':
        return 'UserGroupIcon';
      case 'submission':
        return 'PaperAirplaneIcon';
      default:
        return 'BellIcon';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-primary/10 text-primary';
      case 'milestone':
        return 'bg-success/10 text-success';
      case 'peer_review':
        return 'bg-accent/10 text-accent';
      case 'submission':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    if (!isHydrated) return 'Just now';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
        <div className="mb-6">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Live Activity Feed
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time student interactions
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-warm" />
          <span className="text-xs caption text-success font-medium">
            Live
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scroll-smooth">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                activity.activityType
              )}`}
            >
              <Icon name={getActivityIcon(activity.activityType) as any} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">
                  {activity.studentName}
                </p>
                <span className="text-xs caption text-muted-foreground whitespace-nowrap">
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {activity.description}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Icon
                    name="ChartBarIcon"
                    size={14}
                    className="text-muted-foreground"
                  />
                  <span className="text-xs caption text-muted-foreground data-text">
                    Engagement: {activity.engagementScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveActivityFeed;