'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, PAGINATION } from '@/constants';
import { useInventory } from '@/hooks/useInventory';
import { useInventoryDashboard } from '@/hooks/useInventoryDashboard';
import { useCategories } from '@/hooks/useCategories';
import type {
  InventoryListItem,
  InventoryListParams,
  StockStatus,
} from '@/types/inventory';
import {
  formatCurrency,
  formatDateTime,
  getStockStatusLabel,
  getStockStatusVariant,
} from './inventoryUtils';
import { InventoryDashboardCards } from './InventoryDashboardCards';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { ThresholdModal } from './ThresholdModal';
import { InventorySettingsModal } from './InventorySettingsModal';

type StockStatusFilter = 'ALL' | StockStatus;
type SortByOption = NonNullable<InventoryListParams['sortBy']>;

export function InventoryView() {
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortByOption>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [adjustmentVariant, setAdjustmentVariant] = useState<InventoryListItem | null>(null);
  const [thresholdVariant, setThresholdVariant] = useState<InventoryListItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Queries
  const queryParams = useMemo<InventoryListParams>(
    () => ({
      page,
      limit,
      search: search || undefined,
      stockStatus: statusFilter === 'ALL' ? undefined : statusFilter,
      categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
      sortBy,
      sortOrder,
    }),
    [page, limit, search, statusFilter, categoryFilter, sortBy, sortOrder]
  );

  const { items, pagination, isLoading, error, refetch } = useInventory(queryParams);
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useInventoryDashboard();
  const { categories } = useCategories({ page: 1, limit: 100 });

  // Auto-clear feedback after 6 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || sortBy !== 'updatedAt';

  const categoryOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Categories' }];
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat) => {
        list.push({ value: cat.id, label: cat.name });
      });
    }
    return list;
  }, [categories]);

  const columns = useMemo<DataTableColumn<InventoryListItem>[]>(
    () => [
      {
        id: 'product',
        header: 'Product & SKU',
        className: 'min-w-[260px]',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
              {row.productImage ? (
                <img
                  src={row.productImage}
                  alt={row.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-text-muted">
                  {row.productName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${row.productId}`}
                className="font-medium text-text hover:text-primary line-clamp-1 text-sm"
              >
                {row.productName}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-mono font-semibold text-text-secondary">{row.sku}</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">{row.category?.name || 'Category'}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'variant',
        header: 'Variant Attributes',
        className: 'min-w-[150px]',
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.attributes && row.attributes.length > 0 ? (
              row.attributes.map((av) => (
                <span
                  key={av.name}
                  className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 text-xs text-text-secondary border border-border"
                >
                  <strong className="mr-1 font-medium text-text">{av.name}:</strong> {av.value}
                </span>
              ))
            ) : (
              <span className="text-xs text-text-muted">Standard</span>
            )}
          </div>
        ),
      },
      {
        id: 'pricing',
        header: 'Price / Valuation',
        className: 'text-right min-w-[120px]',
        cell: (row) => {
          const unitPrice = parseFloat(row.price) || 0;
          return (
            <div className="text-right text-xs">
              <span className="font-medium text-text">{formatCurrency(unitPrice)}</span>
              <span className="block text-text-muted text-[11px]">
                Stock: {formatCurrency(unitPrice * row.quantity)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'stockBreakdown',
        header: 'Stock Breakdown',
        className: 'min-w-[140px]',
        cell: (row) => (
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Total Units:</span>
              <span className="font-semibold text-text">{row.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Reserved:</span>
              <span className={row.reservedQuantity > 0 ? 'font-semibold text-warning' : 'text-text-muted'}>
                {row.reservedQuantity}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'availableStock',
        header: 'Available Stock',
        className: 'text-center min-w-[120px]',
        cell: (row) => {
          const isZero = row.availableStock <= 0;
          const isLow = row.availableStock > 0 && row.availableStock <= row.lowStockThreshold;

          return (
            <div className="text-center">
              <span
                className={`text-base font-bold ${
                  isZero ? 'text-danger' : isLow ? 'text-warning' : 'text-success'
                }`}
              >
                {row.availableStock}
              </span>
              <span className="block text-[11px] text-text-muted">
                Alert Limit: {row.lowStockThreshold}
              </span>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Stock Status',
        className: 'min-w-[110px]',
        cell: (row) => (
          <Badge variant={getStockStatusVariant(row.stockStatus)}>
            {getStockStatusLabel(row.stockStatus)}
          </Badge>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Last Updated',
        className: 'min-w-[140px]',
        cell: (row) => (
          <span className="text-xs text-text-secondary">{formatDateTime(row.updatedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right min-w-[180px]',
        cell: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdjustmentVariant(row)}
              className="h-8 px-2.5 text-xs"
            >
              Adjust
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setThresholdVariant(row)}
              className="h-8 px-2 text-xs text-text-secondary hover:text-text"
              title="Configure variant threshold"
            >
              Threshold
            </Button>
            <Link
              href={`/inventory/movements?variantId=${row.variantId}`}
              className="inline-flex h-8 items-center rounded-md px-2 text-xs text-text-secondary hover:bg-surface-muted hover:text-text"
              title="View movement history"
            >
              History
            </Link>
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
        title="Inventory Management"
        description="Monitor real-time stock levels, reserve allocations, inventory valuation, and perform stock adjustments."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Inventory' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory/movements">
              <Button variant="outline" size="sm">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stock Movements
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                refetchDashboard();
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        }
      />

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3.5 text-sm shadow-xs transition-all ${
            feedbackMessage.type === 'success'
              ? 'border-success/30 bg-success-soft/30 text-success'
              : 'border-danger/30 bg-danger-soft/30 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dashboard KPI Summary Cards */}
      <InventoryDashboardCards
        data={dashboardData}
        isLoading={isDashboardLoading}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
      />

      {/* Filter Bar */}
      <TableFilters>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search by product name, SKU, or category..."
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

        {/* Category Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            options={categoryOptions}
          />
        </div>

        {/* Stock Status Filter */}
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StockStatusFilter);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Stock Statuses' },
              { value: 'IN_STOCK', label: 'In Stock' },
              { value: 'LOW_STOCK', label: 'Low Stock' },
              { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
            ]}
          />
        </div>

        {/* Sort By */}
        <div className="w-full sm:w-48">
          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortByOption);
              setPage(1);
            }}
            options={[
              { value: 'updatedAt', label: 'Recently Updated' },
              { value: 'stock', label: 'Stock: Total' },
              { value: 'availableStock', label: 'Stock: Available' },
              { value: 'name', label: 'Product Name' },
              { value: 'sku', label: 'SKU' },
              { value: 'price', label: 'Price' },
            ]}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
            Reset Filters
          </Button>
        )}
      </TableFilters>

      {/* Main Inventory DataTable */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={items}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No inventory records found"
          emptyDescription={
            hasActiveFilters
              ? 'No products or variants matched your filter criteria.'
              : 'There are no active inventory records in the catalog.'
          }
          emptyActionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onEmptyAction={hasActiveFilters ? handleClearFilters : undefined}
        />

        {/* Table Pagination */}
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

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={Boolean(adjustmentVariant)}
        variant={adjustmentVariant}
        onClose={() => setAdjustmentVariant(null)}
        onSuccess={(msg) => {
          setFeedbackMessage({ type: 'success', text: msg });
          refetch();
          refetchDashboard();
        }}
      />

      {/* Variant Low-Stock Threshold Modal */}
      <ThresholdModal
        open={Boolean(thresholdVariant)}
        variant={thresholdVariant}
        onClose={() => setThresholdVariant(null)}
        onSuccess={(msg) => {
          setFeedbackMessage({ type: 'success', text: msg });
          refetch();
          refetchDashboard();
        }}
      />

      {/* Store Inventory Settings Modal */}
      <InventorySettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={(msg) => {
          setFeedbackMessage({ type: 'success', text: msg });
          refetch();
          refetchDashboard();
        }}
      />
    </div>
  );
}
