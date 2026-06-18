'use client';

import { useDashboardMetrics } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Frown, CalendarCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardMetrics() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load metrics.</p>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.data?.metrics;

  if (!metrics) {
    return null; // Empty state realistically shouldn't happen unless data structure is completely wrong
  }

  const items = [
    {
      title: 'Total Leads',
      value: metrics.total_leads,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Leads Won',
      value: metrics.leads_won,
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Leads Lost',
      value: metrics.leads_lost,
      icon: Frown,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    },
    {
      title: 'Tasks Due Today',
      value: metrics.tasks_due_today,
      icon: CalendarCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card 
          key={item.title} 
          className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {item.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${item.bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
              <item.icon className={`h-5 w-5 ${item.color}`} strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
