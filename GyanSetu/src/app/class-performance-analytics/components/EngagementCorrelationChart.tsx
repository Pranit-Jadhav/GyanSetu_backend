"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface ScatterDataPoint {
  name: string;
  engagement: number;
  mastery: number;
  students: number;
}

interface EngagementCorrelationChartProps {
  data: ScatterDataPoint[];
}

const EngagementCorrelationChart = ({
  data,
}: EngagementCorrelationChartProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Engagement vs. Learning Outcomes
        </h3>
        <p className="text-sm caption text-muted-foreground mt-1">
          Correlation analysis between student engagement and mastery
          achievement
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type="number"
            dataKey="engagement"
            name="Engagement Score"
            stroke="#64748B"
            style={{ fontSize: "12px" }}
            label={{
              value: "Engagement Score",
              position: "insideBottom",
              offset: -5,
              style: { fontSize: "12px", fill: "#64748B" },
            }}
          />
          <YAxis
            type="number"
            dataKey="mastery"
            name="Mastery Rate"
            stroke="#64748B"
            style={{ fontSize: "12px" }}
            label={{
              value: "Mastery Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "12px", fill: "#64748B" },
            }}
          />
          <ZAxis type="number" dataKey="students" range={[100, 1000]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(
              value: number | undefined,
              name: string | undefined
            ) => {
              if (value === undefined || name === undefined) return ["", ""];
              if (name === "engagement") return [`${value}`, "Engagement"];
              if (name === "mastery") return [`${value}%`, "Mastery"];
              if (name === "students") return [`${value}`, "Students"];
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={() => "Class Performance"}
          />
          <Scatter
            name="Classes"
            data={data}
            fill="#0F766E"
            fillOpacity={0.6}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary opacity-60" />
          <span className="text-xs caption text-muted-foreground">
            Bubble size = Student count
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-success" />
          <span className="text-xs caption text-muted-foreground">
            Positive correlation trend
          </span>
        </div>
      </div>
    </div>
  );
};

export default EngagementCorrelationChart;
