import type { Metadata } from 'next';
import { CouponEditView } from '@/components/coupons/CouponEditView';

export const metadata: Metadata = {
  title: 'Edit coupon',
};

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CouponEditView key={id} couponId={id} />;
}
