'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttributeForm } from './AttributeForm';
import { APP_ROUTES } from '@/constants';
import { useAttribute } from '@/hooks/useAttribute';
import { useAttributeMutations } from '@/hooks/useAttributeMutations';
import type { UpdateAttributePayload } from '@/services/api';

interface AttributeEditViewProps {
  attributeId: string;
}

export function AttributeEditView({ attributeId }: AttributeEditViewProps) {
  const router = useRouter();
  const { attribute, error: loadError, isLoading, refetch } = useAttribute(attributeId);
  const { updateAttribute, isUpdating, error: saveError } = useAttributeMutations();

  const handleUpdate = async (payload: UpdateAttributePayload) => {
    await updateAttribute(attributeId, payload);
    router.push(APP_ROUTES.attributeDetail(attributeId));
  };

  const handleCancel = () => {
    router.push(APP_ROUTES.attributeDetail(attributeId));
  };

  if (isLoading) {
    return <PageLoader message="Loading attribute..." />;
  }

  if (loadError || !attribute) {
    return (
      <div>
        <PageHeader
          title="Edit Attribute"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Attributes', href: APP_ROUTES.ATTRIBUTES },
            { label: 'Edit' },
          ]}
        />
        <ErrorState
          title="Unable to load attribute"
          message={loadError || 'Attribute not found'}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Attribute"
        description="Updating the name regenerates the slug on the Backend."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Attributes', href: APP_ROUTES.ATTRIBUTES },
          { label: attribute.name, href: APP_ROUTES.attributeDetail(attribute.id) },
          { label: 'Edit' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <AttributeForm
          mode="edit"
          initialAttribute={attribute}
          isSubmitting={isUpdating}
          error={saveError}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
