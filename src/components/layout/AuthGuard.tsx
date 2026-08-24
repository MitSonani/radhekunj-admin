'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/hooks/useSession';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protected-route foundation.
 * Does not redirect yet — admin authentication is not implemented against the Backend contract.
 * Backend authorization remains the security boundary.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  useSession();
  return <>{children}</>;
}
