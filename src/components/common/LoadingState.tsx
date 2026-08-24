import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingState({ message = 'Loading...', fullPage = false, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-6',
        fullPage ? 'fixed inset-0 z-50 bg-background/80' : 'min-h-[240px] w-full',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        {message && <p className="text-sm text-text-muted">{message}</p>}
      </div>
    </div>
  );
}
