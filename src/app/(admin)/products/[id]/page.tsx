import type { Metadata } from 'next';
import { ProductDetailView } from '@/components/products/ProductDetailView';

export const metadata: Metadata = {
  title: 'Product',
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailView key={id} productId={id} />;
}
