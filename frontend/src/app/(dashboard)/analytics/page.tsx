'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useMemberGrowth } from '@/features/analytics/hooks/useAnalytics';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { GrowthKPIs } from '@/features/analytics/components/GrowthKPIs';
import { PerformanceInsights } from '@/features/analytics/components/PerformanceInsights';
import { MemberGrowthAnalyticsChart } from '@/features/analytics/components/MemberGrowthAnalyticsChart';
import { MemberAcquisitionTable } from '@/features/analytics/components/MemberAcquisitionTable';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [groupBy, setGroupBy] = React.useState('day');

  const { data, isLoading, isError } = useMemberGrowth({
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    groupBy
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Member Growth Analytics</h1>
          <p className="text-slate-400 mt-1">Deep dive into acquisition performance and trends</p>
        </div>
        <AnalyticsFilters 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
          groupBy={groupBy} 
          onGroupByChange={setGroupBy} 
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64 text-rose-500">
          Failed to load analytics data.
        </div>
      ) : data?.data ? (
        <div className="space-y-6">
          <GrowthKPIs kpi={data.data.kpi} trend={data.data.trend} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MemberGrowthAnalyticsChart data={data.data.memberGrowth} />
            </div>
            <div className="lg:col-span-1">
              <PerformanceInsights insights={data.data.insights} groupBy={groupBy} />
            </div>
          </div>

          <MemberAcquisitionTable data={data.data.memberGrowth} />
        </div>
      ) : null}
    </div>
  );
}
