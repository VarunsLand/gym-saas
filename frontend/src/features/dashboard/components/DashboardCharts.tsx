'use client';

import { useLeads } from '@/features/leads/hooks/useLeads';
import { Lead } from '@/features/leads/types';
import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import { Loader2 } from 'lucide-react';

// Color palette matching the existing premium design system
const STATUS_COLORS = {
  NEW: { color: '#8b5cf6', hover: '#7c3aed' },         // Violet
  IN_PROGRESS: { color: '#f59e0b', hover: '#d97706' }, // Amber
  WON: { color: '#22d3ee', hover: '#06b6d4' },         // Cyan
  LOST: { color: '#ef4444', hover: '#dc2626' },        // Red
};

export function DashboardCharts() {
  const { data, isLoading } = useLeads();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] h-80 flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ))}
      </div>
    );
  }

  const leads: Lead[] = data?.data?.leads || [];

  // Derive exact status counts from real lead data
  const counts = {
    NEW: leads.filter((l) => l.status === 'NEW').length,
    IN_PROGRESS: leads.filter((l) => l.status === 'IN_PROGRESS').length,
    WON: leads.filter((l) => l.status === 'WON').length,
    LOST: leads.filter((l) => l.status === 'LOST').length,
  };

  const segments = [
    {
      label: 'New',
      value: counts.NEW,
      color: STATUS_COLORS.NEW.color,
      hoverColor: STATUS_COLORS.NEW.hover,
    },
    {
      label: 'In Progress',
      value: counts.IN_PROGRESS,
      color: STATUS_COLORS.IN_PROGRESS.color,
      hoverColor: STATUS_COLORS.IN_PROGRESS.hover,
    },
    {
      label: 'Won',
      value: counts.WON,
      color: STATUS_COLORS.WON.color,
      hoverColor: STATUS_COLORS.WON.hover,
    },
    {
      label: 'Lost',
      value: counts.LOST,
      color: STATUS_COLORS.LOST.color,
      hoverColor: STATUS_COLORS.LOST.hover,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DonutChart
        segments={segments}
        title="Lead Status Distribution"
      />
      <BarChart
        segments={segments}
        title="Lead Status Comparison"
      />
    </div>
  );
}
