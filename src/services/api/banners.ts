import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

export interface AdminBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  desktopImageUrl: string;
  tabletImageUrl?: string | null;
  mobileImageUrl?: string | null;
  desktopImageKey?: string | null;
  tabletImageKey?: string | null;
  mobileImageKey?: string | null;
  altText: string;
  textAlignment: 'left' | 'center' | 'right';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerPayload {
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  desktopImageUrl: string;
  tabletImageUrl?: string | null;
  mobileImageUrl?: string | null;
  desktopImageKey?: string | null;
  tabletImageKey?: string | null;
  mobileImageKey?: string | null;
  altText: string;
  textAlignment?: 'left' | 'center' | 'right';
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string | null;
  badgeText?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  desktopImageUrl?: string;
  tabletImageUrl?: string | null;
  mobileImageUrl?: string | null;
  desktopImageKey?: string | null;
  tabletImageKey?: string | null;
  mobileImageKey?: string | null;
  altText?: string;
  textAlignment?: 'left' | 'center' | 'right';
  isActive?: boolean;
  sortOrder?: number;
}

export interface BannerUploadUrlPayload {
  device: 'desktop' | 'tablet' | 'mobile';
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  method: string;
  fields: Record<string, string>;
  imageKey: string;
  imageUrl: string;
  expiresIn: number;
  maxSizeBytes: number;
}

export const bannerService = {
  async listBanners(): Promise<AdminBannerItem[]> {
    const res = await apiClient.get<ApiResponse<AdminBannerItem[]>>('/admin/banners');
    return res.data ?? [];
  },

  async getBanner(id: string): Promise<AdminBannerItem> {
    const res = await apiClient.get<ApiResponse<AdminBannerItem>>(`/admin/banners/${id}`);
    if (!res.data) throw new Error('Banner not found');
    return res.data;
  },

  async createBanner(payload: CreateBannerPayload): Promise<AdminBannerItem> {
    const res = await apiClient.post<ApiResponse<AdminBannerItem>>('/admin/banners', payload);
    if (!res.data) throw new Error('Failed to create banner');
    return res.data;
  },

  async updateBanner(id: string, payload: UpdateBannerPayload): Promise<AdminBannerItem> {
    const res = await apiClient.put<ApiResponse<AdminBannerItem>>(`/admin/banners/${id}`, payload);
    if (!res.data) throw new Error('Failed to update banner');
    return res.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/banners/${id}`);
  },

  async createUploadUrl(payload: BannerUploadUrlPayload): Promise<PresignedUploadResponse> {
    const res = await apiClient.post<ApiResponse<PresignedUploadResponse>>('/admin/banners/upload-url', payload);
    if (!res.data) throw new Error('Failed to generate upload URL');
    return res.data;
  },
};
