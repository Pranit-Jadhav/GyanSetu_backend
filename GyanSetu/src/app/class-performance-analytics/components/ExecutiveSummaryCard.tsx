interface ExecutiveSummaryCardProps {
  title: string;
  value: string;
  change: number;
  benchmark: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}

const ExecutiveSummaryCard = ({
  title,
  value,
  change,
  benchmark,
  icon,
  trend,
}: ExecutiveSummaryCardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'ArrowTrendingUpIcon';
    if (trend === 'down') return 'ArrowTrendingDownIcon';
    return 'MinusIcon';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
          </div>
          <div>
            <p className="text-xs caption text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-heading font-semibold text-foreground mt-1">
              {value}
            </h3>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                trend === 'up' ?'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  : trend === 'down' ?'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' :'M5 12h14'
              }
            />
          </svg>
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs caption text-muted-foreground">
          Benchmark
        </span>
        <span className="text-sm font-medium text-foreground">{benchmark}</span>
      </div>
    </div>
  );
};

export default ExecutiveSummaryCard;