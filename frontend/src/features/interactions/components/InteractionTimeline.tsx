'use client';

import { useInteractions } from '../hooks/useInteractions';
import { InteractionRenderer } from './InteractionRenderer';
import { CreateInteractionDialog } from './CreateInteractionDialog';
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InteractionTimeline({ leadId }: { leadId: string }) {
  const { data, isLoading, isError, refetch, isRefetching } = useInteractions(leadId);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Interactions</CardTitle>
        <CreateInteractionDialog leadId={leadId} />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm">Failed to load interactions.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              Retry
            </Button>
          </div>
        ) : !data?.data?.interactions || data.data.interactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border-2 border-dashed rounded-md p-6">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900 dark:text-slate-100">No interactions yet</p>
            <p className="text-sm mt-1 mb-4">Log a call, email, or meeting to start the timeline.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent mt-4">
            {data.data.interactions.map((interaction) => (
              <InteractionRenderer key={interaction.id} interaction={interaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
