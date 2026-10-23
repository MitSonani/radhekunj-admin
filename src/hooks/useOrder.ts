'use client';

import { useCallback, useEffect, useState } from 'react';
import { orderService } from '@/services/api';
import type { AdminOrderDetail } from '@/types/orders';
import { ApiError } from '@/types/api';

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getById(orderId);
      if (!response.success || !response.data) {
        throw new ApiError(404, response.message || 'Order not found');
      }
      setOrder(response.data);
    } catch (err) {
      setOrder(null);
      setError(err instanceof ApiError ? err.message : 'Unable to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!orderId) return;
      try {
        const response = await orderService.getById(orderId);
        if (cancelled) return;
        if (!response.success || !response.data) {
          throw new ApiError(404, response.message || 'Order not found');
        }
        setOrder(response.data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setOrder(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load order');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { order, error, isLoading, refetch: fetchOrder };
}
