import Icon from '@/components/ui/AppIcon';

interface KPICardProps {
  title: string;
  value: string | number;
  trend: number;
  trendData: number[];
  icon: string;
  threshold: 'success' | 'warning' | 'error';
  subtitle?: string;
}

const KPICard = ({
  title,
  value,
  trend,
  trendData,
  icon,
  threshold,
  subtitle,
}: KPICardProps) => {
  const thresholdColors = {
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    error: 'text-error bg-error/10 border-error/20',
  };

  const trendColor = trend >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm caption text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-heading font-semibold text-foreground">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs caption text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center border ${thresholdColors[threshold]}`}
        >
          <Icon name={icon as any} size={24} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            name={trend >= 0 ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
            size={16}
            className={trendColor}
          />
          <span className={`text-sm font-medium ${trendColor}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs caption text-muted-foreground">
            vs last period
          </span>
        </div>
      </div>

      <div className="mt-4 h-12 flex items-end gap-1">
        {trendData.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-primary/20 rounded-sm transition-smooth hover:bg-primary/30"
            style={{ height: `${(value / Math.max(...trendData)) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default KPICard;