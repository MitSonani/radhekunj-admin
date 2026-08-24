'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { FormActions } from '@/components/forms/FormActions';
import { FormError } from '@/components/forms/FormError';
import { FormField } from '@/components/forms/FormField';
import { PRODUCT_CONSTRAINTS, PRODUCT_STATUS, PRODUCT_VARIANT_STATUS } from '@/constants';
import type { CatalogAttribute } from '@/hooks/useCatalogOptions';
import type {
  Category,
  CreateProductPayload,
  CreateVariantPayload,
  ProductDetail,
  ProductImage,
  ProductStatus,
  UpdateProductPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';
import { AttributeSelector } from './AttributeSelector';
import { ProductImageManager } from './ProductImageManager';
import {
  combinationFingerprint,
  createClientId,
  findDuplicateSkuClientIds,
  generateVariantCombinations,
  normalizeMoney,
  type DraftVariant,
  type PendingProductImage,
  type VariantFieldErrors,
  validateDescription,
  validateDraftVariant,
  validatePrice,
  validateProductName,
} from './productFormUtils';
import { VariantTable } from './VariantTable';

type FieldErrors = {
  name?: string;
  categoryId?: string;
  description?: string;
  basePrice?: string;
};

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: ProductDetail;
  categories: Category[];
  attributes: CatalogAttribute[];
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onCreate?: (payload: CreateProductPayload, pendingImages: PendingProductImage[]) => Promise<void>;
  onUpdate?: (payload: UpdateProductPayload) => Promise<void>;
  onSaveVariant?: (variant: DraftVariant) => Promise<void>;
  onDeactivateVariant?: (variant: DraftVariant) => Promise<void>;
  busyVariantId?: string | null;
  onUploadImage?: (file: File, attributeValueId: string | null, sortOrder: number) => Promise<void>;
  onDeleteImage?: (image: ProductImage) => Promise<void>;
  onSetPrimaryImage?: (image: ProductImage) => Promise<void>;
  onReorderImage?: (image: ProductImage, direction: 'up' | 'down') => Promise<void>;
  onAssociateImage?: (image: ProductImage, attributeValueId: string | null) => Promise<void>;
  isUploadingImage?: boolean;
  uploadProgress?: number;
  uploadingGroupId?: string | null;
  busyImageId?: string | null;
}

function selectedFromProduct(product: ProductDetail | undefined): Record<string, string[]> {
  const selected: Record<string, string[]> = {};

  product?.variants.forEach((variant) => {
    variant.attributes.forEach((item) => {
      const attributeId = item.attributeValue.attributeId;
      const current = selected[attributeId] ?? [];
      if (!current.includes(item.attributeValueId)) {
        selected[attributeId] = [...current, item.attributeValueId];
      }
    });
  });

  return selected;
}

function draftsFromProduct(product: ProductDetail | undefined): DraftVariant[] {
  if (!product) {
    return [];
  }

  return product.variants.map((variant) => ({
    clientId: variant.id,
    persistedId: variant.id,
    attributeValueIds: variant.attributes.map((item) => item.attributeValueId),
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? '',
    quantity: String(variant.inventory?.quantity ?? 0),
    reservedQuantity: String(variant.inventory?.reservedQuantity ?? 0),
    status: variant.status,
  }));
}

function toCreateVariantPayload(variant: DraftVariant): CreateVariantPayload {
  const payload: CreateVariantPayload = {
    sku: variant.sku.trim(),
    price: normalizeMoney(variant.price.trim()),
    status: variant.status,
    attributeValueIds: variant.attributeValueIds,
    inventory: {
      quantity: Number(variant.quantity.trim()),
    },
  };

  const compareAt = variant.compareAtPrice.trim();
  if (compareAt) {
    payload.compareAtPrice = normalizeMoney(compareAt);
  }

  return payload;
}

