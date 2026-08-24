'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/common/LoadingState';
import { APP_ROUTES } from '@/constants';
import { useIsClient } from '@/hooks/useIsClient';
import { useSession } from '@/hooks/useSession';
import { isAdminRole } from '@/lib/auth';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * UX-only route protection for authenticated admin pages.
 * Backend authorization remains the security boundary.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useSession();
  const hasAdminAccess = isAuthenticated && isAdminRole(user?.role?.name);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (isAuthenticated && !hasAdminAccess) {
      logout();
    }

    if (!hasAdminAccess) {
      router.replace(APP_ROUTES.LOGIN);
    }
  }, [hasAdminAccess, isAuthenticated, isClient, logout, router]);

  if (!isClient || !hasAdminAccess) {
    return <LoadingState fullPage message="Checking session..." />;
  }

  return <>{children}</>;
}
