import { COUPON_CONSTRAINTS, COUPON_STATUS } from '@/constants';
import type {
  CouponDiscountType,
  CouponListItem,
  CouponScope,
  CouponStatus,
  CouponValidity,
} from '@/services/api';
import { ApiError } from '@/types/api';

export type CouponDisplayStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'UPCOMING';

export type CouponFieldErrors = {
  code?: string;
  discountType?: string;
  discountValue?: string;
  scope?: string;
  minimumCartValue?: string;
  maximumDiscount?: string;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: string;
  perUserLimit?: string;
  products?: string;
  categories?: string;
};

const FIELD_ALIASES: Record<string, keyof CouponFieldErrors> = {
  code: 'code',
  discountType: 'discountType',
  discountValue: 'discountValue',
  scope: 'scope',
  minimumCartValue: 'minimumCartValue',
  maximumDiscount: 'maximumDiscount',
  startsAt: 'startsAt',
  expiresAt: 'expiresAt',
  usageLimit: 'usageLimit',
  perUserLimit: 'perUserLimit',
  productIds: 'products',
  products: 'products',
  categoryIds: 'categories',
  categories: 'categories',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatPrice(value: string | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function toDateTimeLocalValue(iso: string | undefined): string {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function normalizeMoney(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (!COUPON_CONSTRAINTS.MONEY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const [whole, fraction = ''] = trimmed.split('.');
  return `${whole}.${fraction.padEnd(2, '0').slice(0, 2)}`;
}

export function getDisplayStatus(coupon: {
  status: CouponStatus;
  validity: CouponValidity;
}): CouponDisplayStatus {
  if (coupon.status === COUPON_STATUS.INACTIVE) {
    return 'INACTIVE';
  }

  if (coupon.validity === 'UPCOMING') {
    return 'UPCOMING';
  }

  if (coupon.validity === 'EXPIRED') {
    return 'EXPIRED';
  }

  return 'ACTIVE';
}

export function displayStatusLabel(status: CouponDisplayStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'EXPIRED':
      return 'Expired';
    case 'UPCOMING':
      return 'Upcoming';
  }
}

export function displayStatusVariant(
  status: CouponDisplayStatus
): 'success' | 'muted' | 'danger' | 'info' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'muted';
    case 'EXPIRED':
      return 'danger';
    case 'UPCOMING':
      return 'info';
  }
}

export function formatDiscount(discountType: CouponDiscountType, discountValue: string): string {
  if (discountType === 'PERCENTAGE') {
    const amount = Number(discountValue);
    return Number.isNaN(amount) ? `${discountValue}%` : `${amount}%`;
  }

  return formatPrice(discountValue);
}

export function formatDiscountType(discountType: CouponDiscountType): string {
  return discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed amount';
}

export function formatScope(scope: CouponScope): string {
  switch (scope) {
    case 'CART':
      return 'Entire cart';
    case 'PRODUCT':
      return 'Products';
    case 'CATEGORY':
      return 'Categories';
  }
}

export function formatUsage(coupon: Pick<CouponListItem, 'usageCount' | 'usageLimit'>): string {
  const used = coupon.usageCount;
  const limit = coupon.usageLimit == null ? 'Unlimited' : String(coupon.usageLimit);
  return `${used} / ${limit}`;
}

export function parseOptionalInteger(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return undefined;
  }

  return parsed;
}

function isFieldErrorItem(value: unknown): value is { field?: unknown; message?: unknown } {
  return typeof value === 'object' && value !== null;
}

export function fieldErrorsFromApi(err: unknown): CouponFieldErrors {
  if (!(err instanceof ApiError) || err.details == null) {
    return {};
  }

  const raw = err.details;
  let items: unknown[] = [];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === 'object' && raw !== null && 'details' in raw && Array.isArray(raw.details)) {
    items = raw.details;
  } else if (typeof raw === 'object' && raw !== null && 'fields' in raw && Array.isArray(raw.fields)) {
    const fields = (raw as { fields: unknown[] }).fields;
    items = fields.map((field) => ({ field, message: err.message }));
  }

  const errors: CouponFieldErrors = {};

  items.forEach((item) => {
    if (!isFieldErrorItem(item) || typeof item.field !== 'string' || typeof item.message !== 'string') {
      return;
    }

    const mapped = FIELD_ALIASES[item.field];
    if (mapped && !errors[mapped]) {
      errors[mapped] = item.message;
    }
  });

  if (err.statusCode === 409 && !errors.code) {
    errors.code = err.message;
  }

  return errors;
}

export function defaultStartsAtLocal(): string {
  return toDateTimeLocalValue(new Date().toISOString());
}

export function defaultExpiresAtLocal(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateTimeLocalValue(date.toISOString());
}
