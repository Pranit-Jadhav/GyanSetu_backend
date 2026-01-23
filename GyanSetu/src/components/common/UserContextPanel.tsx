
'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface UserContextPanelProps {
  userName?: string;
  userRole?: 'teacher' | 'student' | 'admin';
  selectedClass?: string;
  availableClasses?: Array<{ id: string; name: string }>;
  dateRange?: { start: Date; end: Date };
  onClassChange?: (classId: string) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
}

const UserContextPanel = ({
  userName = 'Educator',
  userRole = 'teacher',
  selectedClass,
  availableClasses = [
    { id: 'class-1', name: 'Mathematics 10A' },
    { id: 'class-2', name: 'Physics 11B' },
    { id: 'class-3', name: 'Chemistry 12C' },
  ],
  dateRange,
  onClassChange,
  onDateRangeChange,
  className = '',
}: UserContextPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSelectedClass, setLocalSelectedClass] = useState(
    selectedClass || availableClasses[0]?.id
  );

  const handleClassChange = (classId: string) => {
    setLocalSelectedClass(classId);
    onClassChange?.(classId);
  };

  const selectedClassData = availableClasses.find(
    (c) => c.id === localSelectedClass
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-smooth"
      >
        <div className="flex items-center gap-2">
          <Icon name="AcademicCapIcon" size={18} className="text-primary" />
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-xs caption text-muted-foreground leading-none">
              Current Class
            </span>
            <span className="text-sm font-medium text-foreground mt-1">
              {selectedClassData?.name || 'Select Class'}
            </span>
          </div>
        </div>
        <Icon
          name="ChevronDownIcon"
          size={16}
          className={`text-muted-foreground transition-smooth ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-[190]"
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover rounded-lg shadow-warm-xl border border-border z-[200] animate-scale-in overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Context Settings
              </h3>
              <p className="text-xs caption text-muted-foreground">
                Manage your current analytical context
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
                  Selected Class
                </label>
                <div className="space-y-1">
                  {availableClasses.map((classItem) => (
                    <button
                      key={classItem.id}
                      onClick={() => handleClassChange(classItem.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-smooth ${
                        localSelectedClass === classItem.id
                          ? 'bg-primary/10 text-primary border border-primary/20' :'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{classItem.name}</span>
                      {localSelectedClass === classItem.id && (
                        <Icon
                          name="CheckIcon"
                          size={16}
                          className="text-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs caption text-muted-foreground mb-2 font-medium">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth"
                      defaultValue={
                        dateRange?.start.toISOString().split('T')[0]
                      }
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth"
                      defaultValue={dateRange?.end.toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
                  <Icon name="FunnelIcon" size={16} />
                  <span className="text-sm font-medium">Apply Filters</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 border-t border-border">
              <div className="flex items-start gap-2">
                <Icon
                  name="InformationCircleIcon"
                  size={16}
                  className="text-primary mt-0.5"
                />
                <p className="text-xs caption text-muted-foreground">
                  Context changes will update all analytics views and ML
                  predictions
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserContextPanel;