'use client';

import { useCallback, useState } from 'react';
import {
  attributeService,
  type AttributeValue,
  type CreateAttributeValuePayload,
  type UpdateAttributeValuePayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return fallback;
  }

  if (err.statusCode === 0 || err.statusCode >= 500) {
    return fallback;
  }

  if (err.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }

  return err.message || fallback;
}

export function useAttributeValueMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createValue = useCallback(
    async (attributeId: string, payload: CreateAttributeValuePayload): Promise<AttributeValue> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await attributeService.createValue(attributeId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to create attribute value');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to create attribute value');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateValue = useCallback(
    async (
      attributeId: string,
      valueId: string,
      payload: UpdateAttributeValuePayload
    ): Promise<AttributeValue> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await attributeService.updateValue(attributeId, valueId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update attribute value');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update attribute value');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteValue = useCallback(async (attributeId: string, valueId: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await attributeService.deleteValue(attributeId, valueId);
      if (!response.success) {
        throw new ApiError(400, response.message || 'Unable to delete attribute value');
      }
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to delete attribute value');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createValue,
    updateValue,
    deleteValue,
    error,
    setError,
    isCreating,
    isUpdating,
    isDeleting,
    isMutating: isCreating || isUpdating || isDeleting,
  };
}
