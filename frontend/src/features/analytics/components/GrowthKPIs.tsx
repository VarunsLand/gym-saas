import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyticsResponse } from '../services/analyticsService';

interface GrowthKPIsProps {
  kpi: AnalyticsResponse['kpi'];
  trend: AnalyticsResponse['trend'];
}

export function GrowthKPIs({ kpi, trend }: GrowthKPIsProps) {
  const isGrowing = trend === 'Growing';
  const isDeclining = trend === 'Declining';
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="w-16 h-16" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-slate-400">New Members</span>
            <span className="text-4xl font-bold text-white">{kpi?.newMembers || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-slate-400">Previous Period</span>
            <span className="text-4xl font-bold text-slate-200">{kpi?.prevMembers || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "bg-slate-900/50 backdrop-blur-xl relative overflow-hidden border-t-4",
        isGrowing ? "border-emerald-500 border-x-white/5 border-b-white/5" : 
        isDeclining ? "border-rose-500 border-x-white/5 border-b-white/5" : 
        "border-indigo-500 border-x-white/5 border-b-white/5"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-slate-400">Growth Analysis</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white">
                {kpi?.membersGrowthPercent > 0 ? '+' : ''}{kpi?.membersGrowthPercent?.toFixed(1)}%
              </span>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
                isGrowing ? "bg-emerald-500/10 text-emerald-400" :
                isDeclining ? "bg-rose-500/10 text-rose-400" :
                "bg-indigo-500/10 text-indigo-400"
              )}>
                {isGrowing && <TrendingUp className="w-4 h-4" />}
                {isDeclining && <TrendingDown className="w-4 h-4" />}
                {!isGrowing && !isDeclining && <Minus className="w-4 h-4" />}
                {trend}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
