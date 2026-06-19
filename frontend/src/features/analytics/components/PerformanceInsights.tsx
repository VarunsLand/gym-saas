import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Rocket } from 'lucide-react';
import { AnalyticsResponse } from '../services/analyticsService';

interface PerformanceInsightsProps {
  insights: AnalyticsResponse['insights'];
  groupBy: string;
}

export function PerformanceInsights({ insights, groupBy }: PerformanceInsightsProps) {
  const periodLabel = groupBy === 'hour' ? 'Best Hour' :
                      groupBy === 'week' ? 'Best Week' :
                      groupBy === 'month' ? 'Best Month' : 'Best Day';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{periodLabel}</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {insights?.bestPeriod?.period || '—'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {insights?.bestPeriod?.value || 0} members acquired
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Rocket className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Highest Growth Period</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {insights?.highestGrowth > 0 ? '+' : ''}{insights?.highestGrowth?.toFixed(1) || 0}%
              </h3>
              <p className="text-sm text-slate-500 mt-1">Overall Growth vs Previous Period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
