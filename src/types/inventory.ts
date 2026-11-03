export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type StockAdjustmentAction = 'ADD' | 'REMOVE' | 'SET' | 'CORRECTION';

export type InventoryMovementType =
  | 'STOCK_RECEIVED'
  | 'MANUAL_ADJUSTMENT'
  | 'STOCK_CORRECTION'
  | 'ORDER_PLACED'
  | 'ORDER_RESERVED'
  | 'ORDER_RELEASED'
  | 'ORDER_CANCELLED'
  | 'REFUND_RESTOCKED';

export interface InventoryItemAttribute {
  name: string;
  value: string;
  colorCode?: string | null;
}

export interface InventoryItemCategory {
  id: string;
  name: string;
  slug: string;
}

export interface InventoryListItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  category: InventoryItemCategory;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  attributes: InventoryItemAttribute[];
  quantity: number;
  reservedQuantity: number;
  availableStock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovementAdmin {
  id: string;
  name: string;
  mobileNumber?: string;
}

export interface InventoryMovementListItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  productImage: string | null;
  attributes: InventoryItemAttribute[];
  type: InventoryMovementType;
  previousQuantity: number;
  quantityChange: number;
  newQuantity: number;
  previousReserved: number;
  reservedChange: number;
  newReserved: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  admin: InventoryMovementAdmin | null;
  createdAt: string;
}

export interface InventoryValuation {
  retailValue: string;
  valuationMethod: string;
  currency: string;
}

export interface StockStatusBreakdown {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface InventoryDashboardData {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  totalAvailableStock: number;
  totalReservedStock: number;
  lowStockVariantsCount: number;
  outOfStockVariantsCount: number;
  inventoryValuation: InventoryValuation;
  stockStatusBreakdown: StockStatusBreakdown;
  recentMovements: InventoryMovementListItem[];
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stockStatus?: 'ALL' | StockStatus;
  sortBy?: 'name' | 'sku' | 'stock' | 'availableStock' | 'updatedAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface StockMovementParams {
  page?: number;
  limit?: number;
  variantId?: string;
  type?: InventoryMovementType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface StockAdjustmentPayload {
  action: StockAdjustmentAction;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface UpdateThresholdPayload {
  lowStockThreshold: number;
}

export interface InventorySettings {
  defaultLowStockThreshold: number;
}
