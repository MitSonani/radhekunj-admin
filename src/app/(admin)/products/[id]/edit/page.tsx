import type { Metadata } from 'next';
import { ProductEditView } from '@/components/products/ProductEditView';

export const metadata: Metadata = {
  title: 'Edit Product',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditView key={id} productId={id} />;
}
