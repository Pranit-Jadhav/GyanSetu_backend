'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TaskRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Foundation' | 'Reinforcement' | 'Mastery';
  estimatedTime: number;
  skillsTargeted: string[];
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationEngineProps {
  recommendations: TaskRecommendation[];
}

const RecommendationEngine = ({ recommendations }: RecommendationEngineProps) => {
  const [filter, setFilter] = useState<'all' | 'Foundation' | 'Reinforcement' | 'Mastery'>('all');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Foundation':
        return 'bg-success/10 text-success border-success/20';
      case 'Reinforcement':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Mastery':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'ExclamationCircleIcon';
      case 'medium':
        return 'InformationCircleIcon';
      case 'low':
        return 'CheckCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const filteredRecommendations = filter === 'all'
    ? recommendations
    : recommendations.filter((rec) => rec.difficulty === filter);

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Personalized Recommendations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered learning pathway suggestions
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {(['all', 'Foundation', 'Reinforcement', 'Mastery'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                filter === level
                  ? 'bg-primary text-primary-foreground shadow-warm-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {level === 'all' ? 'All' : level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredRecommendations.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth bg-background group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <Icon
                  name={getPriorityIcon(task.priority) as any}
                  size={20}
                  className={`mt-0.5 ${
                    task.priority === 'high' ?'text-error'
                      : task.priority === 'medium' ?'text-warning' :'text-success'
                  }`}
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
                    {task.title}
                  </h3>
                  <p className="text-xs caption text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(
                  task.difficulty
                )}`}
              >
                {task.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Icon name="ClockIcon" size={14} className="text-muted-foreground" />
                  <span className="text-xs caption text-muted-foreground">
                    {task.estimatedTime} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="AcademicCapIcon" size={14} className="text-muted-foreground" />
                  <span className="text-xs caption text-muted-foreground">
                    {task.skillsTargeted.length} skills
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-xs font-medium">
                <span>Start Task</span>
                <Icon name="ArrowRightIcon" size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {task.skillsTargeted.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-muted text-xs caption text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;