'use client';

import { useState, useEffect } from 'react';
import { Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';

interface EngagementData {
  time: string;
  engagement: number;
  timeOnTask: number;
}

interface RealTimeAnalyticsProps {
  engagementData: EngagementData[];
}

const RealTimeAnalytics = ({ engagementData }: RealTimeAnalyticsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
        <div className="mb-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-warm-sm p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Real-Time Analytics
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Class-wide engagement trends (updates every 5s)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-warm" />
          <span className="text-xs caption text-primary font-medium">
            Auto-refresh
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Engagement Trend
          </h4>
          <div className="w-full h-64" aria-label="Engagement Trend Line Chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="time"
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#0F766E"
                  strokeWidth={2}
                  fill="url(#engagementGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Time on Task Distribution
          </h4>
          <div className="w-full h-64" aria-label="Time on Task Bar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="time"
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="timeOnTask" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;