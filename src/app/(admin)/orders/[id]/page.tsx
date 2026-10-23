import type { Metadata } from 'next';
import { OrderDetailView } from '@/components/orders/OrderDetailView';

export const metadata: Metadata = {
  title: 'Order Details',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView key={id} orderId={id} />;
}
