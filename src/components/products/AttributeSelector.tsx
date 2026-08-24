'use client';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import type { CatalogAttribute } from '@/hooks/useCatalogOptions';
import { cn } from '@/lib/utils';
import { isColorAttribute } from './productFormUtils';

interface AttributeSelectorProps {
  attributes: CatalogAttribute[];
  selected: Record<string, string[]>;
  disabled?: boolean;
  onChange: (next: Record<string, string[]>) => void;
}

function toggleValue(current: string[], valueId: string): string[] {
  if (current.includes(valueId)) {
    return current.filter((id) => id !== valueId);
  }

  return [...current, valueId];
}

export function AttributeSelector({ attributes, selected, disabled = false, onChange }: AttributeSelectorProps) {
  if (attributes.length === 0) {
    return (
      <EmptyState
        title="No attributes available"
        description="Create attributes and values in Catalog before generating product variants."
        className="min-h-[160px] rounded-lg border border-border"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {attributes.map((attribute) => {
        const selectedIds = selected[attribute.id] ?? [];
        const hasValues = attribute.values.length > 0;

        return (
          <div key={attribute.id} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-text">{attribute.name}</p>
                <p className="text-xs text-text-muted">
                  {isColorAttribute(attribute)
                    ? 'Images can be associated with these values.'
                    : 'Select values to include in variant combinations.'}
                </p>
              </div>
              {hasValues && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => {
                    const allSelected = selectedIds.length === attribute.values.length;
                    onChange({
                      ...selected,
                      [attribute.id]: allSelected ? [] : attribute.values.map((value) => value.id),
                    });
                  }}
                >
                  {selectedIds.length === attribute.values.length ? 'Clear' : 'Select all'}
                </Button>
              )}
            </div>

            {hasValues ? (
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const isSelected = selectedIds.includes(value.id);

                  return (
                    <label
                      key={value.id}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                        isSelected
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-border bg-surface text-text hover:bg-surface-muted',
                        disabled && 'cursor-not-allowed opacity-60'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() =>
                          onChange({
                            ...selected,
                            [attribute.id]: toggleValue(selectedIds, value.id),
                          })
                        }
                      />
                      {value.colorCode && (
                        <span
                          className="h-3.5 w-3.5 rounded-sm border border-border pointer-events-none"
                          style={{ backgroundColor: value.colorCode }}
                          aria-hidden="true"
                        />
                      )}
                      <span>{value.value}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No values yet for this attribute.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
