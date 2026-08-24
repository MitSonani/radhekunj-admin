'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import {
  attributeService,
  type AttributeValue,
  type ListAttributeValuesParams,
} from '@/services/api';
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

export function useAttributeValues(
  attributeId: string,
  { page, limit, search }: ListAttributeValuesParams
) {
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(
    async (request: Promise<Awaited<ReturnType<typeof attributeService.listValues>>>) => {
      try {
        const response = await request;
        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load attribute values');
        }

        setValues(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        setValues([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load attribute values');
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
        const response = await attributeService.listValues(attributeId, { page, limit, search });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load attribute values');
        }

        setValues(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setValues([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load attribute values');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attributeId, page, limit, search]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(attributeService.listValues(attributeId, { page, limit, search }));
  }, [applyResult, attributeId, page, limit, search]);

  return { values, pagination, error, isLoading, refetch };
}
