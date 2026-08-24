import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records to display.',
  emptyActionLabel,
  onEmptyAction,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState message="Loading records..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load records" message={error} onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onActionClick={onEmptyAction}
      />
    );
  }

  return (
    <div className={cn('rounded-lg border border-border bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/70">
            <tr>
              {columns.map((column) => (
                <th key={column.id} className={cn('px-4 py-2.5 font-medium text-text-secondary', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={getRowId(row)} className="border-b border-border last:border-b-0 hover:bg-surface-muted/50">
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-4 py-3 text-text', column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
