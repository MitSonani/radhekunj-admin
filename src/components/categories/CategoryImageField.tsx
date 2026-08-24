'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/forms/FormField';
import { CATEGORY_IMAGE } from '@/constants';
import { categoryService, type CategoryImageContentType } from '@/services/api';
import { cn } from '@/lib/utils';
import { ApiError } from '@/types/api';

export type CategoryImageChange = {
  imageKey: string | null | undefined;
  isUploading: boolean;
};

interface CategoryImageFieldProps {
  existingImageUrl?: string | null;
  disabled?: boolean;
  error?: string;
  onChange: (value: CategoryImageChange) => void;
}

function toAllowedContentType(mimeType: string): CategoryImageContentType | null {
  if (mimeType === 'image/jpg' || mimeType === 'image/jpeg') {
    return 'image/jpeg';
  }

  if (mimeType === 'image/png' || mimeType === 'image/webp') {
    return mimeType;
  }

  return null;
}

function formatMaxSize(): string {
  return `${Math.round(CATEGORY_IMAGE.MAX_BYTES / (1024 * 1024))} MB`;
}

export function CategoryImageField({ existingImageUrl, disabled = false, error, onChange }: CategoryImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
  const [committedPreviewUrl, setCommittedPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
  const [committedKey, setCommittedKey] = useState<string | null | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadSucceeded, setUploadSucceeded] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const commit = (nextKey: string | null | undefined, nextPreview: string | null, succeeded: boolean) => {
    setCommittedKey(nextKey);
    setCommittedPreviewUrl(nextPreview);
    setPreviewUrl(nextPreview);
    setUploadSucceeded(succeeded);
    setIsUploading(false);
    setProgress(succeeded ? 100 : 0);
    onChange({ imageKey: nextKey, isUploading: false });
  };

  const handleRemove = () => {
    requestIdRef.current += 1;
    clearObjectUrl();
    resetInput();
    setLocalError(null);
    const nextKey = existingImageUrl ? null : undefined;
    commit(nextKey, null, false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const contentType = toAllowedContentType(file.type);
    if (!contentType) {
      setLocalError('Unsupported image type. Use JPEG, PNG, or WebP.');
      resetInput();
      return;
    }

    if (file.size <= 0 || file.size > CATEGORY_IMAGE.MAX_BYTES) {
      setLocalError(`Image cannot exceed ${formatMaxSize()}.`);
      resetInput();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    clearObjectUrl();
    const nextPreview = URL.createObjectURL(file);
    objectUrlRef.current = nextPreview;

    setPreviewUrl(nextPreview);
    setLocalError(null);
    setUploadSucceeded(false);
    setIsUploading(true);
    setProgress(0);
    onChange({ imageKey: committedKey, isUploading: true });

    try {
      const uploaded = await categoryService.uploadImage(file, contentType, (percent) => {
        if (requestIdRef.current === requestId) {
          setProgress(percent);
        }
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      commit(uploaded.imageKey, nextPreview, true);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      clearObjectUrl();
      setPreviewUrl(committedPreviewUrl);
      setIsUploading(false);
      setProgress(0);
      setUploadSucceeded(false);
      setLocalError(err instanceof ApiError ? err.message : 'Image upload failed. Please try again.');
      onChange({ imageKey: committedKey, isUploading: false });
      resetInput();
    }
  };

  const displayError = error || localError;
  const canRemove = Boolean(previewUrl);
  const isBusy = disabled || isUploading;

  return (
    <FormField
      label="Image"
      htmlFor={inputId}
      error={displayError ?? undefined}
      hint={!displayError ? `JPEG, PNG, or WebP. Maximum ${formatMaxSize()}.` : undefined}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
          {previewUrl ? (
            // Native img: category images come from Backend/S3 URLs that are not in next/image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={isUploading ? 'Uploading category image' : 'Category preview'}
              className={cn('h-full w-full object-cover', isUploading && 'opacity-70')}
            />
          ) : (
            <span className="px-2 text-center text-xs text-text-muted">No image</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            disabled={isBusy}
            onChange={handleFileChange}
            className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary hover:file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />

          {isUploading && (
            <div className="flex flex-col gap-1" role="status" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-text-muted">Uploading image… {progress}%</p>
            </div>
          )}

          {uploadSucceeded && !isUploading && (
            <p className="text-xs text-success">Image uploaded. It will be saved with the category.</p>
          )}

          {canRemove && (
            <div>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isBusy}>
                Remove image
              </Button>
            </div>
          )}
        </div>
      </div>
    </FormField>
  );
}
