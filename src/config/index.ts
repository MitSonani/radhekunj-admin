/**
 * Environment and runtime configuration.
 * NEXT_PUBLIC_* values are exposed to the browser and must never contain secrets.
 */
export const config = {
  appName: 'AURA Admin',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
