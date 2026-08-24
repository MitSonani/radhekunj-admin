'use client';

import { useCallback, useState } from 'react';
import {
  attributeService,
  type Attribute,
  type CreateAttributePayload,
  type UpdateAttributePayload,
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

export function useAttributeMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createAttribute = useCallback(async (payload: CreateAttributePayload): Promise<Attribute> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await attributeService.create(payload);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'Unable to create attribute');
      }

      return response.data;
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to create attribute');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateAttribute = useCallback(
    async (id: string, payload: UpdateAttributePayload): Promise<Attribute> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await attributeService.update(id, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update attribute');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update attribute');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteAttribute = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await attributeService.delete(id);
      if (!response.success) {
        throw new ApiError(400, response.message || 'Unable to delete attribute');
      }
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to delete attribute');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createAttribute,
    updateAttribute,
    deleteAttribute,
    error,
    setError,
    isCreating,
    isUpdating,
    isDeleting,
    isMutating: isCreating || isUpdating || isDeleting,
  };
}
