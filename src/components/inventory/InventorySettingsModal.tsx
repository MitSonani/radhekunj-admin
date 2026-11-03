'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { inventoryService } from '@/services/api/inventory';
import type { InventorySettings } from '@/types/inventory';
import { ApiError } from '@/types/api';

interface InventorySettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function InventorySettingsModal({
  open,
  onClose,
  onSuccess,
}: InventorySettingsModalProps) {
  const [defaultThreshold, setDefaultThreshold] = useState<string>('5');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    inventoryService
      .getSettings()
      .then((res) => {
        if (isMounted && res.data) {
          setDefaultThreshold(String(res.data.defaultLowStockThreshold));
        }
      })
      .catch((_err: unknown) => {
        if (isMounted) {
          setError('Failed to load inventory settings');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const parsed = parseInt(defaultThreshold, 10);
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 10000;

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please enter a valid threshold between 0 and 10,000');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await inventoryService.updateSettings({ defaultLowStockThreshold: parsed });
      onSuccess(`Updated default store low-stock threshold to ${parsed} units`);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update inventory settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Store Inventory Settings"
      className="max-w-md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isSaving || isLoading}
            isLoading={isSaving}
          >
            Save Settings
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text">
            Default Low-Stock Threshold
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Applied automatically to all variants without a custom override.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={10000}
              disabled={isLoading}
              value={defaultThreshold}
              onChange={(e) => {
                setDefaultThreshold(e.target.value);
                setError(null);
              }}
              className="h-10 w-32 rounded-md border border-border bg-surface px-3 text-base font-semibold text-text focus:border-primary focus:outline-none disabled:opacity-60"
            />
            <span className="text-sm text-text-secondary">units</span>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface-muted/40 p-3 text-xs text-text-secondary leading-relaxed">
          <strong>Tip:</strong> Individual variants can have customized threshold overrides set from the inventory table.
        </div>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-soft/30 p-2.5 text-xs text-danger">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
