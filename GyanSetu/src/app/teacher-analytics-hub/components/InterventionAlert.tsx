import Icon from '@/components/ui/AppIcon';

interface InterventionAlertProps {
  studentName: string;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  recommendedAction: string;
  timestamp: string;
  masteryScore: number;
}

const InterventionAlert = ({
  studentName,
  urgency,
  reason,
  recommendedAction,
  timestamp,
  masteryScore,
}: InterventionAlertProps) => {
  const urgencyConfig = {
    high: {
      color: 'bg-error/10 border-error/20 text-error',
      icon: 'ExclamationTriangleIcon',
      pulse: 'animate-pulse-warm',
    },
    medium: {
      color: 'bg-warning/10 border-warning/20 text-warning',
      icon: 'ExclamationCircleIcon',
      pulse: '',
    },
    low: {
      color: 'bg-success/10 border-success/20 text-success',
      icon: 'InformationCircleIcon',
      pulse: '',
    },
  };

  const config = urgencyConfig[urgency];

  return (
    <div
      className={`p-4 rounded-lg border ${config.color} transition-smooth hover:shadow-warm-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.pulse}`}>
          <Icon name={config.icon as any} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-foreground truncate">
              {studentName}
            </h4>
            <span className="text-xs caption text-muted-foreground ml-2 whitespace-nowrap">
              {timestamp}
            </span>
          </div>
          <p className="text-xs caption text-muted-foreground mb-2">{reason}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs caption text-muted-foreground">
              Mastery:
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-smooth ${
                  masteryScore >= 70
                    ? 'bg-success'
                    : masteryScore >= 40
                      ? 'bg-warning' :'bg-error'
                }`}
                style={{ width: `${masteryScore}%` }}
              />
            </div>
            <span className="text-xs data-text font-medium text-foreground">
              {masteryScore}%
            </span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-background/50 rounded-md">
            <Icon
              name="LightBulbIcon"
              size={14}
              className="text-primary mt-0.5"
            />
            <p className="text-xs caption text-foreground flex-1">
              {recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionAlert;