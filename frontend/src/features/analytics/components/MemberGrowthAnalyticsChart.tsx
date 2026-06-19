import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MemberGrowthDataPoint } from '../services/analyticsService';

interface MemberGrowthAnalyticsChartProps {
  data: MemberGrowthDataPoint[];
}

export function MemberGrowthAnalyticsChart({ data }: MemberGrowthAnalyticsChartProps) {
  return (
    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Member Acquisition Trends</CardTitle>
        <CardDescription className="text-slate-400">Growth over selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                itemStyle={{ color: '#818cf8' }}
                cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area 
                type="monotone" 
                dataKey="newMembers" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMembers)" 
                name="New Members"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
