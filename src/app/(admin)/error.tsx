'use client';

import { useEffect } from 'react';
import { Button } from '@/components/common/Button';

export default function AdminError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-text">Unable to load this page</h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">An unexpected error occurred. You can try again.</p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
