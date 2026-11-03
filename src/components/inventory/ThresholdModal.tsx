'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type { InventoryListItem } from '@/types/inventory';
import { useInventoryMutations } from '@/hooks/useInventoryMutations';
import { ApiError } from '@/types/api';

interface ThresholdModalProps {
  open: boolean;
  variant: InventoryListItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ThresholdModal({ open, variant, onClose, onSuccess }: ThresholdModalProps) {
  const [thresholdInput, setThresholdInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { updateThreshold, isSubmitting } = useInventoryMutations();

  useEffect(() => {
    if (variant) {
      setThresholdInput(String(variant.lowStockThreshold));
      setError(null);
    }
  }, [variant]);

  if (!variant) return null;

  const parsed = parseInt(thresholdInput, 10);
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 10000;

  const currentAvailable = variant.availableStock;
  const willBeLowStock = isValid && currentAvailable > 0 && currentAvailable <= parsed;
  const willBeOutOfStock = currentAvailable <= 0;

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please enter a valid threshold between 0 and 10,000');
      return;
    }

    try {
      setError(null);
      await updateThreshold(variant.variantId, { lowStockThreshold: parsed });
      onSuccess(
        `Updated low-stock threshold for ${variant.sku} to ${parsed} units`
      );
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update threshold');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configure Low-Stock Threshold"
      className="max-w-md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
            Save Threshold
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
          <div className="text-sm font-semibold text-text">{variant.productName}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span className="font-mono text-text">{variant.sku}</span>
            <span>•</span>
            <span>Available Stock: <strong className="text-text">{currentAvailable}</strong></span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text">
            Low-Stock Alert Threshold <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            When available stock drops below or equals this number, it will be flagged as Low Stock.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={10000}
              value={thresholdInput}
              onChange={(e) => {
                setThresholdInput(e.target.value);
                setError(null);
              }}
              className="h-10 w-32 rounded-md border border-border bg-surface px-3 text-base font-semibold text-text focus:border-primary focus:outline-none"
            />
            <span className="text-sm text-text-secondary">units</span>
          </div>
        </div>

        {/* Status Preview */}
        <div className="rounded-md border border-border bg-surface p-3 text-xs space-y-1.5">
          <span className="font-medium text-text-secondary block">Threshold Status Preview</span>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Resulting Stock Status:</span>
            {willBeOutOfStock ? (
              <span className="inline-flex rounded-full bg-danger-soft px-2 py-0.5 font-medium text-danger">
                Out of Stock
              </span>
            ) : willBeLowStock ? (
              <span className="inline-flex rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning">
                Low Stock (Alert Triggered)
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-success-soft px-2 py-0.5 font-medium text-success">
                In Stock (Healthy)
              </span>
            )}
          </div>
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
