'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttributeForm } from './AttributeForm';
import { APP_ROUTES } from '@/constants';
import { useAttributeMutations } from '@/hooks/useAttributeMutations';
import type { CreateAttributePayload } from '@/services/api';

export function AttributeCreateView() {
  const router = useRouter();
  const { createAttribute, isCreating, error } = useAttributeMutations();

  const handleCreate = async (payload: CreateAttributePayload) => {
    const attribute = await createAttribute(payload);
    router.push(APP_ROUTES.attributeDetail(attribute.id));
  };

  const handleCancel = () => {
    router.push(APP_ROUTES.ATTRIBUTES);
  };

  return (
    <div>
      <PageHeader
        title="Add Attribute"
        description="Enter a name. The Backend generates the slug used by products and variants."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Attributes', href: APP_ROUTES.ATTRIBUTES },
          { label: 'Add' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <AttributeForm
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
