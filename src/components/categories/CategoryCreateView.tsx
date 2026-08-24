'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryForm } from './CategoryForm';
import { APP_ROUTES } from '@/constants';
import { useCategoryMutations } from '@/hooks/useCategoryMutations';
import type { CreateCategoryPayload } from '@/services/api';

export function CategoryCreateView() {
  const router = useRouter();
  const { createCategory, isCreating, error } = useCategoryMutations();

  const handleCreate = async (payload: CreateCategoryPayload) => {
    await createCategory(payload);
    router.push(APP_ROUTES.CATEGORIES);
  };

  const handleCancel = () => {
    router.push(APP_ROUTES.CATEGORIES);
  };

  return (
    <div>
      <PageHeader
        title="Add Category"
        description="Name, description, status, and optional image. The Backend generates the slug and verifies any uploaded image."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Categories', href: APP_ROUTES.CATEGORIES },
          { label: 'Add' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <CategoryForm
          mode="create"
          isSubmitting={isCreating}
          error={error}
          onCancel={handleCancel}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
