'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CouponForm } from './CouponForm';
import { APP_ROUTES } from '@/constants';
import { useCouponMutations } from '@/hooks/useCouponMutations';
import type { CreateCouponPayload } from '@/services/api';

export function CouponCreateView() {
  const router = useRouter();
  const { createCoupon, isCreating, error } = useCouponMutations();

  const handleCreate = async (payload: CreateCouponPayload) => {
    const coupon = await createCoupon(payload);
    router.push(APP_ROUTES.couponDetail(coupon.id));
  };

  return (
    <div>
      <PageHeader
        title="Create coupon"
        description="Configure code, discount, scope, validity, and usage limits. The Backend validates the coupon and calculates customer discounts."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Coupons', href: APP_ROUTES.COUPONS },
          { label: 'Create' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <CouponForm
          mode="create"
          isSubmitting={isCreating}
          error={error}
          onCancel={() => router.push(APP_ROUTES.COUPONS)}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
