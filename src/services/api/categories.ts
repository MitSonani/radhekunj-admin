import { CATEGORY_IMAGE } from '@/constants';
import { apiClient } from './apiClient';
import { ApiError, type ApiResponse } from '@/types/api';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListCategoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
};

export type CreateCategoryPayload = {
  name: string;
  description?: string | null;
  status?: CategoryStatus;
  imageKey?: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  description?: string | null;
  status?: CategoryStatus;
  imageKey?: string | null;
};

export type CategoryImageContentType = (typeof CATEGORY_IMAGE.ALLOWED_MIME_TYPES)[number];

export type CreateImageUploadUrlPayload = {
  purpose: typeof CATEGORY_IMAGE.PURPOSE;
  contentType: CategoryImageContentType;
  fileSize: number;
};

export type PresignedUpload = {
  uploadUrl: string;
  method: 'POST';
  fields: Record<string, string>;
  imageKey: string;
  imageUrl: string;
  expiresIn: number;
  maxSizeBytes: number;
};

export type CategoryListResponse = ApiResponse<Category[]>;
export type CategoryResponse = ApiResponse<Category>;
export type ImageUploadUrlResponse = ApiResponse<PresignedUpload>;

function unwrapData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success || response.data === undefined) {
    throw new ApiError(400, response.message || fallbackMessage);
  }

  return response.data;
}

/**
 * POSTs multipart form data to the Backend-issued S3 presigned POST URL.
 * Progress is UX-only; S3 remains the upload target.
 */
function postToPresignedUrl(
  uploadUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new ApiError(xhr.status, 'Image upload failed. Please try again.'));
    };

    xhr.onerror = () => {
      reject(new ApiError(0, 'Image upload failed. Please try again.'));
    };

    xhr.onabort = () => {
      reject(new ApiError(0, 'Image upload was cancelled.'));
    };

    xhr.send(formData);
  });
}

/**
 * Backend Category admin contract:
 * GET    /api/v1/admin/categories
 * POST   /api/v1/admin/categories
 * GET    /api/v1/admin/categories/:id
 * PATCH  /api/v1/admin/categories/:id
 * DELETE /api/v1/admin/categories/:id
 * POST   /api/v1/admin/categories/image/upload-url
 *
 * Images are uploaded directly to S3 using a presigned POST. The category
 * payload stores `imageKey` only after that upload succeeds.
 */
export const categoryService = {
  list: (params: ListCategoriesParams = {}) =>
    apiClient.get<CategoryListResponse>('/admin/categories', { params }),

  getById: (id: string) => apiClient.get<CategoryResponse>(`/admin/categories/${id}`),

  create: (payload: CreateCategoryPayload) =>
    apiClient.post<CategoryResponse>('/admin/categories', payload),

  update: (id: string, payload: UpdateCategoryPayload) =>
    apiClient.patch<CategoryResponse>(`/admin/categories/${id}`, payload),

  delete: (id: string) => apiClient.delete<ApiResponse>(`/admin/categories/${id}`),

  createImageUploadUrl: (payload: CreateImageUploadUrlPayload) =>
    apiClient.post<ImageUploadUrlResponse>('/admin/categories/image/upload-url', payload),

  async uploadImage(
    file: File,
    contentType: CategoryImageContentType,
    onProgress?: (percent: number) => void
  ): Promise<Pick<PresignedUpload, 'imageKey' | 'imageUrl'>> {
    const response = await categoryService.createImageUploadUrl({
      purpose: CATEGORY_IMAGE.PURPOSE,
      contentType,
      fileSize: file.size,
    });
    const upload = unwrapData(response, 'Failed to generate image upload URL');

    await postToPresignedUrl(upload.uploadUrl, upload.fields, file, onProgress);

    return {
      imageKey: upload.imageKey,
      imageUrl: upload.imageUrl,
    };
  },
};
