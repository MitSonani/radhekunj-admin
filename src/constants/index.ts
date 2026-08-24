export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
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
