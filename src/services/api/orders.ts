import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminPaymentItem,
  AdminShipmentItem,
  CreateShipmentPayload,
  ListOrdersParams,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
  UpdateShipmentStatusPayload,
} from '@/types/orders';

export type OrderListResponse = ApiResponse<AdminOrderListItem[]>;
export type OrderDetailResponse = ApiResponse<AdminOrderDetail>;
export type ShipmentResponse = ApiResponse<AdminShipmentItem>;
export type PaymentItemResponse = ApiResponse<AdminPaymentItem>;

export const orderService = {
  list: (params: ListOrdersParams = {}) =>
    apiClient.get<OrderListResponse>('/admin/orders', {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentStatus,
        shipmentStatus: params.shipmentStatus,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    }),

  getById: (id: string) =>
    apiClient.get<OrderDetailResponse>(`/admin/orders/${id}`),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    apiClient.patch<OrderDetailResponse>(`/admin/orders/${id}/status`, payload),

  createShipment: (orderId: string, payload: CreateShipmentPayload) =>
    apiClient.post<ShipmentResponse>(`/admin/orders/${orderId}/shipment`, payload),

  updateShipmentStatus: (
    orderId: string,
    shipmentId: string,
    payload: UpdateShipmentStatusPayload
  ) =>
    apiClient.patch<ShipmentResponse>(
      `/admin/orders/${orderId}/shipment/${shipmentId}/status`,
      payload
    ),

  updatePaymentStatus: (
    orderId: string,
    paymentId: string,
    payload: UpdatePaymentStatusPayload
  ) =>
    apiClient.patch<PaymentItemResponse>(
      `/admin/orders/${orderId}/payments/${paymentId}/status`,
      payload
    ),
};

