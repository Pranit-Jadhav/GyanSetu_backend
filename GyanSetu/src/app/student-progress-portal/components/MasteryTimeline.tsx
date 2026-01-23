'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  completionDate?: Date;
  dueDate: Date;
  artifactsSubmitted: number;
  artifactsRequired: number;
  masteryScore: number;
}

interface MasteryTimelineProps {
  milestones: Milestone[];
}

const MasteryTimeline = ({ milestones }: MasteryTimelineProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'upcoming':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'CheckCircleIcon';
      case 'in-progress':
        return 'ClockIcon';
      case 'upcoming':
        return 'CalendarIcon';
      default:
        return 'CalendarIcon';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Mastery Progression Timeline
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your learning journey and upcoming milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs caption text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs caption text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-xs caption text-muted-foreground">Upcoming</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative pl-16">
              <div
                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(
                  milestone.status
                )} shadow-warm-sm`}
              >
                <Icon name={getStatusIcon(milestone.status) as any} size={24} />
              </div>

              <div
                className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
                  selectedMilestone === milestone.id
                    ? 'bg-primary/5 border-primary shadow-warm-sm'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
                onClick={() =>
                  setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)
                }
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-foreground">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      milestone.status
                    )}`}
                  >
                    {milestone.status === 'in-progress' ? 'In Progress' : milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <Icon name="DocumentTextIcon" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {milestone.artifactsSubmitted}/{milestone.artifactsRequired} Artifacts
                    </span>
                  </div>
                  {milestone.status === 'completed' && milestone.completionDate && (
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircleIcon" size={16} className="text-success" />
                      <span className="text-sm text-muted-foreground">
                        Completed: {formatDate(milestone.completionDate)}
                      </span>
                    </div>
                  )}
                  {milestone.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      <Icon name="CalendarIcon" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Due: {formatDate(milestone.dueDate)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedMilestone === milestone.id && (
                  <div className="mt-4 pt-4 border-t border-border animate-scale-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs caption text-muted-foreground mb-2">
                          Artifact Progress
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-smooth"
                            style={{
                              width: `${
                                (milestone.artifactsSubmitted / milestone.artifactsRequired) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs caption text-muted-foreground mb-2">
                          Mastery Score
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success transition-smooth"
                              style={{ width: `${milestone.masteryScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {milestone.masteryScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
                      <Icon name="DocumentTextIcon" size={16} />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasteryTimeline;