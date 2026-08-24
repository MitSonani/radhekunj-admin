'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageLoader } from '@/components/common/PageLoader';
import { FormError } from '@/components/forms/FormError';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableActions } from '@/components/table/TableActions';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { AttributeValueForm } from './AttributeValueForm';
import { APP_ROUTES, ATTRIBUTE_CONSTRAINTS, PAGINATION } from '@/constants';
import { useAttribute } from '@/hooks/useAttribute';
import { useAttributeMutations } from '@/hooks/useAttributeMutations';
import { useAttributeValueMutations } from '@/hooks/useAttributeValueMutations';
import { useAttributeValues } from '@/hooks/useAttributeValues';
import {
  attributeSupportsColor,
  type AttributeValue,
  type CreateAttributeValuePayload,
  type UpdateAttributeValuePayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

interface AttributeDetailViewProps {
  attributeId: string;
}

type ValueModal = { mode: 'create' } | { mode: 'edit'; value: AttributeValue };

function ColorSwatch({ colorCode }: { colorCode: string | null }) {
  if (!colorCode) {
    return <span className="text-text-muted">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-5 w-5 rounded-sm border border-border"
        style={{ backgroundColor: colorCode }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-text-secondary">{colorCode}</span>
    </span>
  );
}

export function AttributeDetailView({ attributeId }: AttributeDetailViewProps) {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [valueModal, setValueModal] = useState<ValueModal | null>(null);
  const [pendingDeleteValue, setPendingDeleteValue] = useState<AttributeValue | null>(null);
  const [pendingDeleteAttribute, setPendingDeleteAttribute] = useState(false);
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

  const { attribute, error: attributeError, isLoading: isAttributeLoading, refetch: refetchAttribute } =
    useAttribute(attributeId);
  const { values, pagination, error: valuesError, isLoading: isValuesLoading, refetch: refetchValues } =
    useAttributeValues(attributeId, listParams);
  const {
    deleteAttribute,
    isDeleting: isDeletingAttribute,
    setError: setAttributeMutationError,
  } = useAttributeMutations();
  const {
    createValue,
    updateValue,
    deleteValue,
    isCreating,
    isUpdating,
    isDeleting: isDeletingValue,
    error: valueMutationError,
    setError: setValueMutationError,
  } = useAttributeValueMutations();

  const supportsColor = attribute ? attributeSupportsColor(attribute, values) : false;
  const isValueBusy = isCreating || isUpdating;

  const columns: DataTableColumn<AttributeValue>[] = [
    ...(supportsColor
      ? [
          {
            id: 'colorCode',
            header: 'Color',
            className: 'w-40',
            cell: (row: AttributeValue) => <ColorSwatch colorCode={row.colorCode} />,
          },
        ]
      : []),
    {
      id: 'value',
      header: 'Value',
      cell: (row) => <span className="font-medium text-text">{row.value}</span>,
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: (row) => <span className="font-mono text-text-secondary">{row.slug}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      cell: (row) => (
        <TableActions
          label={`Actions for ${row.value}`}
          actions={[
            {
              id: 'edit',
              label: 'Edit',
              onClick: () => {
                setActionError(null);
                setValueMutationError(null);
                setValueModal({ mode: 'edit', value: row });
              },
            },
            {
              id: 'delete',
              label: 'Delete',
              variant: 'danger',
              onClick: () => {
                setActionError(null);
                setPendingDeleteValue(row);
              },
            },
          ]}
        />
      ),
    },
  ];

  const refreshAfterValueChange = async (deletedFromPage = false) => {
    if (deletedFromPage && values.length <= 1 && page > 1) {
      setPage(page - 1);
      await refetchAttribute();
      return;
    }

    await Promise.all([refetchValues(), refetchAttribute()]);
  };

  const handleCreateValue = async (payload: CreateAttributeValuePayload) => {
    await createValue(attributeId, payload);
    setValueModal(null);
    await refreshAfterValueChange();
  };

  const handleUpdateValue = async (payload: UpdateAttributeValuePayload) => {
    if (valueModal?.mode !== 'edit') {
      return;
    }

    await updateValue(attributeId, valueModal.value.id, payload);
    setValueModal(null);
    await refreshAfterValueChange();
  };

  const handleConfirmDeleteValue = async () => {
    if (!pendingDeleteValue) {
      return;
    }

    setActionError(null);
    setValueMutationError(null);

    try {
      await deleteValue(attributeId, pendingDeleteValue.id);
      setPendingDeleteValue(null);
      await refreshAfterValueChange(true);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The value could not be deleted.');
    }
  };

  const handleConfirmDeleteAttribute = async () => {
    setActionError(null);
    setAttributeMutationError(null);

    try {
      await deleteAttribute(attributeId);
      setPendingDeleteAttribute(false);
      router.push(APP_ROUTES.ATTRIBUTES);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The attribute could not be deleted.');
    }
  };

  if (isAttributeLoading) {
    return <PageLoader message="Loading attribute..." />;
  }

  if (attributeError || !attribute) {
    return (
      <div>
        <PageHeader
          title="Attribute"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Attributes', href: APP_ROUTES.ATTRIBUTES },
          ]}
        />
        <ErrorState
          title="Unable to load attribute"
          message={attributeError || 'Attribute not found'}
          onRetry={() => void refetchAttribute()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={attribute.name}
        description={`Slug: ${attribute.slug}. ${attribute.valueCount} ${attribute.valueCount === 1 ? 'value' : 'values'}.`}
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Attributes', href: APP_ROUTES.ATTRIBUTES },
          { label: attribute.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(APP_ROUTES.attributeEdit(attribute.id))}>
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setActionError(null);
                setPendingDeleteAttribute(true);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                setActionError(null);
                setValueMutationError(null);
                setValueModal({ mode: 'create' });
              }}
            >
              Add value
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <TableFilters>
          <div className="min-w-0 flex-1">
            <Input
              label="Search values"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={ATTRIBUTE_CONSTRAINTS.SEARCH_MAX}
              placeholder="Search by value or slug"
            />
          </div>
        </TableFilters>

        <FormError message={actionError} />

        <DataTable
          columns={columns}
          data={values}
          getRowId={(row) => row.id}
          isLoading={isValuesLoading}
          error={valuesError}
          onRetry={() => void refetchValues()}
          emptyTitle={search ? 'No matching values' : 'No values yet'}
          emptyDescription={
            search
              ? 'Try a different search term.'
              : `Add values for ${attribute.name} so they can be used on products.`
          }
          emptyActionLabel={search ? undefined : 'Add value'}
          onEmptyAction={
            search
              ? undefined
              : () => {
                  setActionError(null);
                  setValueMutationError(null);
                  setValueModal({ mode: 'create' });
                }
          }
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

      <Modal
        open={valueModal !== null}
        onClose={() => {
          if (!isValueBusy) {
            setValueModal(null);
          }
        }}
        title={valueModal?.mode === 'edit' ? 'Edit value' : 'Add value'}
      >
        {valueModal && (
          <AttributeValueForm
            key={valueModal.mode === 'edit' ? valueModal.value.id : 'create'}
            mode={valueModal.mode}
            supportsColor={supportsColor}
            initialValue={valueModal.mode === 'edit' ? valueModal.value : undefined}
            isSubmitting={isValueBusy}
            error={valueMutationError}
            onCancel={() => setValueModal(null)}
            onCreate={handleCreateValue}
            onUpdate={handleUpdateValue}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDeleteValue !== null}
        onClose={() => {
          if (!isDeletingValue) {
            setPendingDeleteValue(null);
          }
        }}
        onConfirm={() => void handleConfirmDeleteValue()}
        title="Delete value"
        description={
          pendingDeleteValue
            ? `Delete "${pendingDeleteValue.value}" from ${attribute.name}? This cannot be undone from the Admin Panel.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isConfirming={isDeletingValue}
      />

      <ConfirmDialog
        open={pendingDeleteAttribute}
        onClose={() => {
          if (!isDeletingAttribute) {
            setPendingDeleteAttribute(false);
          }
        }}
        onConfirm={() => void handleConfirmDeleteAttribute()}
        title="Delete attribute"
        description={`Delete "${attribute.name}"? Attributes with values cannot be deleted until those values are removed.`}
        confirmLabel="Delete"
        variant="danger"
        isConfirming={isDeletingAttribute}
      />
    </div>
  );
}
