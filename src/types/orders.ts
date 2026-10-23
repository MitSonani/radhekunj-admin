export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "RAZORPAY";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type ShipmentStatus =
  | "NOT_BOOKED"
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface AdminCustomerSummary {
  id: string;
  name: string | null;
  mobileNumber: string;
  countryCode: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customer: AdminCustomerSummary;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  shipmentStatus: ShipmentStatus | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAddressSnapshot {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  attributes: Array<{ name: string; value: string }>;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentItem {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: string;
  currency: string;
  provider: string | null;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminShipmentItem {
  id: string;
  orderId: string;
  provider: string;
  status: ShipmentStatus;
  trackingNumber: string | null;
  providerShipmentId: string | null;
  providerOrderId: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  bookedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  shippingAddress: AdminAddressSnapshot;
  items: AdminOrderItem[];
  customer: AdminCustomerSummary;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  payments?: AdminPaymentItem[];
  shipment?: AdminShipmentItem;
  shipments?: AdminShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateShipmentPayload {
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  providerShipmentId?: string;
  providerOrderId?: string;
  status?: ShipmentStatus;
}

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListApiResponse {
  success: boolean;
  data: AdminOrderListItem[];
  pagination: PaginationMeta;
}

export interface OrderDetailApiResponse {
  success: boolean;
  data: AdminOrderDetail;
  message?: string;
}
