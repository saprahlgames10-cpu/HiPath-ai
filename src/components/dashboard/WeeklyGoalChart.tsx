'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface WeeklyGoalChartProps {
  hoursCompleted: number
  hoursGoal: number
}

export function WeeklyGoalChart({ hoursCompleted, hoursGoal }: WeeklyGoalChartProps) {
  const percentage = Math.min(100, Math.round((hoursCompleted / hoursGoal) * 100))
  const data = [
    { name: 'Completed', value: hoursCompleted },
    { name: 'Remaining', value: Math.max(0, hoursGoal - hoursCompleted) },
  ]

  // Using CSS variables via tailwind or explicit colors. 
  // Let's use exact hexes or HSL that match our brand
  const COLORS = ['#6366f1', '#e2e8f0'] // Primary (indigo-500) and muted

  return (
    <div className="relative w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold font-heading">{percentage}%</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">of goal</span>
      </div>
    </div>
  )
}
