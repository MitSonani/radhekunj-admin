'use client';

import { useCallback, useEffect, useState } from 'react';
import { attributeService, type Attribute } from '@/services/api';
import { ApiError } from '@/types/api';

export function useAttribute(id: string) {
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await attributeService.getById(id);
        if (cancelled) {
          return;
        }

        if (!response.success || !response.data) {
          throw new ApiError(404, response.message || 'Attribute not found');
        }

        setAttribute(response.data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setAttribute(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load attribute');
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
      const response = await attributeService.getById(id);
      if (!response.success || !response.data) {
        throw new ApiError(404, response.message || 'Attribute not found');
      }

      setAttribute(response.data);
    } catch (err) {
      setAttribute(null);
      setError(err instanceof ApiError ? err.message : 'Unable to load attribute');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { attribute, error, isLoading, refetch };
}
