'use client';

import { LeadList } from '@/features/leads/components/LeadList';
import { CreateLeadDialog } from '@/features/leads/components/CreateLeadDialog';
import { ImportLeadsDialog } from '@/features/leads/components/ImportLeadsDialog';

export default function LeadsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Leads Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View, search, and manage your sales pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportLeadsDialog />
            <CreateLeadDialog />
          </div>
        </div>

        {/* Lead List Table */}
        <section>
          <LeadList />
        </section>
      </div>
    </div>
  );
}
