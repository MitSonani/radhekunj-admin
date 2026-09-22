'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { CouponForm } from './CouponForm';
import { APP_ROUTES } from '@/constants';
import { useCoupon } from '@/hooks/useCoupon';
import { useCouponMutations } from '@/hooks/useCouponMutations';
import type { UpdateCouponPayload } from '@/services/api';

interface CouponEditViewProps {
  couponId: string;
}

export function CouponEditView({ couponId }: CouponEditViewProps) {
  const router = useRouter();
  const { coupon, error: loadError, isLoading, refetch } = useCoupon(couponId);
  const { updateCoupon, isUpdating, error: saveError } = useCouponMutations();

  const handleUpdate = async (payload: UpdateCouponPayload) => {
    await updateCoupon(couponId, payload);
    router.push(APP_ROUTES.couponDetail(couponId));
  };

  if (isLoading) {
    return <PageLoader message="Loading coupon..." />;
  }

  if (loadError || !coupon) {
    return (
      <div>
        <PageHeader
          title="Edit coupon"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Coupons', href: APP_ROUTES.COUPONS },
            { label: 'Edit' },
          ]}
        />
        <ErrorState title="Unable to load coupon" message={loadError || 'Coupon not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit coupon"
        description={
          coupon.usageCount > 0
            ? 'This coupon has usage history. Code, discount, and scope cannot change. Dates, limits, and eligible items remain editable.'
            : 'Update coupon configuration. The Backend remains authoritative for validation.'
        }
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Coupons', href: APP_ROUTES.COUPONS },
          { label: coupon.code },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <CouponForm
          mode="edit"
          initialCoupon={coupon}
          isSubmitting={isUpdating}
          error={saveError}
          onCancel={() => router.push(APP_ROUTES.couponDetail(coupon.id))}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
