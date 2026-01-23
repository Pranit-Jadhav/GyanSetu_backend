'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface GridRow {
  id: string;
  className: string;
  teacher: string;
  students: number;
  masteryRate: number;
  engagementScore: number;
  completionVelocity: number;
  interventionRate: number;
  projectsCompleted: number;
}

interface PerformanceDataGridProps {
  data: GridRow[];
}

const PerformanceDataGrid = ({ data }: PerformanceDataGridProps) => {
  const [sortColumn, setSortColumn] = useState<keyof GridRow>('masteryRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (column: keyof GridRow) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier;
  });

  const columns = [
    { key: 'className' as keyof GridRow, label: 'Class Name', width: 'w-48' },
    { key: 'teacher' as keyof GridRow, label: 'Teacher', width: 'w-40' },
    { key: 'students' as keyof GridRow, label: 'Students', width: 'w-24' },
    {
      key: 'masteryRate' as keyof GridRow,
      label: 'Mastery Rate',
      width: 'w-32',
    },
    {
      key: 'engagementScore' as keyof GridRow,
      label: 'Engagement',
      width: 'w-32',
    },
    {
      key: 'completionVelocity' as keyof GridRow,
      label: 'Velocity',
      width: 'w-28',
    },
    {
      key: 'interventionRate' as keyof GridRow,
      label: 'Interventions',
      width: 'w-32',
    },
    {
      key: 'projectsCompleted' as keyof GridRow,
      label: 'Projects',
      width: 'w-28',
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Detailed Performance Metrics
          </h3>
          <p className="text-sm caption text-muted-foreground mt-1">
            Comprehensive class-level analytics with filtering and export
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-smooth"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
            <Icon name="ArrowDownTrayIcon" size={18} />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width} px-4 py-3 text-left`}
                >
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 text-xs caption font-semibold text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {column.label}
                    {sortColumn === column.key && (
                      <Icon
                        name={
                          sortDirection === 'asc' ?'ChevronUpIcon' :'ChevronDownIcon'
                        }
                        size={14}
                      />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-border hover:bg-muted/30 transition-smooth ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {row.className}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{row.teacher}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm data-text text-foreground">
                    {row.students}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${row.masteryRate}%` }}
                      />
                    </div>
                    <span className="text-sm data-text font-medium text-foreground">
                      {row.masteryRate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm data-text font-medium text-foreground">
                    {row.engagementScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm data-text text-foreground">
                    {row.completionVelocity}x
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm data-text text-foreground">
                    {row.interventionRate}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm data-text text-foreground">
                    {row.projectsCompleted}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-sm caption text-muted-foreground">
          Showing {sortedData.length} of {data.length} classes
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-smooth disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-smooth disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDataGrid;