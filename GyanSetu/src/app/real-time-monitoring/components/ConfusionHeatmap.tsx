'use client';

import { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Student {
  id: string;
  name: string;
  avatar: string;
  avatarAlt: string;
  confusionScore: number;
  confusionLevel: 'low' | 'medium' | 'high';
  currentActivity: string;
  interventionStrategy: string;
}

interface ConfusionHeatmapProps {
  students: Student[];
  onStudentSelect: (studentId: string) => void;
}

const ConfusionHeatmap = ({
  students,
  onStudentSelect,
}: ConfusionHeatmapProps) => {
  const [hoveredStudent, setHoveredStudent] = useState<string | null>(null);

  const getConfusionColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success/20 border-success';
      case 'medium':
        return 'bg-warning/20 border-warning';
      case 'high':
        return 'bg-error/20 border-error';
      default:
        return 'bg-muted border-border';
    }
  };

  const getConfusionIndicator = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success';
      case 'medium':
        return 'bg-warning';
      case 'high':
        return 'bg-error animate-pulse-warm';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Confusion Heatmap
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time ML-powered confusion detection
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs caption text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs caption text-muted-foreground">
              Medium
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error" />
            <span className="text-xs caption text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {students.map((student) => (
          <div key={student.id} className="relative">
            <button
              onClick={() => onStudentSelect(student.id)}
              onMouseEnter={() => setHoveredStudent(student.id)}
              onMouseLeave={() => setHoveredStudent(null)}
              className={`w-full aspect-square rounded-lg border-2 transition-smooth hover:scale-105 ${getConfusionColor(
                student.confusionLevel
              )}`}
            >
              <div className="relative w-full h-full p-2">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <AppImage
                    src={student.avatar}
                    alt={student.avatarAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`absolute top-1 right-1 w-3 h-3 rounded-full ${getConfusionIndicator(
                    student.confusionLevel
                  )}`}
                />
              </div>
            </button>

            {hoveredStudent === student.id && (
              <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-popover rounded-lg shadow-warm-xl border border-border p-4 animate-scale-in">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <AppImage
                      src={student.avatar}
                      alt={student.avatarAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {student.name}
                    </h4>
                    <p className="text-xs caption text-muted-foreground mt-1">
                      {student.currentActivity}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs caption text-muted-foreground">
                      Confusion Score
                    </span>
                    <span className="text-sm font-semibold text-foreground data-text">
                      {student.confusionScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-smooth ${
                        student.confusionLevel === 'high' ?'bg-error'
                          : student.confusionLevel === 'medium' ?'bg-warning' :'bg-success'
                      }`}
                      style={{ width: `${student.confusionScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="LightBulbIcon"
                      size={16}
                      className="text-primary mt-0.5 flex-shrink-0"
                    />
                    <p className="text-xs caption text-muted-foreground">
                      {student.interventionStrategy}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfusionHeatmap;