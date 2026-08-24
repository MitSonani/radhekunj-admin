'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  SESSION_CHANGE_EVENT,
  clearSession,
  getSession,
  setAccessToken,
  setSessionUser,
  type AuthSession,
  type SessionUser,
} from '@/lib/auth';

const emptySession: AuthSession = { token: null, user: null };
let cachedSnapshot: AuthSession = emptySession;

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SESSION_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getClientSnapshot(): AuthSession {
  const next = getSession();
  const cachedUser = cachedSnapshot.user;
  const nextUser = next.user;

  if (
    cachedSnapshot.token === next.token &&
    cachedUser?.id === nextUser?.id &&
    cachedUser?.name === nextUser?.name
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = next;
  return cachedSnapshot;
}

function getServerSnapshot(): AuthSession {
  return emptySession;
}

/**
 * Client session hook.
 * Login/logout against the Backend is not wired yet; this prepares the session surface.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const persistSession = useCallback((nextToken: string, nextUser: SessionUser) => {
    setAccessToken(nextToken);
    setSessionUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  return {
    token: session.token,
    user: session.user,
    isReady: true,
    isAuthenticated: Boolean(session.token),
    persistSession,
    logout,
  };
}
