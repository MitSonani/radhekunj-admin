import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function EmptyState({
  title = 'Nothing to display',
  description = 'There is no data to show yet.',
  actionLabel,
  onActionClick,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-[280px] w-full flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-4 text-text-muted">
        {icon || (
          <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 1.5 7.5V6A2.25 2.25 0 0 1 3.75 3.75h16.5A2.25 2.25 0 0 1 22.5 6v1.5a2.25 2.25 0 0 1-2.25 2.25m-16.5 0v7.5A2.25 2.25 0 0 0 6 19.5h12a2.25 2.25 0 0 0 2.25-2.25v-7.5"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-text-muted">{description}</p>}
      {actionLabel && onActionClick && (
        <Button className="mt-5" variant="primary" size="sm" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
