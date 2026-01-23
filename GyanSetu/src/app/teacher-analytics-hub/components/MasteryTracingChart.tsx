'use client';

import { useState } from 'react';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart,  } from 'recharts';

interface ChartDataPoint {
  studentName: string;
  masteryProbability: number;
  confusionIndex: number;
  studentId: string;
}

interface MasteryTracingChartProps {
  data: ChartDataPoint[];
  onStudentClick?: (studentId: string) => void;
}

const MasteryTracingChart = ({
  data,
  onStudentClick,
}: MasteryTracingChartProps) => {
  const [activeStudent, setActiveStudent] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-warm-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            {payload[0].payload.studentName}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs caption text-muted-foreground">
                Mastery Probability:
              </span>
              <span className="text-xs data-text font-medium text-primary">
                {payload[0].value}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs caption text-muted-foreground">
                Confusion Index:
              </span>
              <span
                className={`text-xs data-text font-medium ${
                  payload[1].value >= 70
                    ? 'text-error'
                    : payload[1].value >= 40
                      ? 'text-warning' :'text-success'
                }`}
              >
                {payload[1].value}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Deep Knowledge Tracing Dashboard
          </h3>
          <p className="text-sm caption text-muted-foreground mt-1">
            LSTM-based mastery predictions with confusion index overlay
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs caption text-muted-foreground">
              Mastery Probability
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-warning/60" />
            <span className="text-xs caption text-muted-foreground">
              Confusion Index
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="studentName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#64748B', fontSize: 12 }}
            onClick={(e) => {
              const student = data.find((s) => s.studentName === e.value);
              if (student) {
                setActiveStudent(student.studentId);
                onStudentClick?.(student.studentId);
              }
            }}
            style={{ cursor: 'pointer' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748B', fontSize: 12 }}
            label={{
              value: 'Mastery Probability (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#334155', fontSize: 12 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748B', fontSize: 12 }}
            label={{
              value: 'Confusion Index (%)',
              angle: 90,
              position: 'insideRight',
              style: { fill: '#334155', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="right"
            dataKey="confusionIndex"
            fill="#F59E0B"
            opacity={0.6}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="masteryProbability"
            stroke="#0F766E"
            strokeWidth={3}
            dot={{
              fill: '#0F766E',
              r: 5,
              strokeWidth: 2,
              stroke: '#FFFFFF',
            }}
            activeDot={{
              r: 7,
              fill: '#0F766E',
              stroke: '#FFFFFF',
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs caption text-muted-foreground">
        <span>Click on student names to view detailed profile</span>
      </div>
    </div>
  );
};

export default MasteryTracingChart;