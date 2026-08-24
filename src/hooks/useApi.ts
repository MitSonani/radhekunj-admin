'use client';

import { useCallback, useState } from 'react';
import { ApiError } from '@/types/api';

interface UseApiResult<T, Args extends unknown[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
}

/**
 * Wraps a service function with loading, error, and data state.
 * Pages should call hooks, not the API client directly.
 */
export function useApi<T, Args extends unknown[]>(apiFn: (...args: Args) => Promise<T>): UseApiResult<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'An unexpected error occurred';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}

export type { UseApiResult };
