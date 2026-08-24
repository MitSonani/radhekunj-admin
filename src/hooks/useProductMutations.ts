'use client';

import { useCallback, useState } from 'react';
import {
  productService,
  type CreateProductPayload,
  type ProductDetail,
  type UpdateProductPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function useProductMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const createProduct = useCallback(async (payload: CreateProductPayload): Promise<ProductDetail> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await productService.create(payload);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'Unable to create product');
      }

      return response.data;
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to create product');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, payload: UpdateProductPayload): Promise<ProductDetail> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await productService.update(id, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update product');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update product');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deactivateProduct = useCallback(async (id: string): Promise<ProductDetail> => {
    setIsDeactivating(true);
    setError(null);

    try {
      const response = await productService.deactivate(id);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'Unable to deactivate product');
      }

      return response.data;
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to deactivate product');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeactivating(false);
    }
  }, []);

  return {
    createProduct,
    updateProduct,
    deactivateProduct,
    error,
    setError,
    isCreating,
    isUpdating,
    isDeactivating,
    isMutating: isCreating || isUpdating || isDeactivating,
  };
}
