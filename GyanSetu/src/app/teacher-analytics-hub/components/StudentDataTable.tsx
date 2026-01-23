'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

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

interface StudentDataTableProps {
  students: Student[];
  onStudentClick?: (studentId: string) => void;
}

type SortField = 'name' | 'masteryScore' | 'timeOnTask' | 'confusionIndex';
type SortDirection = 'asc' | 'desc';

const StudentDataTable = ({
  students,
  onStudentClick,
}: StudentDataTableProps) => {
  const [sortField, setSortField] = useState<SortField>('masteryScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'name') {
      return multiplier * a.name.localeCompare(b.name);
    }
    return multiplier * (a[sortField] - b[sortField]);
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <Icon
          name="ChevronUpDownIcon"
          size={14}
          className="text-muted-foreground"
        />
      );
    }
    return (
      <Icon
        name={
          sortDirection === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon' as any
        }
        size={14}
        className="text-primary"
      />
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-warm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  Student Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left px-6 py-4">
                <button
                  onClick={() => handleSort('masteryScore')}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  Mastery Score
                  <SortIcon field="masteryScore" />
                </button>
              </th>
              <th className="text-left px-6 py-4">
                <button
                  onClick={() => handleSort('timeOnTask')}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  Time on Task
                  <SortIcon field="timeOnTask" />
                </button>
              </th>
              <th className="text-left px-6 py-4">
                <button
                  onClick={() => handleSort('confusionIndex')}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  Confusion Index
                  <SortIcon field="confusionIndex" />
                </button>
              </th>
              <th className="text-left px-6 py-4">
                <span className="text-sm font-medium text-foreground">
                  Milestones
                </span>
              </th>
              <th className="text-left px-6 py-4">
                <span className="text-sm font-medium text-foreground">
                  Last Activity
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => onStudentClick?.(student.id)}
                className="hover:bg-muted/30 transition-smooth cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-smooth ${
                          student.masteryScore >= 70
                            ? 'bg-success'
                            : student.masteryScore >= 40
                              ? 'bg-warning' :'bg-error'
                        }`}
                        style={{ width: `${student.masteryScore}%` }}
                      />
                    </div>
                    <span className="text-sm data-text font-medium text-foreground">
                      {student.masteryScore}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm data-text text-foreground">
                    {student.timeOnTask}h
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      student.confusionIndex >= 70
                        ? 'bg-error/10 text-error'
                        : student.confusionIndex >= 40
                          ? 'bg-warning/10 text-warning' :'bg-success/10 text-success'
                    }`}
                  >
                    {student.confusionIndex >= 70 && (
                      <Icon name="ExclamationTriangleIcon" size={12} />
                    )}
                    {student.confusionIndex}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm data-text text-foreground">
                    {student.milestonesCompleted}/{student.totalMilestones}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs caption text-muted-foreground">
                    {student.lastActivity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDataTable;