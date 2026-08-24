'use client';

import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/common/EmptyState';
import { PRODUCT_STATUS, PRODUCT_VARIANT_STATUS } from '@/constants';
import type { CatalogAttribute } from '@/hooks/useCatalogOptions';
import { cn } from '@/lib/utils';
import {
  attributeValueLabel,
  type DraftVariant,
  type VariantFieldErrors,
  valueLabelMap,
} from './productFormUtils';

interface VariantTableProps {
  attributes: CatalogAttribute[];
  variants: DraftVariant[];
  errors?: Record<string, VariantFieldErrors>;
  disabled?: boolean;
  busyClientId?: string | null;
  emptyDescription?: string;
  onChange: (clientId: string, patch: Partial<DraftVariant>) => void;
  onRemove?: (clientId: string) => void;
  onSave?: (variant: DraftVariant) => void;
  onDeactivate?: (variant: DraftVariant) => void;
}

export function VariantTable({
  attributes,
  variants,
  errors = {},
  disabled = false,
  busyClientId = null,
  emptyDescription = 'Select attribute values and generate combinations, or add a default variant.',
  onChange,
  onRemove,
  onSave,
  onDeactivate,
}: VariantTableProps) {
  const labels = valueLabelMap(attributes);
  const selectedAttributeColumns = attributes.filter((attribute) =>
    variants.some((variant) => variant.attributeValueIds.some((id) => attribute.values.some((value) => value.id === id)))
  );

  if (variants.length === 0) {
    return (
      <EmptyState
        title="No variants"
        description={emptyDescription}
        className="min-h-[180px] rounded-lg border border-border"
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/70">
            <tr>
              {selectedAttributeColumns.map((attribute) => (
                <th key={attribute.id} className="px-4 py-2.5 font-medium text-text-secondary">
                  {attribute.name}
                </th>
              ))}
              <th className="min-w-40 px-4 py-2.5 font-medium text-text-secondary">SKU</th>
              <th className="min-w-28 px-4 py-2.5 font-medium text-text-secondary">Price</th>
              <th className="min-w-28 px-4 py-2.5 font-medium text-text-secondary">Compare at</th>
              <th className="min-w-24 px-4 py-2.5 font-medium text-text-secondary">Stock</th>
              <th className="min-w-28 px-4 py-2.5 font-medium text-text-secondary">Reserved</th>
              <th className="min-w-28 px-4 py-2.5 font-medium text-text-secondary">Status</th>
              <th className="w-28 px-4 py-2.5 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              const fieldErrors = errors[variant.clientId] ?? {};
              const isBusy = disabled || busyClientId === variant.clientId;
              const reserved = Number(variant.reservedQuantity || '0');
              const quantity = Number(variant.quantity || '0');
              const available = Number.isFinite(quantity) && Number.isFinite(reserved) ? Math.max(quantity - reserved, 0) : null;

              return (
                <tr key={variant.clientId} className="border-b border-border last:border-b-0 align-top">
                  {selectedAttributeColumns.map((attribute) => {
                    const valueId = variant.attributeValueIds.find((id) =>
                      attribute.values.some((value) => value.id === id)
                    );
                    const meta = valueId ? labels.get(valueId) : undefined;

                    return (
                      <td key={attribute.id} className="px-4 py-3">
                        {meta ? (
                          <span className="inline-flex items-center gap-2">
                            {meta.colorCode && (
                              <span
                                className="h-3.5 w-3.5 rounded-sm border border-border"
                                style={{ backgroundColor: meta.colorCode }}
                                aria-hidden="true"
                              />
                            )}
                            {meta.value}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <Input
                      value={variant.sku}
                      onChange={(event) => onChange(variant.clientId, { sku: event.target.value })}
                      maxLength={64}
                      disabled={isBusy}
                      error={fieldErrors.sku}
                      placeholder="SKU"
                      aria-label={`SKU for ${attributeValueLabel(variant.attributeValueIds, attributes, labels)}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={variant.price}
                      onChange={(event) => onChange(variant.clientId, { price: event.target.value })}
                      disabled={isBusy}
                      error={fieldErrors.price}
                      inputMode="decimal"
                      placeholder="0.00"
                      aria-label="Price"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={variant.compareAtPrice}
                      onChange={(event) => onChange(variant.clientId, { compareAtPrice: event.target.value })}
                      disabled={isBusy}
                      error={fieldErrors.compareAtPrice}
                      inputMode="decimal"
                      placeholder="Optional"
                      aria-label="Compare-at price"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={variant.quantity}
                      onChange={(event) => onChange(variant.clientId, { quantity: event.target.value })}
                      disabled={isBusy}
                      error={fieldErrors.quantity}
                      aria-label="Stock quantity"
                    />
                    {available !== null && reserved > 0 && (
                      <p className="mt-1 text-xs text-text-muted">Available {available}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="pt-2 text-sm text-text-secondary">{variant.reservedQuantity || '0'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={variant.status}
                      onChange={(event) =>
                        onChange(variant.clientId, {
                          status: event.target.value as DraftVariant['status'],
                        })
                      }
                      disabled={isBusy}
                      options={[
                        { value: PRODUCT_VARIANT_STATUS.ACTIVE, label: 'Active' },
                        { value: PRODUCT_VARIANT_STATUS.INACTIVE, label: 'Inactive' },
                      ]}
                      aria-label="Variant status"
                    />
                    {variant.status === PRODUCT_STATUS.INACTIVE && (
                      <Badge variant="muted" className="mt-1">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-1">
                      {onSave && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={isBusy}
                          isLoading={busyClientId === variant.clientId}
                          onClick={() => onSave(variant)}
                        >
                          {variant.persistedId ? 'Save' : 'Add'}
                        </Button>
                      )}
                      {variant.persistedId && onDeactivate && variant.status === PRODUCT_VARIANT_STATUS.ACTIVE && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => onDeactivate(variant)}
                        >
                          Deactivate
                        </Button>
                      )}
                      {!variant.persistedId && onRemove && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => onRemove(variant.clientId)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function variantSectionClassName(className?: string) {
  return cn('flex flex-col gap-3', className);
}
