'use client';

import { useCallback, useEffect, useState } from 'react';
import { productService, type ProductDetail } from '@/services/api';
import { ApiError } from '@/types/api';

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await productService.getById(id);
        if (cancelled) {
          return;
        }

        if (!response.success || !response.data) {
          throw new ApiError(404, response.message || 'Product not found');
        }

        setProduct(response.data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setProduct(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load product');
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
      const response = await productService.getById(id);
      if (!response.success || !response.data) {
        throw new ApiError(404, response.message || 'Product not found');
      }

      setProduct(response.data);
    } catch (err) {
      setProduct(null);
      setError(err instanceof ApiError ? err.message : 'Unable to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { product, error, isLoading, refetch };
}
