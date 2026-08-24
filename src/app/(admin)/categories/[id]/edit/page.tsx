import type { Metadata } from 'next';
import { CategoryEditView } from '@/components/categories/CategoryEditView';

export const metadata: Metadata = {
  title: 'Edit Category',
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryEditView key={id} categoryId={id} />;
}
