'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { FormError } from '@/components/forms/FormError';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableActions } from '@/components/table/TableActions';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, PAGINATION, PRODUCT_CONSTRAINTS, PRODUCT_STATUS } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useProducts } from '@/hooks/useProducts';
import type { ProductListItem, ProductStatus } from '@/services/api';
import { ApiError } from '@/types/api';
import { formatDate, formatPrice } from './productFormUtils';

type StatusFilter = 'ALL' | ProductStatus;

type PendingAction = { product: ProductListItem; status: ProductStatus };

export function ProductsView() {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [sku, setSku] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim().slice(0, PRODUCT_CONSTRAINTS.SEARCH_MAX));
      setSku(skuInput.trim().slice(0, PRODUCT_CONSTRAINTS.SKU_MAX));
      setPage(PAGINATION.DEFAULT_PAGE);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, skuInput]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      sku: sku || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
    }),
    [page, limit, search, sku, statusFilter, categoryId]
  );

  const { products, pagination, error, isLoading, refetch } = useProducts(listParams);
  const { categories } = useCategories({ page: 1, limit: PAGINATION.MAX_LIMIT });
  const { updateProduct, isUpdating, setError: setMutationError } = useProductMutations();

  const hasFilters = Boolean(search) || Boolean(sku) || statusFilter !== 'ALL' || categoryId !== 'ALL';
  const isConfirming = isUpdating;

  const columns: DataTableColumn<ProductListItem>[] = [
    {
      id: 'image',
      header: 'Image',
      className: 'w-16',
      cell: (row) =>
        row.primaryImage?.imageUrl ? (
          // Native img: product images come from Backend/S3 URLs that are not in next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.primaryImage.imageUrl}
            alt={row.primaryImage.altText || row.name}
            className="h-10 w-10 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border border-border bg-surface-muted" aria-hidden="true" />
        ),
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row) => (
        <div className="min-w-40">
          <p className="font-medium text-text">{row.name}</p>
          <p className="text-xs text-text-muted">{row.slug}</p>
          <p className="text-xs text-text-secondary">{formatPrice(row.basePrice)}</p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row) => row.category?.name || '—',
    },
    {
      id: 'variants',
      header: 'Variants',
      cell: (row) => row.variantCount,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === PRODUCT_STATUS.ACTIVE ? 'success' : 'muted'}>
          {row.status === PRODUCT_STATUS.ACTIVE ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      className: 'whitespace-nowrap',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      cell: (row) => {
        const nextStatus =
          row.status === PRODUCT_STATUS.ACTIVE ? PRODUCT_STATUS.INACTIVE : PRODUCT_STATUS.ACTIVE;

        return (
          <TableActions
            label={`Actions for ${row.name}`}
            actions={[
              {
                id: 'view',
                label: 'View',
                onClick: () => router.push(APP_ROUTES.productDetail(row.id)),
              },
              {
                id: 'edit',
                label: 'Edit',
                onClick: () => router.push(APP_ROUTES.productEdit(row.id)),
              },
              {
                id: 'status',
                label: nextStatus === PRODUCT_STATUS.ACTIVE ? 'Activate' : 'Deactivate',
                onClick: () => {
                  setActionError(null);
                  setPendingAction({ product: row, status: nextStatus });
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const handleConfirm = async () => {
    if (!pendingAction) {
      return;
    }

    setActionError(null);
    setMutationError(null);

    try {
      await updateProduct(pendingAction.product.id, { status: pendingAction.status });

      setPendingAction(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be completed.');
    }
  };

  const confirmTitle = pendingAction?.status === PRODUCT_STATUS.INACTIVE ? 'Deactivate product' : 'Activate product';

  const confirmDescription = pendingAction
    ? pendingAction.status === PRODUCT_STATUS.INACTIVE
      ? `Deactivate "${pendingAction.product.name}"? Variants, inventory, and images are kept.`
      : `Activate "${pendingAction.product.name}"?`
    : '';

  return (
    <div>
      <PageHeader
        title="Products"
        description="Create and manage catalog products, variants, SKUs, inventory, and images. The Backend is the source of truth."
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.DASHBOARD }, { label: 'Products' }]}
        actions={<Button onClick={() => router.push(APP_ROUTES.PRODUCT_NEW)}>Add Product</Button>}
      />

      <div className="flex flex-col gap-4">
        <TableFilters>
          <div className="min-w-0 flex-1">
            <Input
              label="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={PRODUCT_CONSTRAINTS.SEARCH_MAX}
              placeholder="Search products..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All categories' },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: PRODUCT_STATUS.ACTIVE, label: 'Active' },
                { value: PRODUCT_STATUS.INACTIVE, label: 'Inactive' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Input
              label="SKU"
              value={skuInput}
              onChange={(event) => setSkuInput(event.target.value)}
              maxLength={PRODUCT_CONSTRAINTS.SKU_MAX}
              placeholder="Filter by SKU"
            />
          </div>
        </TableFilters>

        <FormError message={actionError} />

        <DataTable
          columns={columns}
          data={products}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyTitle={hasFilters ? 'No matching products' : 'No products yet'}
          emptyDescription={
            hasFilters
              ? 'Try a different search or filter.'
              : 'Add a product to start building the catalog.'
          }
          emptyActionLabel={hasFilters ? undefined : 'Add Product'}
          onEmptyAction={hasFilters ? undefined : () => router.push(APP_ROUTES.PRODUCT_NEW)}
        />

        {pagination.total > 0 && (
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        onClose={() => {
          if (!isConfirming) {
            setPendingAction(null);
          }
        }}
        onConfirm={() => void handleConfirm()}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Confirm"
        variant={pendingAction?.status === PRODUCT_STATUS.INACTIVE ? 'danger' : 'primary'}
        isConfirming={isConfirming}
      />
    </div>
  );
}
