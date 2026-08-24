'use client';

import { useCallback, useEffect, useState } from 'react';
import { categoryService, type Category } from '@/services/api';
import { ApiError } from '@/types/api';

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await categoryService.getById(id);
        if (cancelled) {
          return;
        }

        if (!response.success || !response.data) {
          throw new ApiError(404, response.message || 'Category not found');
        }

        setCategory(response.data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCategory(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load category');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.getById(id);
      if (!response.success || !response.data) {
        throw new ApiError(404, response.message || 'Category not found');
      }

      setCategory(response.data);
    } catch (err) {
      setCategory(null);
      setError(err instanceof ApiError ? err.message : 'Unable to load category');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { category, error, isLoading, refetch };
}
