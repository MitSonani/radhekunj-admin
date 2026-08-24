'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { categoryService, type Category, type ListCategoriesParams } from '@/services/api';
import { ApiError, type PaginationMeta } from '@/types/api';

const EMPTY_PAGINATION: PaginationMeta = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
};

function fallbackPagination(page?: number, limit?: number): PaginationMeta {
  return {
    ...EMPTY_PAGINATION,
    page: page ?? PAGINATION.DEFAULT_PAGE,
    limit: limit ?? PAGINATION.DEFAULT_LIMIT,
  };
}

export function useCategories({ page, limit, search, status }: ListCategoriesParams) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(async (request: Promise<Awaited<ReturnType<typeof categoryService.list>>>) => {
    try {
      const response = await request;
      if (!response.success) {
        throw new ApiError(400, response.message || 'Unable to load categories');
      }

      setCategories(response.data ?? []);
      setPagination(response.pagination ?? fallbackPagination(page, limit));
      setError(null);
    } catch (err) {
      setCategories([]);
      setPagination(fallbackPagination(page, limit));
      setError(err instanceof ApiError ? err.message : 'Unable to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await categoryService.list({ page, limit, search, status });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load categories');
        }

        setCategories(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCategories([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load categories');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, status]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(categoryService.list({ page, limit, search, status }));
  }, [applyResult, page, limit, search, status]);

  return { categories, pagination, error, isLoading, refetch };
}
