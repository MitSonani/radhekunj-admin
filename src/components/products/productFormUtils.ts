import { PRODUCT_CONSTRAINTS, PRODUCT_IMAGE } from '@/constants';
import type { CatalogAttribute } from '@/hooks/useCatalogOptions';
import type { ProductImageContentType } from '@/services/api';

export type DraftVariant = {
  clientId: string;
  persistedId?: string;
  attributeValueIds: string[];
  sku: string;
  price: string;
  compareAtPrice: string;
  quantity: string;
  reservedQuantity: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type PendingProductImage = {
  clientId: string;
  file: File;
  previewUrl: string;
  attributeValueId: string | null;
  altText: string;
};

export type VariantFieldErrors = {
  sku?: string;
  price?: string;
  compareAtPrice?: string;
  quantity?: string;
};

export function createClientId(): string {
  return crypto.randomUUID();
}

export function isColorAttribute(attribute: { slug: string }): boolean {
  return attribute.slug === PRODUCT_CONSTRAINTS.COLOR_ATTRIBUTE_SLUG;
}

export function combinationFingerprint(attributeValueIds: string[]): string {
  return [...attributeValueIds].sort().join(',');
}

export function cartesianProduct(groups: string[][]): string[][] {
  if (groups.length === 0) {
    return [];
  }

  return groups.reduce<string[][]>(
    (acc, group) => acc.flatMap((combo) => group.map((value) => [...combo, value])),
    [[]]
  );
}

export function formatPrice(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function normalizeMoney(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const amount = Number(trimmed);
  if (Number.isNaN(amount)) {
    return trimmed;
  }

  return amount.toFixed(2);
}

export function validateProductName(name: string): string | undefined {
  if (!name) {
    return 'Product name is required';
  }

  if (name.length > PRODUCT_CONSTRAINTS.NAME_MAX) {
    return `Product name cannot exceed ${PRODUCT_CONSTRAINTS.NAME_MAX} characters`;
  }

  if (!/[a-z0-9]/i.test(name)) {
    return 'Product name must contain letters or numbers';
  }

  return undefined;
}

export function validateDescription(description: string): string | undefined {
  if (description.length > PRODUCT_CONSTRAINTS.DESCRIPTION_MAX) {
    return `Product description cannot exceed ${PRODUCT_CONSTRAINTS.DESCRIPTION_MAX} characters`;
  }

  return undefined;
}

export function validatePrice(value: string, label = 'Price'): string | undefined {
  if (!value) {
    return `${label} is required`;
  }

  if (!PRODUCT_CONSTRAINTS.MONEY_PATTERN.test(value)) {
    return `${label} must be a non-negative amount with up to 2 decimal places`;
  }

  return undefined;
}

export function validateOptionalPrice(value: string, label = 'Compare-at price'): string | undefined {
  if (!value) {
    return undefined;
  }

  return validatePrice(value, label);
}

export function validateSku(sku: string): string | undefined {
  if (!sku) {
    return 'SKU is required';
  }

  if (sku.length > PRODUCT_CONSTRAINTS.SKU_MAX) {
    return `SKU cannot exceed ${PRODUCT_CONSTRAINTS.SKU_MAX} characters`;
  }

  if (!PRODUCT_CONSTRAINTS.SKU_PATTERN.test(sku)) {
    return 'SKU may contain letters, numbers, hyphens, and underscores';
  }

  return undefined;
}

export function validateQuantity(value: string): string | undefined {
  if (!value) {
    return 'Stock is required';
  }

  if (!/^\d+$/.test(value)) {
    return 'Stock must be a non-negative integer';
  }

  return undefined;
}

export function validateDraftVariant(variant: DraftVariant): VariantFieldErrors {
  const errors: VariantFieldErrors = {};
  const skuError = validateSku(variant.sku.trim());
  const priceError = validatePrice(variant.price.trim());
  const compareAtError = validateOptionalPrice(variant.compareAtPrice.trim());
  const quantityError = validateQuantity(variant.quantity.trim());

  if (skuError) {
    errors.sku = skuError;
  }

  if (priceError) {
    errors.price = priceError;
  }

  if (compareAtError) {
    errors.compareAtPrice = compareAtError;
  }

  if (quantityError) {
    errors.quantity = quantityError;
  }

  return errors;
}

export function findDuplicateSkuClientIds(variants: DraftVariant[]): Set<string> {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();

  variants.forEach((variant) => {
    const key = variant.sku.trim().toLowerCase();
    if (!key) {
      return;
    }

    const existing = seen.get(key);
    if (existing) {
      duplicates.add(existing);
      duplicates.add(variant.clientId);
      return;
    }

    seen.set(key, variant.clientId);
  });

  return duplicates;
}

export function selectedAttributes(attributes: CatalogAttribute[], selected: Record<string, string[]>) {
  return attributes.filter((attribute) => (selected[attribute.id] ?? []).length > 0);
}

const SKU_STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'of', 'the', 'with']);

