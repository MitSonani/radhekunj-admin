import type { Metadata } from 'next';
import { CategoryCreateView } from '@/components/categories/CategoryCreateView';

export const metadata: Metadata = {
  title: 'Add Category',
};

export default function NewCategoryPage() {
  return <CategoryCreateView />;
}
