'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { DashboardMetrics } from '@/features/dashboard/components/DashboardMetrics';
import { DashboardActivity } from '@/features/dashboard/components/DashboardActivity';
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts';
import { RecentLeadsWidget } from '@/features/dashboard/components/RecentLeadsWidget';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboard';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { data } = useDashboardMetrics();
  const metrics = data?.data?.metrics;

  if (!currentUser) return null;

  // Time-based greeting logic
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Row 1: Premium Welcome Card */}
        <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              {greeting}, {currentUser.first_name} <span className="inline-block hover:animate-wave origin-bottom-right">👋</span>
            </h1>
            
            {metrics ? (
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
                You currently have <strong className="font-semibold text-slate-900 dark:text-slate-200">{metrics.total_leads} total leads</strong>, with <strong className="font-semibold text-slate-900 dark:text-slate-200">{metrics.leads_won} active opportunities</strong> and <strong className="font-semibold text-slate-900 dark:text-slate-200">{metrics.tasks_due_today} tasks</strong> requiring your attention today.
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-3/4 mt-2" />
            )}
          </div>
        </div>

        {/* Row 2: KPI Metrics */}
        <section>
          <DashboardMetrics />
        </section>

        {/* Row 3: Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <DashboardCharts />
            </section>
            
            <section className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm min-h-[400px]">
              <DashboardActivity />
            </section>
          </div>

          {/* Right Column (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <section className="h-full sticky top-8">
              <RecentLeadsWidget />
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
