import { STORAGE_KEYS } from '@/constants';
import type { AuthSession, SessionUser } from './types';

export const SESSION_CHANGE_EVENT = 'admin-session-change';

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function notifySessionChange(): void {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

/**
 * Client-side session helpers.
 * The Backend authenticates with a Bearer JWT in the Authorization header.
 * Token persistence is a UI concern only — Backend authorization is authoritative.
 */
export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  notifySessionChange();
}

export function getSessionUser(): SessionUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.SESSION_USER);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(user));
  notifySessionChange();
}

export function persistSession(token: string, user: SessionUser): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  window.localStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(user));
  notifySessionChange();
}

export function getSession(): AuthSession {
  return {
    token: getAccessToken(),
    user: getSessionUser(),
  };
}

export function clearSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(STORAGE_KEYS.SESSION_USER);
  notifySessionChange();
}
