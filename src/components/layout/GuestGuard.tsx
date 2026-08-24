'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/common/PageLoader';
import { APP_ROUTES } from '@/constants';
import { useIsClient } from '@/hooks/useIsClient';
import { useSession } from '@/hooks/useSession';
import { isAdminRole } from '@/lib/auth';

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * Redirects signed-in admins away from the login screen.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const { isAuthenticated, user } = useSession();
  const hasAdminAccess = isAuthenticated && isAdminRole(user?.role?.name);

  useEffect(() => {
    if (isClient && hasAdminAccess) {
      router.replace(APP_ROUTES.DASHBOARD);
    }
  }, [hasAdminAccess, isClient, router]);

  if (!isClient) {
    return <PageLoader cover="app" message="Loading..." />;
  }

  if (hasAdminAccess) {
    return <PageLoader cover="app" message="Redirecting..." />;
  }

  return <>{children}</>;
}
