'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SessionHeaderProps {
  sessionStartTime: Date;
  connectedStudents: number;
  totalStudents: number;
  onEmergencyAlert: () => void;
}

const SessionHeader = ({
  sessionStartTime,
  connectedStudents,
  totalStudents,
  onEmergencyAlert,
}: SessionHeaderProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isHydrated, sessionStartTime]);

  const connectionPercentage = (connectedStudents / totalStudents) * 100;

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="ClockIcon" size={24} className="text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success animate-pulse-warm" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Active Session
            </h2>
            <p className="text-sm text-muted-foreground data-text">
              {elapsedTime}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-muted">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-warm" />
              <span className="text-sm font-medium text-foreground data-text">
                {connectedStudents}/{totalStudents}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs caption text-muted-foreground">
              {connectionPercentage.toFixed(0)}% Connected
            </span>
          </div>

          <button
            onClick={onEmergencyAlert}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-error text-error-foreground hover:bg-error/90 transition-smooth shadow-warm-sm"
          >
            <Icon name="BellAlertIcon" size={18} />
            <span className="text-sm font-medium">Emergency Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;