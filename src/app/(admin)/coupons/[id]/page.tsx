import type { Metadata } from 'next';
import { CouponDetailView } from '@/components/coupons/CouponDetailView';

export const metadata: Metadata = {
  title: 'Coupon',
};

export default async function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CouponDetailView key={id} couponId={id} />;
}
