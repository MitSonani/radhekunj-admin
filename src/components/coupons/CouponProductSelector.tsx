'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { LoadingState } from '@/components/common/LoadingState';
import { FormField } from '@/components/forms/FormField';
import { COUPON_CONSTRAINTS, PAGINATION, PRODUCT_CONSTRAINTS } from '@/constants';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import type { CouponCatalogTarget } from '@/services/api';

export type SelectedCouponProduct = Pick<CouponCatalogTarget, 'id' | 'name' | 'status'>;

interface CouponProductSelectorProps {
  selected: SelectedCouponProduct[];
  disabled?: boolean;
  error?: string;
  onChange: (next: SelectedCouponProduct[]) => void;
}

export function CouponProductSelector({
  selected,
  disabled = false,
  error,
  onChange,
}: CouponProductSelectorProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim().slice(0, PRODUCT_CONSTRAINTS.SEARCH_MAX));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { products, error: loadError, isLoading } = useProducts({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    search: search || undefined,
  });

  const selectedIds = useMemo(() => new Set(selected.map((product) => product.id)), [selected]);

  const visibleProducts = useMemo(() => {
    const byId = new Map<string, SelectedCouponProduct>();
    selected.forEach((product) => {
      byId.set(product.id, product);
    });
    products.forEach((product) => {
      if (!byId.has(product.id)) {
        byId.set(product.id, { id: product.id, name: product.name, status: product.status });
      }
    });
    return [...byId.values()];
  }, [products, selected]);

  const toggle = (product: SelectedCouponProduct) => {
    if (disabled) {
      return;
    }

    if (selectedIds.has(product.id)) {
      onChange(selected.filter((item) => item.id !== product.id));
      return;
    }

    if (selected.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS) {
      return;
    }

    onChange([...selected, product]);
  };

  return (
    <FormField
      label="Eligible products"
      error={error}
      hint="Applies to all variants of each selected product. Search uses the Product catalog API."
      required
    >
      <div className="rounded-lg border border-border p-3">
        <Input
          label="Search products"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={PRODUCT_CONSTRAINTS.SEARCH_MAX}
          placeholder="Search products..."
          disabled={disabled}
        />

        {selected.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            {selected.length} selected
            {selected.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS
              ? ` (maximum ${COUPON_CONSTRAINTS.MAX_MAPPINGS})`
              : ''}
          </p>
        )}

        <div className="mt-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <LoadingState message="Searching products..." className="min-h-[120px] p-3" />
          ) : loadError ? (
            <p className="px-1 py-3 text-sm text-danger">{loadError}</p>
          ) : visibleProducts.length === 0 ? (
            <EmptyState
              title={search ? 'No matching products' : 'No products found'}
              description={search ? 'Try a different product search.' : 'Create products in Catalog first.'}
              className="min-h-[120px] py-6"
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {visibleProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);

                return (
                  <li key={product.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors',
                        isSelected
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-transparent text-text hover:bg-surface-muted',
                        disabled && 'cursor-not-allowed opacity-60'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={isSelected}
                        disabled={disabled || (!isSelected && selected.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS)}
                        onChange={() => toggle(product)}
                      />
                      <span className="flex-1">{product.name}</span>
                      {product.status === 'INACTIVE' && <Badge variant="muted">Inactive</Badge>}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </FormField>
  );
}
