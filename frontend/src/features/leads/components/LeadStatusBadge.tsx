import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '../types';
import { cn } from '@/lib/utils';

export function LeadStatusBadge({ status, className }: { status: LeadStatus, className?: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'NEW':
        return { 
          bg: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800', 
          dot: 'bg-slate-500',
          label: 'Paused'
        };
      case 'IN_PROGRESS':
        return { 
          bg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800', 
          dot: 'bg-orange-500',
          label: 'Expiring Soon'
        };
      case 'WON':
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', 
          dot: 'bg-emerald-500',
          label: 'Active'
        };
      case 'LOST':
        return { 
          bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', 
          dot: 'bg-rose-500',
          label: 'Expired'
        };
      default:
        return { 
          bg: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800', 
          dot: 'bg-slate-500',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn("rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1.5 border w-fit shadow-none", config.bg, className)}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
