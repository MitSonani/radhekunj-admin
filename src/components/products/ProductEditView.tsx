'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { APP_ROUTES } from '@/constants';
import { useCatalogOptions } from '@/hooks/useCatalogOptions';
import { useProduct } from '@/hooks/useProduct';
import { useProductImageMutations } from '@/hooks/useProductImageMutations';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useProductVariantMutations } from '@/hooks/useProductVariantMutations';
import type { ProductImage, UpdateProductPayload } from '@/services/api';
import { ProductForm, type DraftVariant } from './ProductForm';
import { normalizeMoney, toAllowedContentType } from './productFormUtils';

interface ProductEditViewProps {
  productId: string;
}

export function ProductEditView({ productId }: ProductEditViewProps) {
  const router = useRouter();
  const { product, error: loadError, isLoading, refetch } = useProduct(productId);
  const { categories, attributes, error: catalogError, isLoading: isCatalogLoading, refetch: refetchCatalog } =
    useCatalogOptions();
  const { updateProduct, isUpdating, error: saveError } = useProductMutations();
  const {
    createVariant,
    updateVariant,
    deactivateVariant,
    setInventory,
    busyVariantId,
    error: variantError,
    setError: setVariantError,
  } = useProductVariantMutations();
  const {
    uploadImage,
    updateImage,
    deleteImage,
    isUploading,
    uploadProgress,
    busyImageId,
    error: imageError,
    setError: setImageError,
  } = useProductImageMutations();
  const [uploadingGroupId, setUploadingGroupId] = useState<string | null>(null);

  const handleUpdate = async (payload: UpdateProductPayload) => {
    await updateProduct(productId, payload);
    await refetch();
  };

  const handleSaveVariant = async (variant: DraftVariant) => {
    setVariantError(null);

    if (!variant.persistedId) {
      await createVariant(productId, {
        sku: variant.sku.trim(),
        price: normalizeMoney(variant.price.trim()),
        compareAtPrice: variant.compareAtPrice.trim() ? normalizeMoney(variant.compareAtPrice.trim()) : null,
        status: variant.status,
        attributeValueIds: variant.attributeValueIds,
        inventory: { quantity: Number(variant.quantity.trim()) },
      });
      await refetch();
      return;
    }

    await updateVariant(productId, variant.persistedId, {
      sku: variant.sku.trim(),
      price: normalizeMoney(variant.price.trim()),
      compareAtPrice: variant.compareAtPrice.trim() ? normalizeMoney(variant.compareAtPrice.trim()) : null,
      status: variant.status,
      attributeValueIds: variant.attributeValueIds,
    });

    await setInventory(productId, variant.persistedId, {
      quantity: Number(variant.quantity.trim()),
    });

    await refetch();
  };

  const handleDeactivateVariant = async (variant: DraftVariant) => {
    if (!variant.persistedId) {
      return;
    }

    await deactivateVariant(productId, variant.persistedId);
    await refetch();
  };

  const handleUploadImage = async (file: File, attributeValueId: string | null, sortOrder: number) => {
    const contentType = toAllowedContentType(file.type);
    if (!contentType) {
      return;
    }

    setImageError(null);
    setUploadingGroupId(attributeValueId ?? 'generic');

    try {
      await uploadImage(productId, file, contentType, {
        attributeValueId,
        sortOrder,
      });
      await refetch();
    } finally {
      setUploadingGroupId(null);
    }
  };

  const handleDeleteImage = async (image: ProductImage) => {
    await deleteImage(productId, image.id);
    await refetch();
  };

  const handleSetPrimary = async (image: ProductImage) => {
    await updateImage(productId, image.id, { isPrimary: true });
    await refetch();
  };

  const handleReorder = async (image: ProductImage, direction: 'up' | 'down') => {
    const siblings = [...(product?.images ?? [])]
      .filter((item) => item.attributeValueId === image.attributeValueId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    const index = siblings.findIndex((item) => item.id === image.id);
    const swapWith = direction === 'up' ? siblings[index - 1] : siblings[index + 1];

    if (!swapWith) {
      return;
    }

    await updateImage(productId, image.id, { sortOrder: swapWith.sortOrder });
    await updateImage(productId, swapWith.id, { sortOrder: image.sortOrder });
    await refetch();
  };

  const handleAssociate = async (image: ProductImage, attributeValueId: string | null) => {
    await updateImage(productId, image.id, { attributeValueId });
    await refetch();
  };

  if (isLoading || isCatalogLoading) {
    return <PageLoader message="Loading product..." />;
  }

  if (catalogError) {
    return (
      <div>
        <PageHeader
          title="Edit Product"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Products', href: APP_ROUTES.PRODUCTS },
            { label: 'Edit' },
          ]}
        />
        <ErrorState title="Unable to load catalog options" message={catalogError} onRetry={() => void refetchCatalog()} />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div>
        <PageHeader
          title="Edit Product"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Products', href: APP_ROUTES.PRODUCTS },
            { label: 'Edit' },
          ]}
        />
        <ErrorState title="Unable to load product" message={loadError || 'Product not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Product"
        description="Update product details, variants, inventory, and images. Each mutation is confirmed by the Backend before the UI changes."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Products', href: APP_ROUTES.PRODUCTS },
          { label: product.name, href: APP_ROUTES.productDetail(product.id) },
          { label: 'Edit' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <ProductForm
          mode="edit"
          initialProduct={product}
          categories={categories}
          attributes={attributes}
          isSubmitting={isUpdating}
          error={saveError || variantError || imageError}
          onCancel={() => router.push(APP_ROUTES.productDetail(product.id))}
          onUpdate={handleUpdate}
          onSaveVariant={handleSaveVariant}
          onDeactivateVariant={handleDeactivateVariant}
          busyVariantId={busyVariantId}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
          onSetPrimaryImage={handleSetPrimary}
          onReorderImage={handleReorder}
          onAssociateImage={handleAssociate}
          isUploadingImage={isUploading}
          uploadProgress={uploadProgress}
          uploadingGroupId={uploadingGroupId}
          busyImageId={busyImageId}
        />
      </div>
    </div>
  );
}
