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
import {
  APP_ROUTES,
  COUPON_CONSTRAINTS,
  COUPON_DISCOUNT_TYPE,
  COUPON_SCOPE,
  COUPON_STATUS,
  COUPON_VALIDITY,
  PAGINATION,
} from '@/constants';
import { useCouponMutations } from '@/hooks/useCouponMutations';
import { useCoupons } from '@/hooks/useCoupons';
import type {
  CouponDiscountType,
  CouponListItem,
  CouponScope,
  CouponStatus,
  CouponValidity,
} from '@/services/api';
import { ApiError } from '@/types/api';
import { CouponCode } from './CouponCode';
import {
  displayStatusLabel,
  displayStatusVariant,
  formatDate,
  formatDiscount,
  formatScope,
  formatUsage,
  getDisplayStatus,
} from './couponFormUtils';

type StatusFilter = 'ALL' | CouponStatus;
type DiscountFilter = 'ALL' | CouponDiscountType;
type ScopeFilter = 'ALL' | CouponScope;
type ValidityFilter = 'ALL' | CouponValidity;

type PendingAction = { type: 'activate' | 'deactivate'; coupon: CouponListItem };

export function CouponsView() {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('ALL');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim().slice(0, COUPON_CONSTRAINTS.SEARCH_MAX);
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
      discountType: discountFilter === 'ALL' ? undefined : discountFilter,
      scope: scopeFilter === 'ALL' ? undefined : scopeFilter,
      validity: validityFilter === 'ALL' ? undefined : validityFilter,
    }),
    [page, limit, search, statusFilter, discountFilter, scopeFilter, validityFilter]
  );

  const { coupons, pagination, error, isLoading, refetch } = useCoupons(listParams);
  const { activateCoupon, deactivateCoupon, isActivating, isDeactivating, setError: setMutationError } =
    useCouponMutations();

  const hasFilters =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    discountFilter !== 'ALL' ||
    scopeFilter !== 'ALL' ||
    validityFilter !== 'ALL';
  const isConfirming = isActivating || isDeactivating;

  const columns: DataTableColumn<CouponListItem>[] = [
    {
      id: 'code',
      header: 'Code',
      cell: (row) => <CouponCode code={row.code} />,
    },
    {
      id: 'discount',
      header: 'Discount',
      cell: (row) => (
        <div className="min-w-28">
          <p className="text-text">{formatDiscount(row.discountType, row.discountValue)}</p>
          <p className="text-xs text-text-muted">
            {row.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE ? 'Percentage' : 'Fixed'}
          </p>
        </div>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      cell: (row) => formatScope(row.scope),
    },
    {
      id: 'usage',
      header: 'Usage',
      className: 'whitespace-nowrap',
      cell: (row) => formatUsage(row),
    },
    {
      id: 'expiry',
      header: 'Expiry',
      className: 'whitespace-nowrap',
      cell: (row) => formatDate(row.expiresAt),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const display = getDisplayStatus(row);
        return <Badge variant={displayStatusVariant(display)}>{displayStatusLabel(display)}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      cell: (row) => (
        <TableActions
          label={`Actions for ${row.code}`}
          actions={[
            {
              id: 'view',
              label: 'View',
              onClick: () => router.push(APP_ROUTES.couponDetail(row.id)),
            },
            {
              id: 'edit',
              label: 'Edit',
              onClick: () => router.push(APP_ROUTES.couponEdit(row.id)),
            },
            {
              id: 'status',
              label: row.status === COUPON_STATUS.ACTIVE ? 'Deactivate' : 'Activate',
              onClick: () => {
                setActionError(null);
                setPendingAction({
                  type: row.status === COUPON_STATUS.ACTIVE ? 'deactivate' : 'activate',
                  coupon: row,
                });
              },
            },
          ]}
        />
      ),
    },
  ];

  const handleConfirm = async () => {
    if (!pendingAction) {
      return;
    }

    setActionError(null);
    setMutationError(null);

    try {
      if (pendingAction.type === 'deactivate') {
        await deactivateCoupon(pendingAction.coupon.id);
      } else {
        await activateCoupon(pendingAction.coupon.id);
      }

      setPendingAction(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be completed.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Create and manage discount coupons. The Backend owns eligibility, discount calculation, and usage."
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.DASHBOARD }, { label: 'Coupons' }]}
        actions={<Button onClick={() => router.push(APP_ROUTES.COUPON_NEW)}>Create coupon</Button>}
      />

      <div className="flex flex-col gap-4">
        <TableFilters className="flex-wrap">
          <div className="min-w-0 flex-1 sm:min-w-56">
            <Input
              label="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={COUPON_CONSTRAINTS.SEARCH_MAX}
              placeholder="Search coupons..."
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
                { value: COUPON_STATUS.ACTIVE, label: 'Active' },
                { value: COUPON_STATUS.INACTIVE, label: 'Inactive' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Discount type"
              value={discountFilter}
              onChange={(event) => {
                setDiscountFilter(event.target.value as DiscountFilter);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All types' },
                { value: COUPON_DISCOUNT_TYPE.PERCENTAGE, label: 'Percentage' },
                { value: COUPON_DISCOUNT_TYPE.FIXED_AMOUNT, label: 'Fixed amount' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Scope"
              value={scopeFilter}
              onChange={(event) => {
                setScopeFilter(event.target.value as ScopeFilter);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All scopes' },
                { value: COUPON_SCOPE.CART, label: 'Entire cart' },
                { value: COUPON_SCOPE.PRODUCT, label: 'Products' },
                { value: COUPON_SCOPE.CATEGORY, label: 'Categories' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Schedule"
              value={validityFilter}
              onChange={(event) => {
                setValidityFilter(event.target.value as ValidityFilter);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
              options={[
                { value: 'ALL', label: 'All schedules' },
                { value: COUPON_VALIDITY.CURRENT, label: 'Current' },
                { value: COUPON_VALIDITY.UPCOMING, label: 'Upcoming' },
                { value: COUPON_VALIDITY.EXPIRED, label: 'Expired' },
              ]}
            />
          </div>
        </TableFilters>

        <FormError message={actionError} />

        <DataTable
          columns={columns}
          data={coupons}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyTitle={hasFilters ? 'No matching coupons' : 'No coupons created yet'}
          emptyDescription={
            hasFilters
              ? 'Try a different search or filter.'
              : 'Create a coupon to offer cart, product, or category discounts.'
          }
          emptyActionLabel={hasFilters ? undefined : 'Create coupon'}
          onEmptyAction={hasFilters ? undefined : () => router.push(APP_ROUTES.COUPON_NEW)}
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
        title={pendingAction?.type === 'deactivate' ? 'Deactivate coupon' : 'Activate coupon'}
        description={
          pendingAction?.type === 'deactivate'
            ? `Deactivate "${pendingAction.coupon.code}"? Customers will not be able to apply it. Usage history is kept.`
            : pendingAction
              ? `Activate "${pendingAction.coupon.code}"?`
              : ''
        }
        confirmLabel={pendingAction?.type === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={pendingAction?.type === 'deactivate' ? 'danger' : 'primary'}
        isConfirming={isConfirming}
      />
    </div>
  );
}
