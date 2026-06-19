'use client';

import { useLeads } from '@/features/leads/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChevronRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  NEW: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  WON: { label: 'Won', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  LOST: { label: 'Lost', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

export function RecentLeadsWidget() {
  const { data, isLoading, isError } = useLeads();

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recent Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="glass-card rounded-2xl h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recent Members
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Failed to load recent members</p>
        </CardContent>
      </Card>
    );
  }

  const leads = data?.data?.leads || [];
  const recentLeads = leads.slice(0, 5);

  return (
    <Card className="glass-card rounded-2xl h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Recent Members
        </CardTitle>
        <Link href="/leads" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center hover:underline">
          View all <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <Inbox className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">No Members Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mb-6">
              Add your first member to start tracking memberships.
            </p>
            <Link href="/leads">
              <Button size="sm" className="rounded-full shadow-sm active:scale-[0.98] transition-transform">
                Add Member
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentLeads.map((lead: { id: string; status: string; first_name: string; last_name?: string | null; created_at: string }) => {
              const status = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.NEW;
              
              return (
                <Link 
                  key={lead.id} 
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {lead.first_name} {lead.last_name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${status.color}`}>
                    {status.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
