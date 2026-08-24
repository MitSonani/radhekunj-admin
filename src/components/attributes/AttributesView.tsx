'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { FormError } from '@/components/forms/FormError';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableActions } from '@/components/table/TableActions';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, ATTRIBUTE_CONSTRAINTS, PAGINATION } from '@/constants';
import { useAttributes } from '@/hooks/useAttributes';
import { useAttributeMutations } from '@/hooks/useAttributeMutations';
import type { Attribute } from '@/services/api';
import { ApiError } from '@/types/api';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function AttributesView() {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Attribute | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim().slice(0, ATTRIBUTE_CONSTRAINTS.SEARCH_MAX);
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
    }),
    [page, limit, search]
  );

  const { attributes, pagination, error, isLoading, refetch } = useAttributes(listParams);
  const { deleteAttribute, isDeleting, setError: setMutationError } = useAttributeMutations();

  const columns: DataTableColumn<Attribute>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => (
        <Link href={APP_ROUTES.attributeDetail(row.id)} className="font-medium text-text hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: (row) => <span className="font-mono text-text-secondary">{row.slug}</span>,
    },
    {
      id: 'valueCount',
      header: 'Values',
      className: 'whitespace-nowrap',
      cell: (row) => row.valueCount,
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
      cell: (row) => (
        <TableActions
          label={`Actions for ${row.name}`}
          actions={[
            {
              id: 'values',
              label: 'Manage values',
              onClick: () => router.push(APP_ROUTES.attributeDetail(row.id)),
            },
            {
              id: 'edit',
              label: 'Edit',
              onClick: () => router.push(APP_ROUTES.attributeEdit(row.id)),
            },
            {
              id: 'delete',
              label: 'Delete',
              variant: 'danger',
              onClick: () => {
                setActionError(null);
                setPendingDelete(row);
              },
            },
          ]}
        />
      ),
    },
  ];

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setActionError(null);
    setMutationError(null);

    try {
      await deleteAttribute(pendingDelete.id);
      setPendingDelete(null);

      if (attributes.length <= 1 && page > 1) {
        setPage(page - 1);
        return;
      }

      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The attribute could not be deleted.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Attributes"
        description="Global product attributes and their values. The Backend is the source of truth for names, slugs, and color codes."
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.DASHBOARD }, { label: 'Attributes' }]}
        actions={<Button onClick={() => router.push(APP_ROUTES.ATTRIBUTE_NEW)}>Add Attribute</Button>}
      />

      <div className="flex flex-col gap-4">
        <TableFilters>
          <div className="min-w-0 flex-1">
            <Input
              label="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={ATTRIBUTE_CONSTRAINTS.SEARCH_MAX}
              placeholder="Search by name or slug"
            />
          </div>
        </TableFilters>

        <FormError message={actionError} />

        <DataTable
          columns={columns}
          data={attributes}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyTitle={search ? 'No matching attributes' : 'No attributes yet'}
          emptyDescription={
            search
              ? 'Try a different search term.'
              : 'Add an attribute such as Size or Color to start defining product options.'
          }
          emptyActionLabel={search ? undefined : 'Add Attribute'}
          onEmptyAction={search ? undefined : () => router.push(APP_ROUTES.ATTRIBUTE_NEW)}
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
        open={pendingDelete !== null}
        onClose={() => {
          if (!isDeleting) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
        title="Delete attribute"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.name}"? Attributes with values cannot be deleted until those values are removed.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isConfirming={isDeleting}
      />
    </div>
  );
}
