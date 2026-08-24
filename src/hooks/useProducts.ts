'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { productService, type ListProductsParams, type ProductListItem } from '@/services/api';
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

export function useProducts({ page, limit, search, status, categoryId, sku }: ListProductsParams) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(
    async (request: Promise<Awaited<ReturnType<typeof productService.list>>>) => {
      try {
        const response = await request;
        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load products');
        }

        setProducts(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        setProducts([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load products');
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await productService.list({ page, limit, search, status, categoryId, sku });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load products');
        }

        setProducts(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setProducts([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load products');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, status, categoryId, sku]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(productService.list({ page, limit, search, status, categoryId, sku }));
  }, [applyResult, page, limit, search, status, categoryId, sku]);

  return { products, pagination, error, isLoading, refetch };
}
