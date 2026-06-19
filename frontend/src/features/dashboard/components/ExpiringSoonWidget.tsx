'use client';

import { useLeads } from '@/features/leads/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { LeadAvatar } from '@/features/leads/components/LeadAvatar';

export function ExpiringSoonWidget() {
  const { data, isLoading, isError } = useLeads();

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl h-full flex flex-col mt-8">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="glass-card rounded-2xl h-full flex flex-col mt-8">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Failed to load expiring members</p>
        </CardContent>
      </Card>
    );
  }

  const leads = data?.data?.leads || [];
  
  // Calculate expiry dates for all leads and filter
  const today = new Date();
  
  interface ExpiryLead {
    id: string;
    first_name: string;
    last_name?: string | null;
    expiry_date?: string | null;
    service?: string | null;
    daysUntilExpiry?: number;
  }

  const expiringLeads = leads
    .filter((lead: ExpiryLead) => lead.expiry_date)
    .map((lead: ExpiryLead) => {
      const expiryDate = new Date(lead.expiry_date!);
      const daysUntilExpiry = differenceInDays(expiryDate, today);
      return { ...lead, expiryDate, daysUntilExpiry };
    })
    .filter((lead: ExpiryLead) => lead.daysUntilExpiry !== undefined && lead.daysUntilExpiry >= 0 && lead.daysUntilExpiry <= 30)
    .sort((a: ExpiryLead, b: ExpiryLead) => (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0))
    .slice(0, 5);

  return (
    <Card className="glass-card rounded-2xl h-full flex flex-col overflow-hidden mt-8">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Expiring Soon
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        {expiringLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <Clock className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">No Renewals Due</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
              No members are expiring in the next 30 days.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
            {expiringLeads.map((lead: ExpiryLead) => {
              const isUrgent = (lead.daysUntilExpiry || 0) <= 7;
              
              return (
                <Link 
                  key={lead.id} 
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LeadAvatar firstName={lead.first_name} lastName={lead.last_name} className="h-8 w-8 text-xs" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {lead.first_name} {lead.last_name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {lead.service || 'Basic Plan'}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {lead.daysUntilExpiry === 0 ? 'Today' : `In ${lead.daysUntilExpiry} days`}
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
