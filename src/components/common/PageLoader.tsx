import { cn } from '@/lib/utils';
import { LoadingState } from './LoadingState';

interface PageLoaderProps {
  message?: string;
  /**
   * `content` fills the Admin main area (sidebar and header stay visible).
   * `app` covers the full viewport for session/auth initialization.
   */
  cover?: 'content' | 'app';
  className?: string;
}

/**
 * Full-page loading for route transitions, session checks, and page-level data.
 * Do not use for button actions, row mutations, or in-table fetches.
 */
export function PageLoader({ message = 'Loading...', cover = 'content', className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background',
        cover === 'app' ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
        className
      )}
      aria-busy="true"
    >
      <LoadingState message={message} className="min-h-0" />
    </div>
  );
}
