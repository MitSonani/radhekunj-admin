'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryForm } from './CategoryForm';
import { APP_ROUTES } from '@/constants';
import { useCategory } from '@/hooks/useCategory';
import { useCategoryMutations } from '@/hooks/useCategoryMutations';
import type { UpdateCategoryPayload } from '@/services/api';

interface CategoryEditViewProps {
  categoryId: string;
}

export function CategoryEditView({ categoryId }: CategoryEditViewProps) {
  const router = useRouter();
  const { category, error: loadError, isLoading, refetch } = useCategory(categoryId);
  const { updateCategory, isUpdating, error: saveError } = useCategoryMutations();

  const handleUpdate = async (payload: UpdateCategoryPayload) => {
    await updateCategory(categoryId, payload);
    router.push(APP_ROUTES.CATEGORIES);
  };

  const handleCancel = () => {
    router.push(APP_ROUTES.CATEGORIES);
  };

  if (isLoading) {
    return <PageLoader message="Loading category..." />;
  }

  if (loadError || !category) {
    return (
      <div>
        <PageHeader
          title="Edit Category"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Categories', href: APP_ROUTES.CATEGORIES },
            { label: 'Edit' },
          ]}
        />
        <ErrorState title="Unable to load category" message={loadError || 'Category not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Category"
        description="Update category details. Replacing an image uploads a new file to S3 before the Backend saves the change."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Categories', href: APP_ROUTES.CATEGORIES },
          { label: category.name },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <CategoryForm
          mode="edit"
          initialCategory={category}
          isSubmitting={isUpdating}
          error={saveError}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
