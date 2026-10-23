import type { BadgeProps } from '@/components/common/Badge';
import type { OrderStatus, PaymentMethod, PaymentStatus, ShipmentStatus } from '@/types/orders';

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function getOrderStatusVariant(status: OrderStatus): BadgeProps['variant'] {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'SHIPPED':
      return 'default';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'muted';
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Pending Payment';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'SHIPPED':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function getPaymentStatusVariant(status: PaymentStatus | null | undefined): BadgeProps['variant'] {
  if (!status) return 'muted';
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
      return 'danger';
    case 'AUTHORIZED':
      return 'info';
    case 'REFUNDED':
      return 'muted';
    default:
      return 'muted';
  }
}

export function getPaymentStatusLabel(status: PaymentStatus | null | undefined): string {
  if (!status) return '—';
  switch (status) {
    case 'PAID':
      return 'Paid';
    case 'PENDING':
      return 'Pending';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'AUTHORIZED':
      return 'Authorized';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return status;
  }
}

export function getPaymentMethodLabel(method: PaymentMethod | null | undefined): string {
  if (!method) return '—';
  switch (method) {
    case 'COD':
      return 'Cash on Delivery';
    case 'RAZORPAY':
      return 'Razorpay';
    default:
      return method;
  }
}

export function getShipmentStatusVariant(status: ShipmentStatus | null | undefined): BadgeProps['variant'] {
  if (!status || status === 'NOT_BOOKED') return 'muted';
  switch (status) {
    case 'BOOKED':
      return 'info';
    case 'PICKED_UP':
      return 'info';
    case 'IN_TRANSIT':
      return 'default';
    case 'OUT_FOR_DELIVERY':
      return 'warning';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'muted';
  }
}

export function getShipmentStatusLabel(status: ShipmentStatus | null | undefined): string {
  if (!status) return 'Not Booked';
  switch (status) {
    case 'NOT_BOOKED':
      return 'Not Booked';
    case 'BOOKED':
      return 'Booked';
    case 'PICKED_UP':
      return 'Picked Up';
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export const VALID_ORDER_NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const VALID_SHIPMENT_NEXT_STATUSES: Record<ShipmentStatus, ShipmentStatus[]> = {
  NOT_BOOKED: ['BOOKED'],
  BOOKED: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};