function skuSafeToken(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function skuPrefixFromName(name: string): string {
  const words = name
    .trim()
    .split(/[\s\-_]+/)
    .map(skuSafeToken)
    .filter((word) => word.length > 0 && !SKU_STOP_WORDS.has(word.toLowerCase()));

  if (words.length === 0) {
    return 'PRD';
  }

  if (words.length === 1) {
    return words[0].slice(0, 4);
  }

  const initials = words.map((word) => word[0]).join('');
  if (initials.length >= 3) {
    return initials.slice(0, 4);
  }

  return `${words[0]}${initials.slice(1)}`.slice(0, 4);
}

export function skuSegmentFromValue(value: string, slug?: string): string {
  const source = skuSafeToken(slug || value);
  if (!source) {
    return 'X';
  }

  if (source.length <= 4) {
    return source;
  }

  const consonants = source.replace(/[AEIOU]/g, '');
  if (consonants.length >= 3) {
    return consonants.slice(0, 3);
  }

  return source.slice(0, 3);
}

function skuBaseForCombination(
  productName: string,
  attributeValueIds: string[],
  attributes: CatalogAttribute[]
): string {
  const prefix = skuPrefixFromName(productName);
  const segments = attributes.flatMap((attribute) =>
    attributeValueIds
      .filter((id) => attribute.values.some((value) => value.id === id))
      .map((id) => {
        const value = attribute.values.find((item) => item.id === id);
        return skuSegmentFromValue(value?.value || '', value?.slug);
      })
  );

  return [prefix, ...segments].join('-');
}

export function nextUniqueSku(base: string, taken: Set<string>): string {
  const sanitized = base.replace(/[^A-Za-z0-9\-_]/g, '').replace(/^[-_]+/, '') || 'PRD';
  const truncatedBase = sanitized.slice(0, Math.max(PRODUCT_CONSTRAINTS.SKU_MAX - 4, 1));

  let sequence = 1;
  while (sequence < 10000) {
    const suffix = `-${String(sequence).padStart(3, '0')}`;
    const candidate = `${truncatedBase}${suffix}`.slice(0, PRODUCT_CONSTRAINTS.SKU_MAX);
    const key = candidate.toLowerCase();

    if (!taken.has(key)) {
      taken.add(key);
      return candidate;
    }

    sequence += 1;
  }

  return `${truncatedBase}-${createClientId().slice(0, 4)}`.slice(0, PRODUCT_CONSTRAINTS.SKU_MAX);
}

export function generateSku(options: {
  productName: string;
  attributeValueIds: string[];
  attributes: CatalogAttribute[];
  takenSkus: Set<string>;
}): string {
  return nextUniqueSku(
    skuBaseForCombination(options.productName, options.attributeValueIds, options.attributes),
    options.takenSkus
  );
}

export function generateVariantCombinations(
  attributes: CatalogAttribute[],
  selected: Record<string, string[]>,
  existing: DraftVariant[],
  defaultPrice: string,
  productName: string
): { variants: DraftVariant[]; error?: string } {
  const active = selectedAttributes(attributes, selected);

  if (active.length === 0) {
    return { variants: existing, error: 'Select at least one attribute value before generating variants.' };
  }

  const groups = active.map((attribute) => selected[attribute.id] ?? []);
  const combinations = cartesianProduct(groups);

  if (combinations.length > PRODUCT_CONSTRAINTS.VARIANT_MAX) {
    return {
      variants: existing,
      error: `Cannot generate more than ${PRODUCT_CONSTRAINTS.VARIANT_MAX} variants.`,
    };
  }

  const existingByFingerprint = new Map(
    existing.map((variant) => [combinationFingerprint(variant.attributeValueIds), variant])
  );
  const takenSkus = new Set(
    existing.map((variant) => variant.sku.trim().toLowerCase()).filter((sku) => sku.length > 0)
  );

  const nextVariants = combinations.map((attributeValueIds) => {
    const fingerprint = combinationFingerprint(attributeValueIds);
    const current = existingByFingerprint.get(fingerprint);

    if (current?.sku.trim()) {
      return current;
    }

    const sku = generateSku({
      productName,
      attributeValueIds,
      attributes,
      takenSkus,
    });

    if (current) {
      return { ...current, sku };
    }

    return {
      clientId: createClientId(),
      attributeValueIds,
      sku,
      price: defaultPrice,
      compareAtPrice: '',
      quantity: '0',
      reservedQuantity: '0',
      status: 'ACTIVE' as const,
    };
  });

  const leftover = existing.filter(
    (variant) =>
      variant.persistedId &&
      !nextVariants.some((item) => item.clientId === variant.clientId)
  );

  return { variants: [...nextVariants, ...leftover] };
}

export function valueLabelMap(attributes: CatalogAttribute[]): Map<string, { attributeName: string; value: string; colorCode: string | null }> {
  const map = new Map<string, { attributeName: string; value: string; colorCode: string | null }>();

  attributes.forEach((attribute) => {
    attribute.values.forEach((value) => {
      map.set(value.id, {
        attributeName: attribute.name,
        value: value.value,
        colorCode: value.colorCode,
      });
    });
  });

  return map;
}

export function toAllowedContentType(mimeType: string): ProductImageContentType | null {
  if (mimeType === 'image/jpg' || mimeType === 'image/jpeg') {
    return 'image/jpeg';
  }

  if (mimeType === 'image/png' || mimeType === 'image/webp') {
    return mimeType;
  }

  return null;
}

export function formatImageMaxSize(): string {
  return `${Math.round(PRODUCT_IMAGE.MAX_BYTES / (1024 * 1024))} MB`;
}

export function attributeValueLabel(
  attributeValueIds: string[],
  attributes: CatalogAttribute[],
  labels: Map<string, { attributeName: string; value: string; colorCode: string | null }>
): string {
  if (attributeValueIds.length === 0) {
    return 'Default';
  }

  const ordered = attributes.flatMap((attribute) =>
    attributeValueIds
      .filter((id) => attribute.values.some((value) => value.id === id))
      .map((id) => labels.get(id)?.value ?? id)
  );

  return ordered.join(' / ');
}
