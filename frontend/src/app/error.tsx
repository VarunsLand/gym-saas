'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Something went wrong</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-500 mt-2 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
