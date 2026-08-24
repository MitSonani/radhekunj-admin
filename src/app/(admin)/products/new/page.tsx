import type { Metadata } from 'next';
import { ProductCreateView } from '@/components/products/ProductCreateView';

export const metadata: Metadata = {
  title: 'Add Product',
};

export default function NewProductPage() {
  return <ProductCreateView />;
}
