import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span>Rows per page</span>
        <Select
          aria-label="Rows per page"
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
          className="w-20"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className="min-w-20 text-center text-sm text-text-secondary">
          {page} of {safeTotalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= safeTotalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
