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
import { APP_ROUTES, CATEGORY_CONSTRAINTS, CATEGORY_STATUS, PAGINATION } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryMutations } from '@/hooks/useCategoryMutations';
import type { Category, CategoryStatus } from '@/services/api';
import { ApiError } from '@/types/api';

type StatusFilter = 'ALL' | CategoryStatus;

type PendingAction =
  | { type: 'delete'; category: Category }
  | { type: 'status'; category: Category; status: CategoryStatus };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function CategoriesView() {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim().slice(0, CATEGORY_CONSTRAINTS.SEARCH_MAX);
      setSearch(nextSearch);
      setPage(PAGINATION.DEFAULT_PAGE);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
    [page, limit, search, statusFilter]
  );

  const { categories, pagination, error, isLoading, refetch } = useCategories(listParams);
  const { deleteCategory, updateCategory, isDeleting, isUpdating, setError: setMutationError } = useCategoryMutations();

  const hasFilters = Boolean(search) || statusFilter !== 'ALL';
  const isConfirming = isDeleting || isUpdating;

  const columns: DataTableColumn<Category>[] = [
    {
      id: 'image',
      header: 'Image',
      className: 'w-16',
      cell: (row) =>
        row.imageUrl ? (
          // Native img: category images come from Backend/S3 URLs that are not in next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.imageUrl} alt={row.name} className="h-10 w-10 rounded-md border border-border object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-md border border-border bg-surface-muted" aria-hidden="true" />
        ),
    },
    {
      id: 'name',
      header: 'Name',
      cell: (row) => (
        <div className="min-w-40">
          <p className="font-medium text-text">{row.name}</p>
          <p className="text-xs text-text-muted">{row.slug}</p>
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      className: 'max-w-xs',
      cell: (row) => <p className="line-clamp-2 text-text-secondary">{row.description || '—'}</p>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === CATEGORY_STATUS.ACTIVE ? 'success' : 'muted'}>
          {row.status === CATEGORY_STATUS.ACTIVE ? 'Active' : 'Inactive'}
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
          row.status === CATEGORY_STATUS.ACTIVE ? CATEGORY_STATUS.INACTIVE : CATEGORY_STATUS.ACTIVE;

        return (
          <TableActions
            label={`Actions for ${row.name}`}
            actions={[
              {
                id: 'edit',
                label: 'Edit',
                onClick: () => router.push(APP_ROUTES.categoryEdit(row.id)),
              },
              {
                id: 'status',
                label: nextStatus === CATEGORY_STATUS.ACTIVE ? 'Activate' : 'Deactivate',
                onClick: () => {
                  setActionError(null);
                  setPendingAction({ type: 'status', category: row, status: nextStatus });
                },
              },
              {
                id: 'delete',
                label: 'Delete',
                variant: 'danger',
                onClick: () => {
                  setActionError(null);
                  setPendingAction({ type: 'delete', category: row });
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
      if (pendingAction.type === 'delete') {
        await deleteCategory(pendingAction.category.id);
      } else {
        await updateCategory(pendingAction.category.id, { status: pendingAction.status });
      }

      setPendingAction(null);

      const remainingOnPage = pendingAction.type === 'delete' ? categories.length - 1 : categories.length;
      if (pendingAction.type === 'delete' && remainingOnPage <= 0 && page > 1) {
        setPage(page - 1);
        return;
      }

      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be completed.');
    }
  };

  const confirmTitle =
    pendingAction?.type === 'delete'
      ? 'Delete category'
      : pendingAction?.status === CATEGORY_STATUS.INACTIVE
        ? 'Deactivate category'
        : 'Activate category';

  const confirmDescription = pendingAction
    ? pendingAction.type === 'delete'
      ? `Delete "${pendingAction.category.name}"? This cannot be undone from the Admin Panel.`
      : pendingAction.status === CATEGORY_STATUS.INACTIVE
        ? `Deactivate "${pendingAction.category.name}"? It will no longer appear as active.`
        : `Activate "${pendingAction.category.name}"?`
    : '';

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Create and manage product categories. The Backend is the source of truth for names, slugs, images, and status."
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.DASHBOARD }, { label: 'Categories' }]}
        actions={
          <Button onClick={() => router.push(APP_ROUTES.CATEGORY_NEW)}>Add Category</Button>
        }
      />

      <div className="flex flex-col gap-4">
        <TableFilters>
          <div className="min-w-0 flex-1">
            <Input
              label="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={CATEGORY_CONSTRAINTS.SEARCH_MAX}
              placeholder="Search by name or slug"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: CATEGORY_STATUS.ACTIVE, label: 'Active' },
                { value: CATEGORY_STATUS.INACTIVE, label: 'Inactive' },
              ]}
            />
          </div>
        </TableFilters>

        <FormError message={actionError} />

        <DataTable
          columns={columns}
          data={categories}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyTitle={hasFilters ? 'No matching categories' : 'No categories yet'}
          emptyDescription={
            hasFilters
              ? 'Try a different search or status filter.'
              : 'Add a category to start organizing the catalog.'
          }
          emptyActionLabel={hasFilters ? undefined : 'Add Category'}
          onEmptyAction={hasFilters ? undefined : () => router.push(APP_ROUTES.CATEGORY_NEW)}
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
        confirmLabel={pendingAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        variant={pendingAction?.type === 'delete' ? 'danger' : 'primary'}
        isConfirming={isConfirming}
      />
    </div>
  );
}
