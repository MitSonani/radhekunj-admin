'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { APP_ROUTES } from '@/constants';
import { useCatalogOptions } from '@/hooks/useCatalogOptions';
import { useProductMutations } from '@/hooks/useProductMutations';
import { productService, type CreateProductPayload } from '@/services/api';
import { ApiError } from '@/types/api';
import { ProductForm } from './ProductForm';
import { toAllowedContentType, type PendingProductImage } from './productFormUtils';

export function ProductCreateView() {
  const router = useRouter();
  const { categories, attributes, error: catalogError, isLoading, refetch } = useCatalogOptions();
  const { createProduct, isCreating, error, setError } = useProductMutations();

  const handleCreate = async (payload: CreateProductPayload, pendingImages: PendingProductImage[]) => {
    const product = await createProduct(payload);

    if (pendingImages.length > 0) {
      try {
        for (const [index, image] of pendingImages.entries()) {
          const contentType = toAllowedContentType(image.file.type);
          if (!contentType) {
            throw new ApiError(400, 'Unsupported image type. Use JPEG, PNG, or WebP.');
          }

          await productService.uploadAndCreateImage(product.id, image.file, contentType, {
            attributeValueId: image.attributeValueId,
            altText: image.altText || null,
            sortOrder: index,
            isPrimary: index === 0,
          });
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'The product was created, but one or more images could not be uploaded.';
        setError(message);
        router.push(APP_ROUTES.productEdit(product.id));
        return;
      }
    }

    router.push(APP_ROUTES.productDetail(product.id));
  };

  if (isLoading) {
    return <PageLoader message="Loading catalog options..." />;
  }

  if (catalogError) {
    return (
      <div>
        <PageHeader
          title="Add Product"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Products', href: APP_ROUTES.PRODUCTS },
            { label: 'Add' },
          ]}
        />
        <ErrorState title="Unable to load catalog options" message={catalogError} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Add Product"
        description="Create the product, generate variants from catalog attributes, then upload images. Images are stored after the product exists."
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Products', href: APP_ROUTES.PRODUCTS },
          { label: 'Add' },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <ProductForm
          mode="create"
          categories={categories}
          attributes={attributes}
          isSubmitting={isCreating}
          error={error}
          onCancel={() => router.push(APP_ROUTES.PRODUCTS)}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
