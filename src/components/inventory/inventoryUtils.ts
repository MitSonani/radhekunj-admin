import type { BadgeProps } from '@/components/common/Badge';
import type { InventoryMovementType, StockStatus } from '@/types/inventory';

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

export function getStockStatusVariant(status: StockStatus): BadgeProps['variant'] {
  switch (status) {
    case 'IN_STOCK':
      return 'success';
    case 'LOW_STOCK':
      return 'warning';
    case 'OUT_OF_STOCK':
      return 'danger';
    default:
      return 'muted';
  }
}

export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'IN_STOCK':
      return 'In Stock';
    case 'LOW_STOCK':
      return 'Low Stock';
    case 'OUT_OF_STOCK':
      return 'Out of Stock';
    default:
      return status;
  }
}

export function getMovementTypeVariant(type: InventoryMovementType): BadgeProps['variant'] {
  switch (type) {
    case 'STOCK_RECEIVED':
      return 'success';
    case 'MANUAL_ADJUSTMENT':
      return 'default';
    case 'STOCK_CORRECTION':
      return 'warning';
    case 'ORDER_PLACED':
      return 'info';
    case 'ORDER_RESERVED':
      return 'muted';
    case 'ORDER_RELEASED':
      return 'info';
    case 'ORDER_CANCELLED':
      return 'success';
    case 'REFUND_RESTOCKED':
      return 'success';
    default:
      return 'muted';
  }
}

export function getMovementTypeLabel(type: InventoryMovementType): string {
  switch (type) {
    case 'STOCK_RECEIVED':
      return 'Stock Received';
    case 'MANUAL_ADJUSTMENT':
      return 'Manual Adjustment';
    case 'STOCK_CORRECTION':
      return 'Stock Correction';
    case 'ORDER_PLACED':
      return 'Order Placed';
    case 'ORDER_RESERVED':
      return 'Order Reserved';
    case 'ORDER_RELEASED':
      return 'Order Released';
    case 'ORDER_CANCELLED':
      return 'Order Cancelled';
    case 'REFUND_RESTOCKED':
      return 'Refund Restocked';
    default:
      return type;
  }
}

export function formatStockDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}
