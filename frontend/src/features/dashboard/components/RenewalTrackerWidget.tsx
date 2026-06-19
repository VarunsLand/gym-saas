'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, AlertCircle, CalendarClock, CalendarX } from 'lucide-react';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { format, differenceInDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RenewMembershipDialog } from './RenewMembershipDialog';

export function RenewalTrackerWidget() {
  interface RenewalLead {
    id: string;
    first_name: string;
    last_name?: string | null;
    expiry_date?: string | null;
    service?: string | null;
  }

  const { data: leadsData, isLoading } = useLeads();
  const leads: RenewalLead[] = leadsData?.data?.leads || [];

  const [selectedMember, setSelectedMember] = React.useState<RenewalLead | null>(null);
  const [isRenewOpen, setIsRenewOpen] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter members that have an expiry_date
  const expiringMembers = leads.filter(lead => lead.expiry_date);

  const urgentRenewals = expiringMembers.filter(lead => {
    const expiry = new Date(lead.expiry_date!);
    const days = differenceInDays(expiry, today);
    return days >= 0 && days <= 7;
  }).sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  const upcomingRenewals = expiringMembers.filter(lead => {
    const expiry = new Date(lead.expiry_date!);
    const days = differenceInDays(expiry, today);
    return days > 7 && days <= 30;
  }).sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  const expiredMembers = expiringMembers.filter(lead => {
    const expiry = new Date(lead.expiry_date!);
    return differenceInDays(expiry, today) < 0;
  }).sort((a, b) => new Date(b.expiry_date!).getTime() - new Date(a.expiry_date!).getTime());

  const handleRenewClick = (member: RenewalLead) => {
    setSelectedMember(member);
    setIsRenewOpen(true);
  };

  const renderMemberList = (members: RenewalLead[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {members.map(member => {
          const expiry = new Date(member.expiry_date!);
          const daysDiff = differenceInDays(expiry, today);
          
          let statusText = '';
          let statusColor = '';

          if (daysDiff < 0) {
            statusText = `Expired ${Math.abs(daysDiff)} days ago`;
            statusColor = 'text-rose-400 bg-rose-400/10 border-rose-400/20';
          } else if (daysDiff === 0) {
            statusText = 'Expires Today';
            statusColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
          } else {
            statusText = `Expires in ${daysDiff} days`;
            statusColor = daysDiff <= 7 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
          }

          return (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
              <div className="flex flex-col">
                <span className="font-medium text-slate-200">{member.first_name} {member.last_name}</span>
                <span className="text-xs text-slate-400 mt-0.5">{member.service || 'No Plan'} • {format(expiry, 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full border hidden sm:inline-block ${statusColor}`}>
                  {statusText}
                </span>
                <Button 
                  size="sm" 
                  className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                  onClick={() => handleRenewClick(member)}
                >
                  Renew
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="glass-card h-full rounded-3xl overflow-hidden border border-white/5 relative flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-base font-semibold text-slate-100 flex items-center">
          <CalendarCheck className="w-5 h-5 mr-2 text-indigo-400" />
          Renewal Management
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 relative z-10 flex flex-col">
        <Tabs defaultValue="urgent" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-900/50 border border-white/5 p-1 rounded-xl mb-4">
            <TabsTrigger value="urgent" className="rounded-lg data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Urgent ({urgentRenewals.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-xs sm:text-sm">
              <CalendarClock className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Upcoming ({upcomingRenewals.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-slate-300 text-xs sm:text-sm">
              <CalendarX className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Expired ({expiredMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="urgent" className="m-0 mt-2">
            {renderMemberList(urgentRenewals, "No urgent renewals in the next 7 days")}
          </TabsContent>
          <TabsContent value="upcoming" className="m-0 mt-2">
            {renderMemberList(upcomingRenewals, "No upcoming renewals between 7 and 30 days")}
          </TabsContent>
          <TabsContent value="expired" className="m-0 mt-2">
            {renderMemberList(expiredMembers, "No expired members found")}
          </TabsContent>
        </Tabs>
      </CardContent>

      <RenewMembershipDialog 
        open={isRenewOpen} 
        onOpenChange={setIsRenewOpen} 
        member={selectedMember} 
      />
    </Card>
  );
}
