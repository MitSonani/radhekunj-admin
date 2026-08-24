'use client';

import { useCallback, useState } from 'react';
import {
  productService,
  type CreateProductImagePayload,
  type ProductImage,
  type ProductImageContentType,
  type UpdateProductImagePayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function useProductImageMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = useCallback(
    async (
      productId: string,
      file: File,
      contentType: ProductImageContentType,
      options: Omit<CreateProductImagePayload, 'objectKey'> = {}
    ): Promise<ProductImage> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        return await productService.uploadAndCreateImage(
          productId,
          file,
          contentType,
          options,
          setUploadProgress
        );
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to upload product image');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const updateImage = useCallback(
    async (
      productId: string,
      imageId: string,
      payload: UpdateProductImagePayload
    ): Promise<ProductImage> => {
      setIsUpdating(true);
      setBusyImageId(imageId);
      setError(null);

      try {
        const response = await productService.updateImage(productId, imageId, payload);
        if (!response.success || !response.data) {
          throw new ApiError(400, response.message || 'Unable to update product image');
        }

        return response.data;
      } catch (err) {
        const message = toErrorMessage(err, 'Unable to update product image');
        setError(message);
        throw err instanceof ApiError ? err : new ApiError(0, message);
      } finally {
        setIsUpdating(false);
        setBusyImageId(null);
      }
    },
    []
  );

  const deleteImage = useCallback(async (productId: string, imageId: string): Promise<void> => {
    setIsDeleting(true);
    setBusyImageId(imageId);
    setError(null);

    try {
      const response = await productService.deleteImage(productId, imageId);
      if (!response.success) {
        throw new ApiError(400, response.message || 'Unable to delete product image');
      }
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to delete product image');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeleting(false);
      setBusyImageId(null);
    }
  }, []);

  return {
    uploadImage,
    updateImage,
    deleteImage,
    error,
    setError,
    isUploading,
    isUpdating,
    isDeleting,
    busyImageId,
    uploadProgress,
    isMutating: isUploading || isUpdating || isDeleting,
  };
}
