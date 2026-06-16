'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lead detail error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Lead</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Failed to load this lead&apos;s details. The lead may have been deleted or you may not have permission.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-500 mt-2 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Link href="/leads">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
