'use client';

import { useId, useRef, useState, type ChangeEvent } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { FormField } from '@/components/forms/FormField';
import { PRODUCT_IMAGE } from '@/constants';
import type { CatalogAttribute } from '@/hooks/useCatalogOptions';
import type { ProductImage } from '@/services/api';
import { cn } from '@/lib/utils';
import { ApiError } from '@/types/api';
import {
  createClientId,
  formatImageMaxSize,
  isColorAttribute,
  type PendingProductImage,
  toAllowedContentType,
} from './productFormUtils';

type ImageGroup = {
  attributeValueId: string | null;
  label: string;
  colorCode: string | null;
};

interface ProductImageManagerProps {
  mode: 'pending' | 'persisted';
  attributes: CatalogAttribute[];
  pendingImages?: PendingProductImage[];
  images?: ProductImage[];
  disabled?: boolean;
  uploadingGroupId?: string | null;
  uploadProgress?: number;
  busyImageId?: string | null;
  onPendingChange?: (images: PendingProductImage[]) => void;
  onUpload?: (file: File, attributeValueId: string | null, sortOrder: number) => Promise<void>;
  onDelete?: (image: ProductImage) => Promise<void>;
  onSetPrimary?: (image: ProductImage) => Promise<void>;
  onReorder?: (image: ProductImage, direction: 'up' | 'down') => Promise<void>;
  onAssociate?: (image: ProductImage, attributeValueId: string | null) => Promise<void>;
}

function groupsFromAttributes(attributes: CatalogAttribute[]): ImageGroup[] {
  const colorAttribute = attributes.find(isColorAttribute);
  const colorValues = colorAttribute?.values ?? [];

  return [
    { attributeValueId: null, label: 'Generic images', colorCode: null },
    ...colorValues.map((value) => ({
      attributeValueId: value.id,
      label: value.value,
      colorCode: value.colorCode,
    })),
  ];
}

