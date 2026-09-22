'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { LoadingState } from '@/components/common/LoadingState';
import { FormField } from '@/components/forms/FormField';
import { CATEGORY_CONSTRAINTS, COUPON_CONSTRAINTS, PAGINATION } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CouponCategorySelectorProps {
  selectedIds: string[];
  disabled?: boolean;
  error?: string;
  onChange: (nextIds: string[]) => void;
}

export function CouponCategorySelector({
  selectedIds,
  disabled = false,
  error,
  onChange,
}: CouponCategorySelectorProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim().slice(0, CATEGORY_CONSTRAINTS.SEARCH_MAX).toLowerCase());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const { categories, error: loadError, isLoading } = useCategories({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.MAX_LIMIT,
  });

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visibleCategories = useMemo(() => {
    const matched = search
      ? categories.filter((category) => category.name.toLowerCase().includes(search))
      : categories;

    const selected = categories.filter((category) => selectedSet.has(category.id));
    const selectedVisible = selected.filter((category) => !matched.some((item) => item.id === category.id));
    return [...selectedVisible, ...matched];
  }, [categories, search, selectedSet]);

  const toggle = (categoryId: string) => {
    if (disabled) {
      return;
    }

    if (selectedSet.has(categoryId)) {
      onChange(selectedIds.filter((id) => id !== categoryId));
      return;
    }

    if (selectedIds.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS) {
      return;
    }

    onChange([...selectedIds, categoryId]);
  };

  return (
    <FormField
      label="Eligible categories"
      error={error}
      hint="Applies to products in each selected category."
      required
    >
      <div className="rounded-lg border border-border p-3">
        <Input
          label="Search categories"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={CATEGORY_CONSTRAINTS.SEARCH_MAX}
          placeholder="Search categories..."
          disabled={disabled}
        />

        {selectedIds.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            {selectedIds.length} selected
            {selectedIds.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS
              ? ` (maximum ${COUPON_CONSTRAINTS.MAX_MAPPINGS})`
              : ''}
          </p>
        )}

        <div className="mt-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <LoadingState message="Loading categories..." className="min-h-[120px] p-3" />
          ) : loadError ? (
            <p className="px-1 py-3 text-sm text-danger">{loadError}</p>
          ) : visibleCategories.length === 0 ? (
            <EmptyState
              title={search ? 'No matching categories' : 'No categories found'}
              description={search ? 'Try a different category search.' : 'Create categories in Catalog first.'}
              className="min-h-[120px] py-6"
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {visibleCategories.map((category) => {
                const isSelected = selectedSet.has(category.id);

                return (
                  <li key={category.id}>
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
                        disabled={disabled || (!isSelected && selectedIds.length >= COUPON_CONSTRAINTS.MAX_MAPPINGS)}
                        onChange={() => toggle(category.id)}
                      />
                      <span className="flex-1">{category.name}</span>
                      {category.status === 'INACTIVE' && <Badge variant="muted">Inactive</Badge>}
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
