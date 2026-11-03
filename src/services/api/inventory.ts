import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  InventoryDashboardData,
  InventoryListItem,
  InventoryListParams,
  InventoryMovementListItem,
  InventorySettings,
  StockAdjustmentPayload,
  StockMovementParams,
  UpdateThresholdPayload,
} from '@/types/inventory';

export type InventoryDashboardResponse = ApiResponse<InventoryDashboardData>;
export type InventoryListResponse = ApiResponse<InventoryListItem[]>;
export type InventoryDetailResponse = ApiResponse<{
  item: InventoryListItem;
  movements: InventoryMovementListItem[];
}>;
export type InventoryMovementListResponse = ApiResponse<InventoryMovementListItem[]>;
export type StockAdjustmentResponse = ApiResponse<{
  item: InventoryListItem;
  movement: InventoryMovementListItem;
}>;
export type InventoryThresholdResponse = ApiResponse<InventoryListItem>;
export type InventorySettingsResponse = ApiResponse<InventorySettings>;

export const inventoryService = {
  getDashboard: () =>
    apiClient.get<InventoryDashboardResponse>('/admin/inventory/dashboard'),

  list: (params: InventoryListParams = {}) =>
    apiClient.get<InventoryListResponse>('/admin/inventory', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getVariant: (variantId: string) =>
    apiClient.get<InventoryDetailResponse>(`/admin/inventory/${variantId}`),

  adjustStock: (variantId: string, payload: StockAdjustmentPayload) =>
    apiClient.post<StockAdjustmentResponse>(`/admin/inventory/${variantId}/adjust`, payload),

  updateThreshold: (variantId: string, payload: UpdateThresholdPayload) =>
    apiClient.patch<InventoryThresholdResponse>(`/admin/inventory/${variantId}/threshold`, payload),

  listMovements: (params: StockMovementParams = {}) =>
    apiClient.get<InventoryMovementListResponse>('/admin/inventory/movements', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getSettings: () =>
    apiClient.get<InventorySettingsResponse>('/admin/inventory/settings'),

  updateSettings: (payload: InventorySettings) =>
    apiClient.patch<InventorySettingsResponse>('/admin/inventory/settings', payload),
};

export const inventoryApi = inventoryService;
