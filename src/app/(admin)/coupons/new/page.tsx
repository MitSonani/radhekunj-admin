import type { Metadata } from 'next';
import { CouponCreateView } from '@/components/coupons/CouponCreateView';

export const metadata: Metadata = {
  title: 'Create coupon',
};

export default function NewCouponPage() {
  return <CouponCreateView />;
}
