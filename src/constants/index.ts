export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CATEGORIES: '/categories',
  CATEGORY_NEW: '/categories/new',
  categoryEdit: (id: string) => `/categories/${id}/edit`,
  ATTRIBUTES: '/attributes',
  ATTRIBUTE_NEW: '/attributes/new',
  attributeDetail: (id: string) => `/attributes/${id}`,
  attributeEdit: (id: string) => `/attributes/${id}/edit`,
  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  productDetail: (id: string) => `/products/${id}`,
  productEdit: (id: string) => `/products/${id}/edit`,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  SESSION_USER: 'admin_session_user',
} as const;

/** Matches Backend `requireRole(['admin'])`. */
export const ADMIN_ROLE = 'admin';

/** Matches Backend `sendOtpSchema` / `verifyOtpSchema`. */
export const AUTH_CONSTRAINTS = {
  MIN_MOBILE_DIGITS: 4,
  OTP_LENGTH: 6,
  DEFAULT_COUNTRY_CODE: '+91',
  RESEND_SECONDS: 60,
} as const;

/**
 * Matches Backend `PAGINATION` defaults.
 * List requests must stay within Backend `min 1` / `MAX_LIMIT 100`.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Matches Backend category validation and `CATEGORY_IMAGE` constants.
 * Frontend checks are UX-only; Backend remains authoritative.
 */
export const CATEGORY_CONSTRAINTS = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 2000,
  SEARCH_MAX: 100,
} as const;

export const CATEGORY_IMAGE = {
  MAX_BYTES: 5 * 1024 * 1024,
  PURPOSE: 'category_image',
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

/**
 * Matches Backend `ATTRIBUTE` constants and AttributeValue.colorCode (VarChar 7).
 * Frontend checks are UX-only; Backend remains authoritative.
 */
export const ATTRIBUTE_CONSTRAINTS = {
  NAME_MAX: 100,
  VALUE_MAX: 100,
  SEARCH_MAX: 100,
  COLOR_CODE_PATTERN: /^#[0-9A-Fa-f]{6}$/,
} as const;

/**
 * Matches Backend `PRODUCT` and `PRODUCT_IMAGE` constants.
 * Frontend checks are UX-only; Backend remains authoritative.
 */
export const PRODUCT_CONSTRAINTS = {
  NAME_MAX: 200,
  DESCRIPTION_MAX: 10000,
  SKU_MAX: 64,
  SEARCH_MAX: 100,
  ALT_TEXT_MAX: 255,
  COLOR_ATTRIBUTE_SLUG: 'color',
  VARIANT_MAX: 100,
  SKU_PATTERN: /^[A-Za-z0-9][A-Za-z0-9\-_]*$/,
  MONEY_PATTERN: /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
} as const;

export const PRODUCT_IMAGE = {
  MAX_BYTES: 5 * 1024 * 1024,
  PURPOSE: 'product_image',
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const PRODUCT_VARIANT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
