'use client';

import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

interface QuickActionPanelProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
}

const QuickActionPanel = ({
  actions,
  onActionClick,
}: QuickActionPanelProps) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20';
      case 'secondary':
        return 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20';
      case 'success':
        return 'bg-success/10 text-success hover:bg-success/20 border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20';
      default:
        return 'bg-muted text-foreground hover:bg-muted/80 border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Quick Actions
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          One-click intervention tools
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-smooth ${getVariantStyles(
              action.variant
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Icon name={action.icon as any} size={20} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-semibold mb-1">{action.label}</h4>
              <p className="text-xs caption opacity-80">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionPanel;