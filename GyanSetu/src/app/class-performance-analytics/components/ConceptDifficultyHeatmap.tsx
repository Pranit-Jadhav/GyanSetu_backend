'use client';

interface HeatmapCell {
  concept: string;
  class: string;
  difficulty: number;
}

interface ConceptDifficultyHeatmapProps {
  data: HeatmapCell[];
}

const ConceptDifficultyHeatmap = ({
  data,
}: ConceptDifficultyHeatmapProps) => {
  const concepts = Array.from(new Set(data.map((d) => d.concept)));
  const classes = Array.from(new Set(data.map((d) => d.class)));

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return 'bg-error';
    if (difficulty >= 60) return 'bg-warning';
    if (difficulty >= 40) return 'bg-accent';
    if (difficulty >= 20) return 'bg-primary';
    return 'bg-success';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 80) return 'Critical';
    if (difficulty >= 60) return 'High';
    if (difficulty >= 40) return 'Moderate';
    if (difficulty >= 20) return 'Low';
    return 'Minimal';
  };

  const getCellData = (concept: string, className: string) => {
    return data.find((d) => d.concept === concept && d.class === className);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Concept Difficulty Matrix
        </h3>
        <p className="text-sm caption text-muted-foreground mt-1">
          Heat map showing concept-level difficulty patterns across classes
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[200px_repeat(4,1fr)] gap-2">
            <div className="font-medium text-sm text-muted-foreground" />
            {classes.map((className) => (
              <div
                key={className}
                className="text-center text-xs caption font-medium text-muted-foreground"
              >
                {className}
              </div>
            ))}

            {concepts.map((concept) => (
              <>
                <div
                  key={`label-${concept}`}
                  className="text-sm font-medium text-foreground py-2"
                >
                  {concept}
                </div>
                {classes.map((className) => {
                  const cellData = getCellData(concept, className);
                  const difficulty = cellData?.difficulty || 0;
                  return (
                    <div
                      key={`${concept}-${className}`}
                      className={`${getDifficultyColor(
                        difficulty
                      )} rounded-md p-3 flex flex-col items-center justify-center transition-smooth hover:scale-105 cursor-pointer group relative`}
                    >
                      <span className="text-sm font-bold text-white">
                        {difficulty}%
                      </span>
                      <span className="text-xs text-white/80 mt-1">
                        {getDifficultyLabel(difficulty)}
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border border-border rounded-md px-3 py-2 shadow-warm-lg whitespace-nowrap z-10">
                        <p className="text-xs font-medium text-foreground">
                          {concept}
                        </p>
                        <p className="text-xs caption text-muted-foreground mt-1">
                          {className}: {difficulty}% difficulty
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="text-xs caption text-muted-foreground">
          Difficulty Level:
        </span>
        {[
          { label: 'Minimal', color: 'bg-success' },
          { label: 'Low', color: 'bg-primary' },
          { label: 'Moderate', color: 'bg-accent' },
          { label: 'High', color: 'bg-warning' },
          { label: 'Critical', color: 'bg-error' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-xs caption text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptDifficultyHeatmap;