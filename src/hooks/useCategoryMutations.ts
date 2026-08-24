'use client';

import { useCallback, useState } from 'react';
import {
  categoryService,
  type Category,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function useCategoryMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createCategory = useCallback(async (payload: CreateCategoryPayload): Promise<Category> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await categoryService.create(payload);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'Unable to create category');
      }

      return response.data;
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to create category');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await categoryService.update(id, payload);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'Unable to update category');
      }

      return response.data;
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to update category');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await categoryService.delete(id);
      if (!response.success) {
        throw new ApiError(400, response.message || 'Unable to delete category');
      }
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to delete category');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    error,
    setError,
    isCreating,
    isUpdating,
    isDeleting,
    isMutating: isCreating || isUpdating || isDeleting,
  };
}
