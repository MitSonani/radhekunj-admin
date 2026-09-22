import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

/**
 * Backend Coupon admin contract:
 * POST   /api/v1/admin/coupons
 * GET    /api/v1/admin/coupons
 * GET    /api/v1/admin/coupons/:id
 * PATCH  /api/v1/admin/coupons/:id
 * PATCH  /api/v1/admin/coupons/:id/activate
 * PATCH  /api/v1/admin/coupons/:id/deactivate
 * DELETE /api/v1/admin/coupons/:id                      (archives by deactivating)
 * GET    /api/v1/admin/coupons/:id/usages
 *
 * `status` is the stored ACTIVE/INACTIVE flag.
 * `validity` is derived by the Backend from startsAt/expiresAt: CURRENT | UPCOMING | EXPIRED.
 * CART create/update bodies must omit productIds and categoryIds.
 */

export type CouponStatus = 'ACTIVE' | 'INACTIVE';
export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type CouponScope = 'CART' | 'PRODUCT' | 'CATEGORY';
export type CouponValidity = 'CURRENT' | 'UPCOMING' | 'EXPIRED';

export type CouponCatalogTarget = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type CouponListItem = {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  scope: CouponScope;
  minimumCartValue: string | null;
  maximumDiscount: string | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  status: CouponStatus;
  validity: CouponValidity;
  createdAt: string;
  updatedAt: string;
};

export type CouponDetail = CouponListItem & {
  products: CouponCatalogTarget[];
  categories: CouponCatalogTarget[];
};

export type CouponUsage = {
  id: string;
  couponId: string;
  userId: string;
  orderId: string | null;
  discountAmount: string;
  createdAt: string;
};

export type ListCouponsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CouponStatus;
  discountType?: CouponDiscountType;
  scope?: CouponScope;
  validity?: CouponValidity;
};

export type ListCouponUsagesParams = {
  page?: number;
  limit?: number;
};

type CouponWritableFields = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minimumCartValue?: string | null;
  maximumDiscount?: string | null;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  status?: CouponStatus;
};

export type CreateCouponPayload =
  | (CouponWritableFields & { scope: 'CART' })
  | (CouponWritableFields & { scope: 'PRODUCT'; productIds: string[] })
  | (CouponWritableFields & { scope: 'CATEGORY'; categoryIds: string[] });

export type UpdateCouponPayload = {
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: string;
  scope?: CouponScope;
  minimumCartValue?: string | null;
  maximumDiscount?: string | null;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  status?: CouponStatus;
  productIds?: string[];
  categoryIds?: string[];
};

export type CouponListResponse = ApiResponse<CouponListItem[]>;
export type CouponResponse = ApiResponse<CouponDetail>;
export type CouponUsageListResponse = ApiResponse<CouponUsage[]>;

export const couponService = {
  list: (params: ListCouponsParams = {}) =>
    apiClient.get<CouponListResponse>('/admin/coupons', { params }),

  getById: (id: string) => apiClient.get<CouponResponse>(`/admin/coupons/${id}`),

  create: (payload: CreateCouponPayload) =>
    apiClient.post<CouponResponse>('/admin/coupons', payload),

  update: (id: string, payload: UpdateCouponPayload) =>
    apiClient.patch<CouponResponse>(`/admin/coupons/${id}`, payload),

  activate: (id: string) => apiClient.patch<CouponResponse>(`/admin/coupons/${id}/activate`),

  deactivate: (id: string) => apiClient.patch<CouponResponse>(`/admin/coupons/${id}/deactivate`),

  archive: (id: string) => apiClient.delete<CouponResponse>(`/admin/coupons/${id}`),

  listUsages: (id: string, params: ListCouponUsagesParams = {}) =>
    apiClient.get<CouponUsageListResponse>(`/admin/coupons/${id}/usages`, { params }),
};
