'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

function AnimatedMetric({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const count = useCountUp(value || 0, 1500);

  if (isCurrency) {
    return <>₹{count.toLocaleString('en-IN')}</>;
  }
  return <>{count.toLocaleString('en-IN')}</>;
}

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10';

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass} mt-2`}>
      <Icon className="w-3 h-3 mr-1" />
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </div>
  );
}

// Subtle decorative wave for the background of the cards
const CardWaveDecoration = () => (
  <div className="absolute inset-x-0 bottom-0 opacity-[0.03] pointer-events-none overflow-hidden h-24">
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full text-white fill-current">
      <path d="M0,50 C100,20 200,80 300,50 C400,20 500,80 600,50 L600,100 L0,100 Z" />
    </svg>
  </div>
);

export function DashboardKPIs({ analytics, isLoading }: { analytics: any, isLoading: boolean }) {
  if (isLoading || !analytics) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card rounded-2xl h-36 relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Active Members',
      value: analytics.activeMembers,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'group-hover:border-cyan-500/30',
      trend: null,
    },
    {
      title: 'New Members',
      value: analytics.newMembers,
      icon: UserPlus,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'group-hover:border-emerald-500/30',
      trend: analytics.trends?.membersPercentage || 0,
    },
    {
      title: 'Revenue',
      value: analytics.revenue,
      icon: Wallet,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'group-hover:border-amber-500/30',
      isCurrency: true,
      trend: analytics.trends?.revenuePercentage || 0,
    },
    {
      title: 'Net Profit',
      value: analytics.profit,
      icon: Activity,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'group-hover:border-indigo-500/30',
      isCurrency: true,
      trend: analytics.trends?.revenuePercentage || 0,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card 
          key={item.title} 
          className={`glass-card hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 rounded-2xl relative overflow-hidden group cursor-pointer border border-white/5 ${item.borderColor}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <CardWaveDecoration />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 pt-5 px-5">
            <CardTitle className="text-sm font-medium text-slate-400 tracking-wide uppercase text-[11px]">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-xl ${item.bgColor} transition-transform duration-500 group-hover:scale-110 shadow-sm border border-white/5`}>
              <item.icon className={`h-4 w-4 ${item.color}`} strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 px-5 pb-5">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              <AnimatedMetric value={item.value} isCurrency={item.isCurrency} />
            </div>
            {item.trend !== null && (
              <div className="flex items-center justify-between mt-1">
                <TrendIndicator value={item.trend} />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-2">vs last period</span>
              </div>
            )}
            {item.trend === null && (
              <div className="mt-3">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Current total</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
