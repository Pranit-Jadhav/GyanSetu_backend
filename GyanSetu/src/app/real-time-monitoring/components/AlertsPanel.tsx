'use client';

import Icon from '@/components/ui/AppIcon';

interface Alert {
  id: string;
  type: 'failure_prediction' | 'intervention_needed' | 'milestone_delay';
  studentName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertAction: (alertId: string) => void;
}

const AlertsPanel = ({ alerts, onAlertAction }: AlertsPanelProps) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-error/10 border-error text-error';
      case 'medium':
        return 'bg-warning/10 border-warning text-warning';
      case 'low':
        return 'bg-primary/10 border-primary text-primary';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'ExclamationTriangleIcon';
      case 'medium':
        return 'ExclamationCircleIcon';
      case 'low':
        return 'InformationCircleIcon';
      default:
        return 'BellIcon';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Intervention Alerts
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive failure prevention
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-error/10">
            <Icon name="BellAlertIcon" size={16} className="text-error" />
            <span className="text-xs caption text-error font-medium">
              {alerts.length} Active
            </span>
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Icon name="CheckCircleIcon" size={32} className="text-success" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            All Clear
          </p>
          <p className="text-xs caption text-muted-foreground text-center">
            No intervention alerts at this time
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scroll-smooth">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 transition-smooth ${getSeverityStyles(
                alert.severity
              )}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon name={getSeverityIcon(alert.severity) as any} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1">
                    {alert.studentName}
                  </h4>
                  <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                </div>
              </div>

              <div className="p-3 bg-background/50 rounded-md mb-3">
                <div className="flex items-start gap-2">
                  <Icon
                    name="LightBulbIcon"
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs caption opacity-80">
                    {alert.recommendedAction}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onAlertAction(alert.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-background hover:bg-background/80 transition-smooth"
              >
                <Icon name="ArrowRightIcon" size={16} />
                <span className="text-sm font-medium">Take Action</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;