function sortPersisted(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export function ProductImageManager({
  mode,
  attributes,
  pendingImages = [],
  images = [],
  disabled = false,
  uploadingGroupId = null,
  uploadProgress = 0,
  busyImageId = null,
  onPendingChange,
  onUpload,
  onDelete,
  onSetPrimary,
  onReorder,
  onAssociate,
}: ProductImageManagerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const groups = groupsFromAttributes(attributes);
  const colorAttribute = attributes.find(isColorAttribute);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const groupId = activeGroupId;
    setActiveGroupId(null);

    if (!file) {
      return;
    }

    const contentType = toAllowedContentType(file.type);
    if (!contentType) {
      setLocalError('Unsupported image type. Use JPEG, PNG, or WebP.');
      resetInput();
      return;
    }

    if (file.size <= 0 || file.size > PRODUCT_IMAGE.MAX_BYTES) {
      setLocalError(`Image cannot exceed ${formatImageMaxSize()}.`);
      resetInput();
      return;
    }

    setLocalError(null);

    if (mode === 'pending') {
      const previewUrl = URL.createObjectURL(file);
      onPendingChange?.([
        ...pendingImages,
        {
          clientId: createClientId(),
          file,
          previewUrl,
          attributeValueId: groupId,
          altText: '',
        },
      ]);
      resetInput();
      return;
    }

    const siblings = sortPersisted(images.filter((image) => image.attributeValueId === groupId));
    const nextSortOrder = siblings.length > 0 ? Math.max(...siblings.map((image) => image.sortOrder)) + 1 : 0;

    try {
      await onUpload?.(file, groupId, nextSortOrder);
    } catch (err) {
      setLocalError(err instanceof ApiError ? err.message : 'Image upload failed. Please try again.');
    } finally {
      resetInput();
    }
  };

  const openPicker = (attributeValueId: string | null) => {
    setActiveGroupId(attributeValueId);
    setLocalError(null);
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => void handleFileChange(event)}
      />

      <p className="text-xs text-text-muted">
        JPEG, PNG, or WebP. Maximum {formatImageMaxSize()}. Generic images apply to every variant. Color images belong
        to a Color attribute value, not to individual sizes.
      </p>

      {!colorAttribute && (
        <p className="text-xs text-text-muted">
          Color-specific images require a Color attribute. Only generic images can be added until that attribute exists.
        </p>
      )}

      {localError && (
        <p className="text-xs text-danger" role="alert">
          {localError}
        </p>
      )}

      {groups.map((group) => {
        const pending = pendingImages.filter((image) => image.attributeValueId === group.attributeValueId);
        const persisted = sortPersisted(
          images.filter((image) => image.attributeValueId === group.attributeValueId)
        );
        const isUploading = uploadingGroupId === (group.attributeValueId ?? 'generic');
        const isEmpty = mode === 'pending' ? pending.length === 0 : persisted.length === 0;

        return (
          <section key={group.attributeValueId ?? 'generic'} className="rounded-lg border border-border p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {group.colorCode && (
                  <span
                    className="h-4 w-4 rounded-sm border border-border"
                    style={{ backgroundColor: group.colorCode }}
                    aria-hidden="true"
                  />
                )}
                <h3 className="text-sm font-medium text-text">{group.label}</h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isUploading}
                onClick={() => openPicker(group.attributeValueId)}
              >
                Add image
              </Button>
            </div>

            {isUploading && (
              <div className="mb-3 flex flex-col gap-1" role="status" aria-live="polite">
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full bg-primary transition-[width]" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-text-muted">Uploading image… {uploadProgress}%</p>
              </div>
            )}

            {isEmpty && !isUploading ? (
              <EmptyState
                title="No images"
                description={
                  group.attributeValueId
                    ? `Add images that should appear for ${group.label}.`
                    : 'Add lifestyle or model images that are not tied to a color.'
                }
                className="min-h-[120px]"
              />
            ) : mode === 'pending' ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pending.map((image) => (
                  <li key={image.clientId} className="overflow-hidden rounded-md border border-border">
                    {/* Native img: local object URLs and S3 URLs are not in next/image remotePatterns. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt={image.altText || 'Pending product image'} className="h-28 w-full object-cover" />
                    <div className="flex items-center justify-end p-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={disabled}
                        onClick={() => {
                          URL.revokeObjectURL(image.previewUrl);
                          onPendingChange?.(pendingImages.filter((item) => item.clientId !== image.clientId));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {persisted.map((image, index) => {
                  const isBusy = disabled || busyImageId === image.id;

                  return (
                    <li key={image.id} className="overflow-hidden rounded-md border border-border">
                      <div className="relative">
                        {/* Native img: product images come from Backend/S3 URLs that are not in next/image remotePatterns. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.imageUrl}
                          alt={image.altText || 'Product image'}
                          className={cn('h-28 w-full object-cover', isBusy && 'opacity-70')}
                        />
                        {image.isPrimary && (
                          <Badge variant="success" className="absolute left-2 top-2">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 p-2">
                        {onAssociate && colorAttribute && (
                          <FormField label="Association" className="gap-1">
                            <select
                              value={image.attributeValueId ?? ''}
                              disabled={isBusy}
                              onChange={(event) => {
                                const next = event.target.value || null;
                                void onAssociate(image, next);
                              }}
                              className="h-8 w-full rounded-md border border-border bg-surface px-2 text-xs text-text"
                            >
                              <option value="">Generic</option>
                              {colorAttribute.values
                                .filter((value) => {
                                  const keyColorMatch = /\/colors\/([^/]+)\//.exec(image.objectKey);
                                  return !keyColorMatch || keyColorMatch[1] === value.id;
                                })
                                .map((value) => (
                                  <option key={value.id} value={value.id}>
                                    {value.value}
                                  </option>
                                ))}
                            </select>
                          </FormField>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {onSetPrimary && !image.isPrimary && (
                            <Button type="button" size="sm" variant="ghost" disabled={isBusy} onClick={() => void onSetPrimary(image)}>
                              Set primary
                            </Button>
                          )}
                          {onReorder && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isBusy || index === 0}
                                onClick={() => void onReorder(image, 'up')}
                              >
                                Up
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isBusy || index === persisted.length - 1}
                                onClick={() => void onReorder(image, 'down')}
                              >
                                Down
                              </Button>
                            </>
                          )}
                          {onDelete && (
                            <Button type="button" size="sm" variant="ghost" disabled={isBusy} onClick={() => void onDelete(image)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
