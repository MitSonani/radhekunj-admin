import { PRODUCT_IMAGE } from '@/constants';
import { apiClient } from './apiClient';
import { ApiError, type ApiResponse } from '@/types/api';

/**
 * Backend Product admin contract:
 * POST   /api/v1/admin/products
 * GET    /api/v1/admin/products
 * GET    /api/v1/admin/products/:id
 * PATCH  /api/v1/admin/products/:id
 * DELETE /api/v1/admin/products/:id                      (deactivates)
 * POST   /api/v1/admin/products/:id/variants
 * PATCH  /api/v1/admin/products/:id/variants/:variantId
 * DELETE /api/v1/admin/products/:id/variants/:variantId  (deactivates)
 * PATCH  /api/v1/admin/products/:id/variants/:variantId/inventory
 * POST   /api/v1/admin/products/:id/variants/:variantId/inventory/adjust
 * POST   /api/v1/admin/products/:id/images/upload-url
 * POST   /api/v1/admin/products/:id/images
 * PATCH  /api/v1/admin/products/:id/images/:imageId
 * DELETE /api/v1/admin/products/:id/images/:imageId
 *
 * Images are uploaded directly to S3 using a Backend-issued presigned POST.
 * Color association is only valid for AttributeValue whose Attribute.slug is `color`.
 */

export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductVariantStatus = 'ACTIVE' | 'INACTIVE';

export type ProductCategorySummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type ProductAttributeSummary = {
  id: string;
  name: string;
  slug: string;
};

export type ProductAttributeValueSummary = {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  colorCode: string | null;
  attribute: ProductAttributeSummary;
};

export type Inventory = {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type VariantAttribute = {
  id: string;
  attributeValueId: string;
  attributeValue: ProductAttributeValueSummary;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  status: ProductVariantStatus;
  attributes: VariantAttribute[];
  inventory: Inventory | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  objectKey: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  attributeValueId: string | null;
  attributeValue: ProductAttributeValueSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductListItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string;
  status: ProductStatus;
  category: ProductCategorySummary;
  primaryImage: ProductImage | null;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string;
  status: ProductStatus;
  category: ProductCategorySummary;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type ListProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  sku?: string;
};

export type VariantInventoryInput = {
  quantity: number;
  reservedQuantity?: number;
};

export type CreateVariantPayload = {
  sku: string;
  price: string;
  compareAtPrice?: string | null;
  status?: ProductVariantStatus;
  attributeValueIds: string[];
  inventory: VariantInventoryInput;
};

export type CreateProductPayload = {
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice: string;
  status?: ProductStatus;
  variants?: CreateVariantPayload[];
};

export type UpdateProductPayload = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  basePrice?: string;
  status?: ProductStatus;
};

export type UpdateVariantPayload = {
  sku?: string;
  price?: string;
  compareAtPrice?: string | null;
  status?: ProductVariantStatus;
  attributeValueIds?: string[];
};

export type SetInventoryPayload = {
  quantity?: number;
  reservedQuantity?: number;
};

export type AdjustInventoryPayload = {
  quantityDelta: number;
};

export type ProductImageContentType = (typeof PRODUCT_IMAGE.ALLOWED_MIME_TYPES)[number];

export type CreateProductImageUploadUrlPayload = {
  purpose: typeof PRODUCT_IMAGE.PURPOSE;
  contentType: ProductImageContentType;
  fileSize: number;
  attributeValueId?: string;
};

export type ProductPresignedUpload = {
  uploadUrl: string;
  method: 'POST';
  fields: Record<string, string>;
  imageKey: string;
  imageUrl: string;
  expiresIn: number;
  maxSizeBytes: number;
};

export type CreateProductImagePayload = {
  objectKey: string;
  attributeValueId?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type UpdateProductImagePayload = {
  objectKey?: string;
  attributeValueId?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductListResponse = ApiResponse<ProductListItem[]>;
export type ProductResponse = ApiResponse<ProductDetail>;
export type ProductVariantResponse = ApiResponse<ProductVariant>;
export type InventoryResponse = ApiResponse<Inventory>;
export type ProductImageResponse = ApiResponse<ProductImage>;
export type ProductImageUploadUrlResponse = ApiResponse<ProductPresignedUpload>;

function unwrapData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success || response.data === undefined) {
    throw new ApiError(400, response.message || fallbackMessage);
  }

  return response.data;
}

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

export const productService = {
  list: (params: ListProductsParams = {}) =>
    apiClient.get<ProductListResponse>('/admin/products', { params }),

  getById: (id: string) => apiClient.get<ProductResponse>(`/admin/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<ProductResponse>('/admin/products', payload),

  update: (id: string, payload: UpdateProductPayload) =>
    apiClient.patch<ProductResponse>(`/admin/products/${id}`, payload),

  deactivate: (id: string) => apiClient.delete<ProductResponse>(`/admin/products/${id}`),

  createVariant: (productId: string, payload: CreateVariantPayload) =>
    apiClient.post<ProductVariantResponse>(`/admin/products/${productId}/variants`, payload),

  updateVariant: (productId: string, variantId: string, payload: UpdateVariantPayload) =>
    apiClient.patch<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}`,
      payload
    ),

  deactivateVariant: (productId: string, variantId: string) =>
    apiClient.delete<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}`
    ),

  setInventory: (productId: string, variantId: string, payload: SetInventoryPayload) =>
    apiClient.patch<InventoryResponse>(
      `/admin/products/${productId}/variants/${variantId}/inventory`,
      payload
    ),

  adjustInventory: (productId: string, variantId: string, payload: AdjustInventoryPayload) =>
    apiClient.post<InventoryResponse>(
      `/admin/products/${productId}/variants/${variantId}/inventory/adjust`,
      payload
    ),

  createImageUploadUrl: (productId: string, payload: CreateProductImageUploadUrlPayload) =>
    apiClient.post<ProductImageUploadUrlResponse>(
      `/admin/products/${productId}/images/upload-url`,
      payload
    ),

  createImage: (productId: string, payload: CreateProductImagePayload) =>
    apiClient.post<ProductImageResponse>(`/admin/products/${productId}/images`, payload),

  updateImage: (productId: string, imageId: string, payload: UpdateProductImagePayload) =>
    apiClient.patch<ProductImageResponse>(
      `/admin/products/${productId}/images/${imageId}`,
      payload
    ),

  deleteImage: (productId: string, imageId: string) =>
    apiClient.delete<ApiResponse>(`/admin/products/${productId}/images/${imageId}`),

  async uploadAndCreateImage(
    productId: string,
    file: File,
    contentType: ProductImageContentType,
    options: Omit<CreateProductImagePayload, 'objectKey'> = {},
    onProgress?: (percent: number) => void
  ): Promise<ProductImage> {
    const response = await productService.createImageUploadUrl(productId, {
      purpose: PRODUCT_IMAGE.PURPOSE,
      contentType,
      fileSize: file.size,
      ...(options.attributeValueId ? { attributeValueId: options.attributeValueId } : {}),
    });
    const upload = unwrapData(response, 'Failed to generate image upload URL');

    await postToPresignedUrl(upload.uploadUrl, upload.fields, file, onProgress);

    const created = await productService.createImage(productId, {
      objectKey: upload.imageKey,
      ...options,
    });

    return unwrapData(created, 'Failed to save product image');
  },
};
