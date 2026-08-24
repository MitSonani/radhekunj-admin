'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import {
  attributeService,
  categoryService,
  type Attribute,
  type AttributeValue,
  type Category,
} from '@/services/api';
import { ApiError, type PaginationMeta } from '@/types/api';

export type CatalogAttribute = Attribute & { values: AttributeValue[] };

async function fetchAllPages<T>(
  fetchPage: (
    page: number,
    limit: number
  ) => Promise<{ success: boolean; data?: T[]; pagination?: PaginationMeta; message?: string }>,
  fallbackMessage: string
): Promise<T[]> {
  const first = await fetchPage(1, PAGINATION.MAX_LIMIT);
  if (!first.success) {
    throw new ApiError(400, first.message || fallbackMessage);
  }

  const items = [...(first.data ?? [])];
  const totalPages = first.pagination?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage(page, PAGINATION.MAX_LIMIT);
    if (!next.success) {
      throw new ApiError(400, next.message || fallbackMessage);
    }

    items.push(...(next.data ?? []));
  }

  return items;
}

export function useCatalogOptions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [loadedCategories, loadedAttributes] = await Promise.all([
      fetchAllPages(
        (page, limit) => categoryService.list({ page, limit }),
        'Unable to load categories'
      ),
      fetchAllPages(
        (page, limit) => attributeService.list({ page, limit }),
        'Unable to load attributes'
      ),
    ]);

    const attributesWithValues = await Promise.all(
      loadedAttributes.map(async (attribute) => {
        const values = await fetchAllPages(
          (page, limit) => attributeService.listValues(attribute.id, { page, limit }),
          'Unable to load attribute values'
        );

        return { ...attribute, values };
      })
    );

    return { categories: loadedCategories, attributes: attributesWithValues };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await load();
        if (cancelled) {
          return;
        }

        setCategories(result.categories);
        setAttributes(result.attributes);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCategories([]);
        setAttributes([]);
        setError(err instanceof ApiError ? err.message : 'Unable to load catalog options');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await load();
      setCategories(result.categories);
      setAttributes(result.attributes);
    } catch (err) {
      setCategories([]);
      setAttributes([]);
      setError(err instanceof ApiError ? err.message : 'Unable to load catalog options');
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  return { categories, attributes, error, isLoading, refetch };
}
