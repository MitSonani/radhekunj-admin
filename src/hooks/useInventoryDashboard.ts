'use client';

import { useCallback, useEffect, useState } from 'react';
import { inventoryService } from '@/services/api';
import type { InventoryDashboardData } from '@/types/inventory';
import { ApiError } from '@/types/api';

export function useInventoryDashboard() {
  const [data, setData] = useState<InventoryDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getDashboard();
      if (!res.success || !res.data) {
        throw new ApiError(400, res.message || 'Failed to load inventory dashboard data');
      }
      setData(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load inventory dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
