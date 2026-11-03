'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, PAGINATION } from '@/constants';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';
import type {
  InventoryMovementListItem,
  InventoryMovementType,
} from '@/types/inventory';
import {
  formatDateTime,
  formatStockDelta,
  getMovementTypeLabel,
  getMovementTypeVariant,
} from './inventoryUtils';

type MovementTypeFilter = 'ALL' | InventoryMovementType;

export function InventoryMovementsView() {
  const searchParams = useSearchParams();
  const initialVariantId = searchParams.get('variantId') || '';

  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementTypeFilter>('ALL');
  const [variantIdFilter, setVariantIdFilter] = useState<string>(initialVariantId);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      variantId: variantIdFilter || undefined,
    }),
    [page, limit, search, typeFilter, variantIdFilter]
  );

  const { movements, pagination, isLoading, error, refetch } = useInventoryMovements(queryParams);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('ALL');
    setVariantIdFilter('');
    setPage(1);
  };

  const hasActiveFilters = search !== '' || typeFilter !== 'ALL' || variantIdFilter !== '';

  const columns = useMemo<DataTableColumn<InventoryMovementListItem>[]>(
    () => [
      {
        id: 'timestamp',
        header: 'Date & Time',
        className: 'min-w-[140px]',
        cell: (row) => (
          <div className="text-xs">
            <span className="font-medium text-text">{formatDateTime(row.createdAt)}</span>
          </div>
        ),
      },
      {
        id: 'product',
        header: 'Product Variant',
        className: 'min-w-[220px]',
        cell: (row) => (
          <div className="space-y-0.5">
            <div className="font-medium text-text text-xs line-clamp-1">
              {row.productName || 'Product Variant'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span className="font-mono font-semibold text-text-secondary">
                {row.sku || '—'}
              </span>
              {row.attributes && row.attributes.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {row.attributes.map((av) => `${av.value}`).join(' / ')}
                  </span>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Movement Type',
        className: 'min-w-[150px]',
        cell: (row) => (
          <Badge variant={getMovementTypeVariant(row.type)}>
            {getMovementTypeLabel(row.type)}
          </Badge>
        ),
      },
      {
        id: 'delta',
        header: 'Stock Delta',
        className: 'text-center min-w-[100px]',
        cell: (row) => (
          <div className="text-center">
            <span
              className={`font-bold font-mono text-sm ${
                row.quantityChange > 0
                  ? 'text-success'
                  : row.quantityChange < 0
                  ? 'text-danger'
                  : 'text-text-muted'
              }`}
            >
              {formatStockDelta(row.quantityChange)}
            </span>
          </div>
        ),
      },
      {
        id: 'balance',
        header: 'Stock Balance',
        className: 'min-w-[130px]',
        cell: (row) => (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 font-mono">
              <span className="text-text-muted">{row.previousQuantity}</span>
              <span className="text-text-muted">→</span>
              <span className="font-semibold text-text">{row.newQuantity}</span>
            </div>
            {row.reservedChange !== 0 && (
              <div className="text-[10px] text-warning font-mono">
                Res: {row.previousReserved} → {row.newReserved} ({formatStockDelta(row.reservedChange)})
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'reference',
        header: 'Source / Reference',
        className: 'min-w-[170px]',
        cell: (row) => (
          <div className="text-xs space-y-0.5">
            <div className="font-mono text-text font-medium text-[11px]">
              {row.referenceType ? (
                <span className="rounded bg-surface-muted px-1.5 py-0.5 border border-border mr-1">
                  {row.referenceType}
                </span>
              ) : null}
              {row.referenceId || 'Manual Action'}
            </div>
          </div>
        ),
      },
      {
        id: 'reason',
        header: 'Reason & Notes',
        className: 'min-w-[200px]',
        cell: (row) => (
          <div className="text-xs space-y-0.5">
            <span className="font-medium text-text">{row.reason || '—'}</span>
          </div>
        ),
      },
      {
        id: 'admin',
        header: 'Performed By',
        className: 'min-w-[140px]',
        cell: (row) => (
          <div className="text-xs">
            {row.admin ? (
              <div>
                <span className="font-medium text-text block">{row.admin.name}</span>
                {row.admin.mobileNumber && (
                  <span className="text-[11px] text-text-muted">{row.admin.mobileNumber}</span>
                )}
              </div>
            ) : (
              <span className="text-text-muted italic">System Automated</span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Stock Movement Audit History"
        description="Chronological audit log of all inventory receipts, order commitments, cancellations, releases, and administrator adjustments."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Inventory', href: APP_ROUTES.INVENTORY },
          { label: 'Movements' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={APP_ROUTES.INVENTORY}>
              <Button variant="outline" size="sm">
                ← Back to Inventory
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <TableFilters>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search by SKU, product name, reason, or order reference..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-16"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Movement Type Filter */}
        <div className="w-full sm:w-56">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as MovementTypeFilter);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Movement Types' },
              { value: 'STOCK_RECEIVED', label: 'Stock Received' },
              { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
              { value: 'STOCK_CORRECTION', label: 'Stock Correction' },
              { value: 'ORDER_PLACED', label: 'Order Placed' },
              { value: 'ORDER_RESERVED', label: 'Order Reserved' },
              { value: 'ORDER_RELEASED', label: 'Order Released' },
              { value: 'ORDER_CANCELLED', label: 'Order Cancelled' },
              { value: 'REFUND_RESTOCKED', label: 'Refund Restocked' },
            ]}
          />
        </div>

        {variantIdFilter && (
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary">
            <span>Filtered by variant</span>
            <button
              type="button"
              onClick={() => {
                setVariantIdFilter('');
                setPage(1);
              }}
              className="text-text hover:text-danger font-semibold ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
            Reset Filters
          </Button>
        )}
      </TableFilters>

      {/* Audit DataTable */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={movements}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No stock movements recorded"
          emptyDescription={
            hasActiveFilters
              ? 'No movements matched your query filters.'
              : 'There are no recorded stock movements in the system yet.'
          }
          emptyActionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onEmptyAction={hasActiveFilters ? handleClearFilters : undefined}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
