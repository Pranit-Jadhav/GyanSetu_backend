import AppImage from '@/components/ui/AppImage';

interface ClassData {
  id: string;
  name: string;
  teacher: string;
  teacherImage: string;
  teacherImageAlt: string;
  masteryRate: number;
  engagementScore: number;
  studentsCount: number;
  trend: 'up' | 'down' | 'neutral';
}

interface ClassRankingCardProps {
  classData: ClassData;
  rank: number;
  onDrillDown: () => void;
}

const ClassRankingCard = ({
  classData,
  rank,
  onDrillDown,
}: ClassRankingCardProps) => {
  const getRankBadgeColor = () => {
    if (rank === 1) return 'bg-amber-500 text-white';
    if (rank === 2) return 'bg-slate-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getTrendColor = () => {
    if (classData.trend === 'up') return 'text-success';
    if (classData.trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-warm-md transition-smooth">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor()}`}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {classData.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 rounded-full overflow-hidden">
              <AppImage
                src={classData.teacherImage}
                alt={classData.teacherImageAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs caption text-muted-foreground truncate">
              {classData.teacher}
            </span>
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
                classData.trend === 'up' ?'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  : classData.trend === 'down' ?'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' :'M5 12h14'
              }
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs caption text-muted-foreground mb-1">
            Mastery Rate
          </p>
          <p className="text-lg font-semibold text-foreground">
            {classData.masteryRate}%
          </p>
        </div>
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs caption text-muted-foreground mb-1">
            Engagement
          </p>
          <p className="text-lg font-semibold text-foreground">
            {classData.engagementScore}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs caption text-muted-foreground">
          {classData.studentsCount} Students
        </span>
        <button
          onClick={onDrillDown}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-smooth"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default ClassRankingCard;