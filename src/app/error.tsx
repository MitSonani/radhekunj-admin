'use client';

import { useEffect } from 'react';
import { Button } from '@/components/common/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-text">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        An unexpected error occurred. You can try again, or return to the dashboard.
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