export function ProductForm({
  mode,
  initialProduct,
  categories,
  attributes,
  isSubmitting,
  error,
  onCancel,
  onCreate,
  onUpdate,
  onSaveVariant,
  onDeactivateVariant,
  busyVariantId,
  onUploadImage,
  onDeleteImage,
  onSetPrimaryImage,
  onReorderImage,
  onAssociateImage,
  isUploadingImage = false,
  uploadProgress = 0,
  uploadingGroupId = null,
  busyImageId = null,
}: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice ?? '');
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status ?? PRODUCT_STATUS.ACTIVE);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => selectedFromProduct(initialProduct));
  const [variants, setVariants] = useState<DraftVariant[]>(() => draftsFromProduct(initialProduct));
  const [pendingImages, setPendingImages] = useState<PendingProductImage[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, VariantFieldErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !initialProduct) {
      return;
    }

    setName(initialProduct.name);
    setCategoryId(initialProduct.categoryId);
    setDescription(initialProduct.description ?? '');
    setBasePrice(initialProduct.basePrice);
    setStatus(initialProduct.status);
    setSelected(selectedFromProduct(initialProduct));
    setVariants(draftsFromProduct(initialProduct));
  }, [mode, initialProduct]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
    // Revoke object URLs only when the form unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.status === PRODUCT_STATUS.INACTIVE ? `${category.name} (Inactive)` : category.name,
      })),
    [categories]
  );

  const isBusy = isSubmitting || isUploadingImage;

  const updateVariant = (clientId: string, patch: Partial<DraftVariant>) => {
    setVariants((current) => current.map((variant) => (variant.clientId === clientId ? { ...variant, ...patch } : variant)));
    setVariantErrors((current) => {
      const next = { ...current };
      delete next[clientId];
      return next;
    });
  };

  const handleGenerate = () => {
    setFormError(null);
    const result = generateVariantCombinations(attributes, selected, variants, normalizeMoney(basePrice) || basePrice);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    setVariants(result.variants);
  };

  const handleAddDefaultVariant = () => {
    setFormError(null);
    const fingerprint = combinationFingerprint([]);
    if (variants.some((variant) => combinationFingerprint(variant.attributeValueIds) === fingerprint)) {
      setFormError('A default variant already exists.');
      return;
    }

    setVariants((current) => [
      ...current,
      {
        clientId: createClientId(),
        attributeValueIds: [],
        sku: '',
        price: normalizeMoney(basePrice) || basePrice,
        compareAtPrice: '',
        quantity: '0',
        reservedQuantity: '0',
        status: PRODUCT_VARIANT_STATUS.ACTIVE,
      },
    ]);
  };

  const validateBasic = (): FieldErrors => {
    const nextErrors: FieldErrors = {};
    const nameError = validateProductName(name.trim());
    const descriptionError = validateDescription(description.trim());
    const priceError = validatePrice(basePrice.trim(), 'Base price');

    if (nameError) {
      nextErrors.name = nameError;
    }

    if (!categoryId) {
      nextErrors.categoryId = 'Category is required';
    }

    if (descriptionError) {
      nextErrors.description = descriptionError;
    }

    if (priceError) {
      nextErrors.basePrice = priceError;
    }

    return nextErrors;
  };

  const validateVariants = (rows: DraftVariant[]): Record<string, VariantFieldErrors> | string | null => {
    if (rows.length > PRODUCT_CONSTRAINTS.VARIANT_MAX) {
      return `A product cannot have more than ${PRODUCT_CONSTRAINTS.VARIANT_MAX} variants.`;
    }

    const nextErrors: Record<string, VariantFieldErrors> = {};
    rows.forEach((variant) => {
      const errors = validateDraftVariant(variant);
      if (Object.keys(errors).length > 0) {
        nextErrors[variant.clientId] = errors;
      }
    });

    const duplicateSkus = findDuplicateSkuClientIds(rows);
    duplicateSkus.forEach((clientId) => {
      nextErrors[clientId] = {
        ...nextErrors[clientId],
        sku: 'SKU must be unique',
      };
    });

    const fingerprints = new Set<string>();
    for (const variant of rows) {
      const fingerprint = combinationFingerprint(variant.attributeValueIds);
      if (fingerprints.has(fingerprint)) {
        return 'A variant with this attribute combination already exists';
      }
      fingerprints.add(fingerprint);
    }

    return Object.keys(nextErrors).length > 0 ? nextErrors : null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextFieldErrors = validateBasic();
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    if (mode === 'create') {
      const variantValidation = validateVariants(variants);
      if (typeof variantValidation === 'string') {
        setFormError(variantValidation);
        return;
      }

      if (variantValidation) {
        setVariantErrors(variantValidation);
        return;
      }

      const payload: CreateProductPayload = {
        categoryId,
        name: name.trim(),
        basePrice: normalizeMoney(basePrice.trim()),
        status,
      };

      const trimmedDescription = description.trim();
      if (trimmedDescription) {
        payload.description = trimmedDescription;
      }

      if (variants.length > 0) {
        payload.variants = variants.map(toCreateVariantPayload);
      }

      try {
        await onCreate?.(payload, pendingImages);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {
          setFormError(err.message);
        }
      }

      return;
    }

    try {
      await onUpdate?.({
        categoryId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        basePrice: normalizeMoney(basePrice.trim()),
        status,
      });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setFormError(err.message);
      }
    }
  };

  const handleSaveVariant = async (variant: DraftVariant) => {
    const errors = validateDraftVariant(variant);
    if (Object.keys(errors).length > 0) {
      setVariantErrors((current) => ({ ...current, [variant.clientId]: errors }));
      return;
    }

    try {
      await onSaveVariant?.(variant);
    } catch (err) {
      if (err instanceof ApiError) {
        setVariantErrors((current) => ({
          ...current,
          [variant.clientId]: { ...current[variant.clientId], sku: err.message },
        }));
        setFormError(err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex max-w-xl flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Basic information</h2>
        <Input
          label="Name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFieldErrors((current) => ({ ...current, name: undefined }));
          }}
          maxLength={PRODUCT_CONSTRAINTS.NAME_MAX}
          required
          disabled={isBusy}
          error={fieldErrors.name}
        />

        {mode === 'edit' && initialProduct && (
          <FormField label="Slug" hint="Generated by the Backend from the product name.">
            <p className="rounded-md border border-border bg-surface-muted px-3 py-2 font-mono text-sm text-text-secondary">
              {initialProduct.slug}
            </p>
          </FormField>
        )}

        <Select
          label="Category"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setFieldErrors((current) => ({ ...current, categoryId: undefined }));
          }}
          required
          disabled={isBusy || categories.length === 0}
          error={fieldErrors.categoryId}
          placeholder="Select a category"
          options={categoryOptions}
        />

        <FormField label="Description" htmlFor="product-description" error={fieldErrors.description}>
          <textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={PRODUCT_CONSTRAINTS.DESCRIPTION_MAX}
            disabled={isBusy}
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60"
          />
        </FormField>

        <Input
          label="Base price"
          value={basePrice}
          onChange={(event) => {
            setBasePrice(event.target.value);
            setFieldErrors((current) => ({ ...current, basePrice: undefined }));
          }}
          required
          disabled={isBusy}
          error={fieldErrors.basePrice}
          inputMode="decimal"
          placeholder="0.00"
          helperText="Used as the default price when generating variants. Each variant can override it."
        />

        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ProductStatus)}
          disabled={isBusy}
          options={[
            { value: PRODUCT_STATUS.ACTIVE, label: 'Active' },
            { value: PRODUCT_STATUS.INACTIVE, label: 'Inactive' },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">Attributes</h2>
          <p className="mt-1 text-xs text-text-muted">
            Values come from the Attribute catalog. Generating variants creates one combination for each selected value
            set.
          </p>
        </div>
        <AttributeSelector attributes={attributes} selected={selected} disabled={isBusy} onChange={setSelected} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Variants</h2>
            <p className="mt-1 text-xs text-text-muted">
              SKU, price, and stock are required for every variant. Reserved stock is returned by the Backend and is
              shown as read-only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={isBusy} onClick={handleAddDefaultVariant}>
              Add default variant
            </Button>
            <Button type="button" variant="secondary" disabled={isBusy} onClick={handleGenerate}>
              Generate variants
            </Button>
          </div>
        </div>
        <VariantTable
          attributes={attributes}
          variants={variants}
          errors={variantErrors}
          disabled={isBusy}
          busyClientId={busyVariantId}
          onChange={updateVariant}
          onRemove={
            mode === 'create' || onSaveVariant
              ? (clientId) => setVariants((current) => current.filter((variant) => variant.clientId !== clientId))
              : undefined
          }
          onSave={mode === 'edit' ? (variant) => void handleSaveVariant(variant) : undefined}
          onDeactivate={mode === 'edit' ? onDeactivateVariant : undefined}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">Product images</h2>
          <p className="mt-1 text-xs text-text-muted">
            {mode === 'create'
              ? 'Images are uploaded after the product is created. They are not saved until the Backend confirms them.'
              : 'Uploads go to S3 with a Backend presigned URL, then the Backend stores the image record.'}
          </p>
        </div>
        <ProductImageManager
          mode={mode === 'create' ? 'pending' : 'persisted'}
          attributes={attributes}
          pendingImages={pendingImages}
          images={initialProduct?.images ?? []}
          disabled={isBusy}
          uploadingGroupId={uploadingGroupId}
          uploadProgress={uploadProgress}
          busyImageId={busyImageId}
          onPendingChange={setPendingImages}
          onUpload={onUploadImage}
          onDelete={onDeleteImage}
          onSetPrimary={onSetPrimaryImage}
          onReorder={onReorderImage}
          onAssociate={onAssociateImage}
        />
      </section>

      <FormError message={formError || error} />

      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isBusy}>
          {mode === 'create' ? 'Save product' : 'Save changes'}
        </Button>
      </FormActions>
    </form>
  );
}

export type { DraftVariant, PendingProductImage };
