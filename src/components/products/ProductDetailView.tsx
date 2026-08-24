'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageLoader } from '@/components/common/PageLoader';
import { FormError } from '@/components/forms/FormError';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { APP_ROUTES, PRODUCT_STATUS } from '@/constants';
import { useProduct } from '@/hooks/useProduct';
import { useProductMutations } from '@/hooks/useProductMutations';
import type { ProductVariant } from '@/services/api';
import { ApiError } from '@/types/api';
import { formatDate, formatPrice } from './productFormUtils';

interface ProductDetailViewProps {
  productId: string;
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const router = useRouter();
  const { product, error: loadError, isLoading, refetch } = useProduct(productId);
  const { deactivateProduct, updateProduct, isDeactivating, isUpdating, setError: setMutationError } =
    useProductMutations();
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'INACTIVE' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isConfirming = isDeactivating || isUpdating;

  const handleConfirm = async () => {
    if (!product || !pendingStatus) {
      return;
    }

    setActionError(null);
    setMutationError(null);

    try {
      if (pendingStatus === PRODUCT_STATUS.INACTIVE) {
        await deactivateProduct(product.id);
      } else {
        await updateProduct(product.id, { status: PRODUCT_STATUS.ACTIVE });
      }

      setPendingStatus(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'The request could not be completed.');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading product..." />;
  }

  if (loadError || !product) {
    return (
      <div>
        <PageHeader
          title="Product"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Products', href: APP_ROUTES.PRODUCTS },
            { label: 'Detail' },
          ]}
        />
        <ErrorState title="Unable to load product" message={loadError || 'Product not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  const genericImages = product.images.filter((image) => !image.attributeValueId);
  const colorGroups = product.images
    .filter((image) => image.attributeValueId)
    .reduce<Record<string, { label: string; colorCode: string | null; images: typeof product.images }>>(
      (groups, image) => {
        const key = image.attributeValueId as string;
        if (!groups[key]) {
          groups[key] = {
            label: image.attributeValue?.value ?? 'Color',
            colorCode: image.attributeValue?.colorCode ?? null,
            images: [],
          };
        }
        groups[key].images.push(image);
        return groups;
      },
      {}
    );

  const variantColumns: DataTableColumn<ProductVariant>[] = [
    {
      id: 'combination',
      header: 'Variant',
      cell: (row) =>
        row.attributes.length > 0
          ? row.attributes.map((item) => item.attributeValue.value).join(' / ')
          : 'Default',
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: (row) => <span className="font-mono text-sm">{row.sku}</span>,
    },
    {
      id: 'price',
      header: 'Price',
      cell: (row) => formatPrice(row.price),
    },
    {
      id: 'stock',
      header: 'Stock',
      cell: (row) => {
        const quantity = row.inventory?.quantity ?? 0;
        const reserved = row.inventory?.reservedQuantity ?? 0;
        return (
          <div>
            <p>{quantity}</p>
            {reserved > 0 && (
              <p className="text-xs text-text-muted">
                Reserved {reserved} · Available {Math.max(quantity - reserved, 0)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === PRODUCT_STATUS.ACTIVE ? 'success' : 'muted'}>
          {row.status === PRODUCT_STATUS.ACTIVE ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={product.name}
        description={product.description || undefined}
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Products', href: APP_ROUTES.PRODUCTS },
          { label: product.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(APP_ROUTES.productEdit(product.id))}>
              Edit
            </Button>
            {product.status === PRODUCT_STATUS.ACTIVE ? (
              <Button variant="danger" onClick={() => setPendingStatus(PRODUCT_STATUS.INACTIVE)}>
                Deactivate
              </Button>
            ) : (
              <Button onClick={() => setPendingStatus(PRODUCT_STATUS.ACTIVE)}>Activate</Button>
            )}
          </>
        }
      />

      <FormError message={actionError} />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <div>
            <p className="text-xs text-text-muted">Status</p>
            <Badge variant={product.status === PRODUCT_STATUS.ACTIVE ? 'success' : 'muted'} className="mt-1">
              {product.status === PRODUCT_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-text-muted">Category</p>
            <p className="mt-1 text-sm font-medium text-text">{product.category.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Base price</p>
            <p className="mt-1 text-sm font-medium text-text">{formatPrice(product.basePrice)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Slug</p>
            <p className="mt-1 font-mono text-sm text-text-secondary">{product.slug}</p>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">Images</h2>
          {product.images.length === 0 ? (
            <EmptyState title="No images" description="Upload generic or color-specific images from the edit page." className="min-h-[160px]" />
          ) : (
            <div className="flex flex-col gap-5">
              {genericImages.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Generic</h3>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {genericImages.map((image) => (
                      <li key={image.id} className="overflow-hidden rounded-md border border-border">
                        {/* Native img: product images come from Backend/S3 URLs that are not in next/image remotePatterns. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.imageUrl} alt={image.altText || product.name} className="h-28 w-full object-cover" />
                        {image.isPrimary && (
                          <p className="px-2 py-1 text-xs text-text-muted">Primary</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.entries(colorGroups).map(([id, group]) => (
                <div key={id}>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    {group.colorCode && (
                      <span
                        className="h-3 w-3 rounded-sm border border-border"
                        style={{ backgroundColor: group.colorCode }}
                        aria-hidden="true"
                      />
                    )}
                    {group.label}
                  </h3>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {group.images.map((image) => (
                      <li key={image.id} className="overflow-hidden rounded-md border border-border">
                        {/* Native img: product images come from Backend/S3 URLs that are not in next/image remotePatterns. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.imageUrl} alt={image.altText || group.label} className="h-28 w-full object-cover" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-text">Variants</h2>
          <DataTable
            columns={variantColumns}
            data={product.variants}
            getRowId={(row) => row.id}
            emptyTitle="No variants"
            emptyDescription="Add variants from the edit page."
          />
        </section>

        <p className="text-xs text-text-muted">Created {formatDate(product.createdAt)}</p>
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => {
          if (!isConfirming) {
            setPendingStatus(null);
          }
        }}
        onConfirm={() => void handleConfirm()}
        title={pendingStatus === PRODUCT_STATUS.INACTIVE ? 'Deactivate product' : 'Activate product'}
        description={
          pendingStatus === PRODUCT_STATUS.INACTIVE
            ? `Deactivate "${product.name}"? Variants, inventory, and images are kept.`
            : `Activate "${product.name}"?`
        }
        confirmLabel="Confirm"
        variant={pendingStatus === PRODUCT_STATUS.INACTIVE ? 'danger' : 'primary'}
        isConfirming={isConfirming}
      />
    </div>
  );
}
