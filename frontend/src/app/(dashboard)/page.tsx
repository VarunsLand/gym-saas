'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDateRange } from '@/providers/DateRangeProvider';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { DashboardKPIs } from '@/features/dashboard/components/DashboardKPIs';
import { MemberGrowthChart } from '@/features/dashboard/components/MemberGrowthChart';
import { RevenueTrendChart } from '@/features/dashboard/components/RevenueTrendChart';
import { RenewalTrackerWidget } from '@/features/dashboard/components/RenewalTrackerWidget';
import { ExpenseBreakdownChart } from '@/features/dashboard/components/ExpenseBreakdownChart';
import { useDashboardAnalytics } from '@/features/dashboard/hooks/useDashboard';
import { AddSaleDialog } from '@/features/dashboard/components/AddSaleDialog';
import { AddExpenseDialog } from '@/features/dashboard/components/AddExpenseDialog';

import { DashboardAnalyticsData } from '@/features/dashboard/components/DashboardKPIs';
import { ExpenseBreakdownData } from '@/features/dashboard/components/ExpenseBreakdownChart';

type FullAnalyticsData = DashboardAnalyticsData & ExpenseBreakdownData & {
  memberGrowth?: { date: string; count: number }[];
  revenueTrend?: { date: string; amount: number }[];
};

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { dateRange, setDateRange } = useDateRange();
  
  const startDateStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

  const { data: analyticsData, isLoading } = useDashboardAnalytics(startDateStr, endDateStr);
  const analytics = (analyticsData as FullAnalyticsData) || null;

  if (!currentUser) return null;

  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#0a0f1c] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Premium Compact Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
              {greeting}, {currentUser.first_name} <span className="inline-block hover:animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-sm font-medium text-slate-400">
              {today} <span className="mx-2 text-slate-600">•</span> Gym Command Center
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-end gap-3 flex-wrap">
            <AddSaleDialog />
            <AddExpenseDialog />
            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />
            <CalendarDateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {/* Row 2: KPI Metrics */}
        <section>
          <DashboardKPIs analytics={analytics} isLoading={isLoading} />
        </section>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <MemberGrowthChart data={analytics?.memberGrowth || []} />
          <RevenueTrendChart data={analytics?.revenueTrend || []} />
        </div>

        {/* Row 4: Advanced Renewal System & Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2">
            <RenewalTrackerWidget />
          </div>
          <div className="lg:col-span-1">
            <ExpenseBreakdownChart analytics={analytics} />
          </div>
        </div>

      </div>
    </div>
  );
}
