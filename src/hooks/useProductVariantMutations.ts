'use client';

import { useCallback, useState } from 'react';
import {
  productService,
  type CreateVariantPayload,
  type Inventory,
  type ProductVariant,
  type SetInventoryPayload,
  type UpdateVariantPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function useProductVariantMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isUpdatingInventory, setIsUpdatingInventory] = useState(false);
  const [busyVariantId, setBusyVariantId] = useState<string | null>(null);

  const createVariant = useCallback(
    async (productId: string, payload: CreateVariantPayload): Promise<ProductVariant> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await productService.createVariant(productId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to create variant');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to create variant');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateVariant = useCallback(
    async (
      productId: string,
      variantId: string,
      payload: UpdateVariantPayload
    ): Promise<ProductVariant> => {
      setIsUpdating(true);
      setBusyVariantId(variantId);
      setError(null);

      try {
        const response = await productService.updateVariant(productId, variantId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update variant');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update variant');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdating(false);
        setBusyVariantId(null);
      }
    },
    []
  );

  const deactivateVariant = useCallback(
    async (productId: string, variantId: string): Promise<ProductVariant> => {
      setIsDeactivating(true);
      setBusyVariantId(variantId);
      setError(null);

      try {
        const response = await productService.deactivateVariant(productId, variantId);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to deactivate variant');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to deactivate variant');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsDeactivating(false);
        setBusyVariantId(null);
      }
    },
    []
  );

  const setInventory = useCallback(
    async (
      productId: string,
      variantId: string,
      payload: SetInventoryPayload
    ): Promise<Inventory> => {
      setIsUpdatingInventory(true);
      setBusyVariantId(variantId);
      setError(null);

      try {
        const response = await productService.setInventory(productId, variantId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update inventory');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update inventory');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdatingInventory(false);
        setBusyVariantId(null);
      }
    },
    []
  );

  return {
    createVariant,
    updateVariant,
    deactivateVariant,
    setInventory,
    error,
    setError,
    isCreating,
    isUpdating,
    isDeactivating,
    isUpdatingInventory,
    busyVariantId,
    isMutating: isCreating || isUpdating || isDeactivating || isUpdatingInventory,
  };
}
