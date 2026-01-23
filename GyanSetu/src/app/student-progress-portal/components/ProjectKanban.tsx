'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  peerReviews: number;
  requiredReviews: number;
}

interface ProjectKanbanProps {
  tasks: KanbanTask[];
}

const ProjectKanban = ({ tasks }: ProjectKanbanProps) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const columns = [
    { id: 'todo', title: 'To Do', icon: 'ClipboardDocumentListIcon', color: 'text-muted-foreground' },
    { id: 'in-progress', title: 'In Progress', icon: 'ClockIcon', color: 'text-warning' },
    { id: 'review', title: 'Peer Review', icon: 'UserGroupIcon', color: 'text-accent' },
    { id: 'completed', title: 'Completed', icon: 'CheckCircleIcon', color: 'text-success' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-error text-error';
      case 'medium':
        return 'border-warning text-warning';
      case 'low':
        return 'border-success text-success';
      default:
        return 'border-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Project Progress Board
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your PBL milestones and track peer reviews
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
          <Icon name="PlusIcon" size={16} />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <Icon name={column.icon as any} size={18} className={column.color} />
                <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
                <span className="ml-auto text-xs caption text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-smooth cursor-pointer ${
                      selectedTask === task.id
                        ? 'bg-primary/5 border-primary shadow-warm-sm'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground flex-1 line-clamp-2">
                        {task.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs caption text-muted-foreground line-clamp-2 mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon name="CalendarIcon" size={12} className="text-muted-foreground" />
                        <span className="text-xs caption text-muted-foreground">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      {task.status === 'review' && (
                        <div className="flex items-center gap-1.5">
                          <Icon name="UserGroupIcon" size={12} className="text-accent" />
                          <span className="text-xs caption text-muted-foreground">
                            {task.peerReviews}/{task.requiredReviews}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedTask === task.id && (
                      <div className="mt-3 pt-3 border-t border-border animate-scale-in">
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth">
                          <Icon name="ArrowRightIcon" size={14} />
                          <span className="text-xs font-medium">View Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-border rounded-lg">
                    <Icon name="InboxIcon" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs caption text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectKanban;