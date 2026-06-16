import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '../types';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">New</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">In Progress</Badge>;
    case 'WON':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Won</Badge>;
    case 'LOST':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">Lost</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
