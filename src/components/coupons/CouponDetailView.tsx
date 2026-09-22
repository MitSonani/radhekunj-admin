'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { FormError } from '@/components/forms/FormError';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, COUPON_STATUS, PAGINATION } from '@/constants';
import { useCoupon } from '@/hooks/useCoupon';
import { useCouponMutations } from '@/hooks/useCouponMutations';
import { useCouponUsages } from '@/hooks/useCouponUsages';
import type { CouponUsage } from '@/services/api';
import { ApiError } from '@/types/api';
import { CouponCode } from './CouponCode';
import {
  displayStatusLabel,
  displayStatusVariant,
  formatDateTime,
  formatDiscount,
  formatDiscountType,
  formatPrice,
  formatScope,
  formatUsage,
  getDisplayStatus,
} from './couponFormUtils';

interface CouponDetailViewProps {
  couponId: string;
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-text">{children}</div>
    </div>
  );
}

export function CouponDetailView({ couponId }: CouponDetailViewProps) {
  const router = useRouter();
  const { coupon, error: loadError, isLoading, refetch } = useCoupon(couponId);
  const { activateCoupon, deactivateCoupon, isActivating, isDeactivating, setError: setMutationError } =
    useCouponMutations();
  const [usagePage, setUsagePage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [usageLimit, setUsageLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'INACTIVE' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    usages,
    pagination: usagePagination,
    error: usageError,
    isLoading: usagesLoading,
    refetch: refetchUsages,
  } = useCouponUsages(couponId, { page: usagePage, limit: usageLimit });

  const isConfirming = isActivating || isDeactivating;

  const handleConfirm = async () => {
    if (!coupon || !pendingStatus) {
      return;
    }

    setActionError(null);
    setMutationError(null);

    try {
      if (pendingStatus === COUPON_STATUS.INACTIVE) {
        await deactivateCoupon(coupon.id);
      } else {
        await activateCoupon(coupon.id);
      }

      setPendingStatus(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be completed.');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading coupon..." />;
  }

  if (loadError || !coupon) {
    return (
      <div>
        <PageHeader
          title="Coupon"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Coupons', href: APP_ROUTES.COUPONS },
            { label: 'Detail' },
          ]}
        />
        <ErrorState title="Unable to load coupon" message={loadError || 'Coupon not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  const display = getDisplayStatus(coupon);
  const usageColumns: DataTableColumn<CouponUsage>[] = [
    {
      id: 'createdAt',
      header: 'Redeemed',
      className: 'whitespace-nowrap',
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      id: 'discountAmount',
      header: 'Discount',
      cell: (row) => formatPrice(String(row.discountAmount)),
    },
    {
      id: 'userId',
      header: 'Customer',
      cell: (row) => <span className="font-mono text-xs text-text-secondary">{row.userId}</span>,
    },
    {
      id: 'orderId',
      header: 'Order',
      cell: (row) =>
        row.orderId ? <span className="font-mono text-xs text-text-secondary">{row.orderId}</span> : '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title={coupon.code}
        description="Coupon configuration and usage. Discount calculation stays on the Backend."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Coupons', href: APP_ROUTES.COUPONS },
          { label: coupon.code },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(APP_ROUTES.couponEdit(coupon.id))}>
              Edit
            </Button>
            {coupon.status === COUPON_STATUS.ACTIVE ? (
              <Button variant="danger" onClick={() => setPendingStatus(COUPON_STATUS.INACTIVE)}>
                Deactivate
              </Button>
            ) : (
              <Button onClick={() => setPendingStatus(COUPON_STATUS.ACTIVE)}>Activate</Button>
            )}
          </>
        }
      />

      <FormError message={actionError} />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <DetailItem label="Code">
            <CouponCode code={coupon.code} />
          </DetailItem>
          <DetailItem label="Status">
            <Badge variant={displayStatusVariant(display)}>{displayStatusLabel(display)}</Badge>
          </DetailItem>
          <DetailItem label="Discount">
            {formatDiscount(coupon.discountType, coupon.discountValue)}
            <span className="ml-1 text-xs font-normal text-text-muted">({formatDiscountType(coupon.discountType)})</span>
          </DetailItem>
          <DetailItem label="Scope">{formatScope(coupon.scope)}</DetailItem>
          <DetailItem label="Minimum cart value">{formatPrice(coupon.minimumCartValue)}</DetailItem>
          <DetailItem label="Maximum discount">{formatPrice(coupon.maximumDiscount)}</DetailItem>
          <DetailItem label="Starts">{formatDateTime(coupon.startsAt)}</DetailItem>
          <DetailItem label="Expires">{formatDateTime(coupon.expiresAt)}</DetailItem>
          <DetailItem label="Usage">{formatUsage(coupon)}</DetailItem>
          <DetailItem label="Per-user limit">
            {coupon.perUserLimit == null ? 'Unlimited' : coupon.perUserLimit}
          </DetailItem>
          <DetailItem label="Created">{formatDateTime(coupon.createdAt)}</DetailItem>
          <DetailItem label="Updated">{formatDateTime(coupon.updatedAt)}</DetailItem>
        </section>

        {coupon.scope === 'PRODUCT' && (
          <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-text">Eligible products</h2>
            {coupon.products.length === 0 ? (
              <EmptyState
                title="No products attached"
                description="This product-scoped coupon has no eligible products."
                className="min-h-[120px]"
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {coupon.products.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <span className="text-sm text-text">{product.name}</span>
                    <Badge variant={product.status === 'ACTIVE' ? 'success' : 'muted'}>
                      {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {coupon.scope === 'CATEGORY' && (
          <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-text">Eligible categories</h2>
            {coupon.categories.length === 0 ? (
              <EmptyState
                title="No categories attached"
                description="This category-scoped coupon has no eligible categories."
                className="min-h-[120px]"
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {coupon.categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <span className="text-sm text-text">{category.name}</span>
                    <Badge variant={category.status === 'ACTIVE' ? 'success' : 'muted'}>
                      {category.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold text-text">Usage history</h2>
          <DataTable
            columns={usageColumns}
            data={usages}
            getRowId={(row) => row.id}
            isLoading={usagesLoading}
            error={usageError}
            onRetry={() => void refetchUsages()}
            emptyTitle="No redemptions yet"
            emptyDescription="Usage is recorded when an order is confirmed, not when a coupon is applied to a cart."
          />
          {usagePagination.total > 0 && (
            <div className="mt-4">
              <TablePagination
                page={usagePagination.page}
                totalPages={usagePagination.totalPages}
                pageSize={usageLimit}
                onPageChange={setUsagePage}
                onPageSizeChange={(nextLimit) => {
                  setUsageLimit(nextLimit);
                  setUsagePage(PAGINATION.DEFAULT_PAGE);
                }}
              />
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => {
          if (!isConfirming) {
            setPendingStatus(null);
          }
        }}
        onConfirm={() => void handleConfirm()}
        title={pendingStatus === COUPON_STATUS.INACTIVE ? 'Deactivate coupon' : 'Activate coupon'}
        description={
          pendingStatus === COUPON_STATUS.INACTIVE
            ? `Deactivate "${coupon.code}"? Customers will not be able to apply it. Usage history is kept.`
            : `Activate "${coupon.code}"?`
        }
        confirmLabel={pendingStatus === COUPON_STATUS.INACTIVE ? 'Deactivate' : 'Activate'}
        variant={pendingStatus === COUPON_STATUS.INACTIVE ? 'danger' : 'primary'}
        isConfirming={isConfirming}
      />
    </div>
  );
}
