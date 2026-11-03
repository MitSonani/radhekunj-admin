'use client';

import { useState } from 'react';
import { inventoryService } from '@/services/api';
import type {
  InventorySettings,
  StockAdjustmentPayload,
  UpdateThresholdPayload,
} from '@/types/inventory';
import { ApiError } from '@/types/api';

export function useInventoryMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustStock = async (variantId: string, payload: StockAdjustmentPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await inventoryService.adjustStock(variantId, payload);
      if (!res.success) {
        throw new ApiError(400, res.message || 'Failed to adjust stock');
      }
      return res.data;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to adjust stock';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateThreshold = async (variantId: string, payload: UpdateThresholdPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await inventoryService.updateThreshold(variantId, payload);
      if (!res.success) {
        throw new ApiError(400, res.message || 'Failed to update threshold');
      }
      return res.data;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update threshold';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSettings = async (payload: InventorySettings) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await inventoryService.updateSettings(payload);
      if (!res.success) {
        throw new ApiError(400, res.message || 'Failed to update inventory settings');
      }
      return res.data;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update inventory settings';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    adjustStock,
    updateThreshold,
    updateSettings,
    isSubmitting,
    error,
  };
}
