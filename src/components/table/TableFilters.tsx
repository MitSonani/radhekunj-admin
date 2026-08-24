import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableFiltersProps {
  children: ReactNode;
  className?: string;
}

export function TableFilters({ children, className }: TableFiltersProps) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-end', className)}>
      {children}
    </div>
  );
}
