'use client';

import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface SkillData {
  skill: string;
  current: number;
  target: number;
  icon: string;
}

interface SkillsRadarChartProps {
  skillsData: SkillData[];
  overallProgress: number;
}

const SkillsRadarChart = ({ skillsData, overallProgress }: SkillsRadarChartProps) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const getSkillColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Soft Skills Mastery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your current skill development progress
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {overallProgress}%
          </div>
          <div className="text-xs caption text-muted-foreground">
            Overall Progress
          </div>
        </div>
      </div>

      <div className="w-full h-80 mb-6" aria-label="Soft Skills Radar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={skillsData}>
            <PolarGrid stroke="hsl(var(--color-border))" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: 'hsl(var(--color-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--color-muted-foreground))' }} />
            <Radar
              name="Current Level"
              dataKey="current"
              stroke="hsl(var(--color-primary))"
              fill="hsl(var(--color-primary))"
              fillOpacity={0.6}
            />
            <Radar
              name="Target Level"
              dataKey="target"
              stroke="hsl(var(--color-accent))"
              fill="hsl(var(--color-accent))"
              fillOpacity={0.2}
              strokeDasharray="5 5"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--color-popover))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {skillsData.map((skill) => (
          <div
            key={skill.skill}
            className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
              selectedSkill === skill.skill
                ? 'bg-primary/10 border-primary' :'bg-muted/50 border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedSkill(selectedSkill === skill.skill ? null : skill.skill)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name={skill.icon as any} size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{skill.skill}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${getSkillColor(skill.current)}`}>
                {skill.current}%
              </span>
              <span className="text-xs caption text-muted-foreground">
                / {skill.target}%
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-smooth"
                style={{ width: `${(skill.current / skill.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsRadarChart;