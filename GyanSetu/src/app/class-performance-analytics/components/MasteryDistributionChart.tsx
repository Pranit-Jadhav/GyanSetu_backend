'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  week: string;
  class10A: number;
  class11B: number;
  class12C: number;
  class9D: number;
}

interface MasteryDistributionChartProps {
  data: ChartDataPoint[];
}

const MasteryDistributionChart = ({
  data,
}: MasteryDistributionChartProps) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const classColors = {
    class10A: '#0F766E',
    class11B: '#EA580C',
    class12C: '#059669',
    class9D: '#D97706',
  };

  const classLabels = {
    class10A: 'Mathematics 10A',
    class11B: 'Physics 11B',
    class12C: 'Chemistry 12C',
    class9D: 'Biology 9D',
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Mastery Distribution Trends
          </h3>
          <p className="text-sm caption text-muted-foreground mt-1">
            Comparative mastery achievement across classes over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(classLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                hiddenSeries.has(key)
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: hiddenSeries.has(key)
                    ? '#94A3B8'
                    : classColors[key as keyof typeof classColors],
                }}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            {Object.entries(classColors).map(([key, color]) => (
              <linearGradient
                key={key}
                id={`color${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="week"
            stroke="#64748B"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748B"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Mastery Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#64748B' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
            formatter={(value) =>
              classLabels[value as keyof typeof classLabels]
            }
          />
          {Object.keys(classColors).map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={classColors[key as keyof typeof classColors]}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${key})`}
              hide={hiddenSeries.has(key)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasteryDistributionChart;