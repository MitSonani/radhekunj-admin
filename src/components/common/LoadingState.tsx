import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Inline/section loading for tables and nested UI.
 * Use PageLoader for full page, route, or session loading.
 */
export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex min-h-[240px] w-full items-center justify-center p-6', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-8 w-8" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary motion-reduce:animate-none motion-reduce:border-primary/40 motion-reduce:border-t-primary" />
        </div>
        {message && <p className="text-sm text-text-muted">{message}</p>}
      </div>
    </div>
  );
}
