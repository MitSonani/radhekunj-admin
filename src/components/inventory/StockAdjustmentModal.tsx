'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type {
  InventoryListItem,
  StockAdjustmentAction,
} from '@/types/inventory';
import { useInventoryMutations } from '@/hooks/useInventoryMutations';
import { ApiError } from '@/types/api';

interface StockAdjustmentModalProps {
  open: boolean;
  variant: InventoryListItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const PRESET_REASONS: Record<StockAdjustmentAction, string[]> = {
  ADD: [
    'Supplier Delivery Restock',
    'Warehouse Transfer In',
    'Customer Return Restock',
    'Inventory Re-count Surplus',
  ],
  REMOVE: [
    'Damaged Goods Write-off',
    'Expired / Defective Stock',
    'Internal Sample / Marketing',
    'Theft / Shrinkage Loss',
  ],
  SET: [
    'Physical Audit Correction',
    'Stocktake Count Reconciliation',
    'System Migration Correction',
  ],
  CORRECTION: [
    'Physical Count Discrepancy Correction',
    'Data Entry Correction',
    'Supplier Invoice Reconciliation',
  ],
};

export function StockAdjustmentModal({
  open,
  variant,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [action, setAction] = useState<StockAdjustmentAction>('ADD');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { adjustStock, isSubmitting } = useInventoryMutations();

  if (!variant) return null;

  const currentTotal = variant.quantity;
  const currentReserved = variant.reservedQuantity;
  const currentAvailable = variant.availableStock;

  const parsedQty = parseInt(quantityInput, 10);
  const isValidNumber = !isNaN(parsedQty) && parsedQty >= 0;

  // Calculate projected new total
  let newTotal = currentTotal;
  let delta = 0;

  if (isValidNumber) {
    if (action === 'ADD') {
      newTotal = currentTotal + parsedQty;
      delta = parsedQty;
    } else if (action === 'REMOVE') {
      newTotal = currentTotal - parsedQty;
      delta = -parsedQty;
    } else if (action === 'SET' || action === 'CORRECTION') {
      newTotal = parsedQty;
      delta = parsedQty - currentTotal;
    }
  }

  const newAvailable = newTotal - currentReserved;

  // Validation rules
  let validationError: string | null = null;
  if (quantityInput.trim() !== '' && !isValidNumber) {
    validationError = 'Please enter a valid non-negative integer quantity';
  } else if (isValidNumber) {
    if (action === 'ADD' && parsedQty <= 0) {
      validationError = 'Quantity to add must be greater than 0';
    } else if (action === 'REMOVE' && parsedQty <= 0) {
      validationError = 'Quantity to remove must be greater than 0';
    } else if (newTotal < 0) {
      validationError = `Cannot reduce inventory below 0. Maximum removable is ${currentTotal}`;
    } else if (newTotal < currentReserved) {
      validationError = `Cannot reduce inventory below reserved stock (${currentReserved} units reserved for pending orders)`;
    }
  }

  const handleSubmit = async () => {
    if (!isValidNumber) {
      setError('Please specify a valid quantity');
      return;
    }
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!reason.trim()) {
      setError('Adjustment reason is required');
      return;
    }

    try {
      setError(null);
      await adjustStock(variant.variantId, {
        action,
        quantity: parsedQty,
        reason: reason.trim(),
        notes: notes.trim() ? notes.trim() : undefined,
      });

      onSuccess(
        `Successfully updated inventory for ${variant.sku}: ${currentTotal} → ${newTotal} (${delta >= 0 ? '+' : ''}${delta})`
      );
      handleClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to adjust stock. Please try again.');
      }
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleClose = () => {
    setQuantityInput('');
    setReason('');
    setNotes('');
    setError(null);
    setIsConfirmOpen(false);
    onClose();
  };

  const isFormValid =
    isValidNumber &&
    !validationError &&
    reason.trim().length >= 3 &&
    (action !== 'ADD' && action !== 'REMOVE' ? true : parsedQty > 0);

  return (
    <>
      <Modal
        open={open && !isConfirmOpen}
        onClose={handleClose}
        title="Adjust Inventory Stock"
        className="max-w-xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="text-xs text-text-muted">
              Admin audit record will be logged automatically.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={action === 'REMOVE' ? 'danger' : 'primary'}
                onClick={() => {
                  if (action === 'REMOVE' || Math.abs(delta) > 50) {
                    setIsConfirmOpen(true);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!isFormValid || isSubmitting}
                isLoading={isSubmitting}
              >
                {action === 'REMOVE' ? 'Confirm Removal' : 'Apply Adjustment'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Target Variant Card */}
          <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-text">{variant.productName}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="font-mono font-medium text-text">{variant.sku}</span>
                  <span>•</span>
                  <span>
                    {variant.attributes && variant.attributes.length > 0
                      ? variant.attributes.map((av) => `${av.name}: ${av.value}`).join(', ')
                      : 'Standard'}
                  </span>
                  <span>•</span>
                  <span className="rounded bg-surface px-1.5 py-0.5 border border-border">
                    {variant.category?.name || 'Category'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted">Available Stock</span>
                <div className="text-lg font-bold text-text">{currentAvailable}</div>
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Adjustment Type
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5 rounded-lg border border-border bg-surface-muted p-1">
              {(
                [
                  { id: 'ADD', label: '+ Add Stock' },
                  { id: 'REMOVE', label: '- Remove' },
                  { id: 'SET', label: '= Set Exact' },
                  { id: 'CORRECTION', label: '~ Correction' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setAction(tab.id);
                    setError(null);
                  }}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    action === tab.id
                      ? 'bg-surface text-text shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-sm font-medium text-text">
              {action === 'ADD' && 'Quantity to Add'}
              {action === 'REMOVE' && 'Quantity to Remove'}
              {action === 'SET' && 'New Total Quantity'}
              {action === 'CORRECTION' && 'Corrected Total Physical Count'}
              <span className="ml-1 text-danger">*</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder={action === 'ADD' ? 'e.g. 20' : action === 'REMOVE' ? 'e.g. 5' : 'e.g. 50'}
              value={quantityInput}
              onChange={(e) => {
                setQuantityInput(e.target.value);
                setError(null);
              }}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-base text-text focus:border-primary focus:outline-none"
            />
          </div>

          {/* Live Preview Box */}
          <div className="rounded-lg border border-border bg-surface p-3 text-xs">
            <div className="font-medium text-text-secondary mb-2">Live Inventory Calculation</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded border border-border bg-surface-muted/40 p-2">
                <span className="text-text-muted block">Current Total</span>
                <span className="font-semibold text-text text-sm">{currentTotal}</span>
              </div>
              <div className="rounded border border-border bg-surface-muted/40 p-2">
                <span className="text-text-muted block">Delta</span>
                <span
                  className={`font-semibold text-sm ${
                    delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-text'
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
              <div className="rounded border border-border bg-surface-muted/40 p-2">
                <span className="text-text-muted block">Reserved</span>
                <span className="font-semibold text-text text-sm">{currentReserved}</span>
              </div>
              <div
                className={`rounded border p-2 ${
                  newAvailable < 0
                    ? 'border-danger/30 bg-danger-soft/20'
                    : 'border-primary/20 bg-primary-soft/10'
                }`}
              >
                <span className="text-text-muted block">New Available</span>
                <span
                  className={`font-bold text-sm ${
                    newAvailable < 0 ? 'text-danger' : 'text-primary'
                  }`}
                >
                  {newAvailable}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="text-sm font-medium text-text">
              Adjustment Reason <span className="text-danger">*</span>
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 mb-2">
              {PRESET_REASONS[action].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    reason === preset
                      ? 'border-primary bg-primary text-surface font-medium'
                      : 'border-border bg-surface hover:bg-surface-muted text-text-secondary'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom reason (min 3 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="text-sm font-medium text-text">Internal Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add supplementary context, supplier invoice number, audit ticket, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-surface p-2.5 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {(error || validationError) && (
            <div className="rounded-md border border-danger/30 bg-danger-soft/30 p-2.5 text-xs text-danger">
              {error || validationError}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Stock Adjustment"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              variant={action === 'REMOVE' ? 'danger' : 'primary'}
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Confirm & Apply
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-text">
          <p>
            Are you sure you want to {action === 'REMOVE' ? 'reduce' : 'update'} inventory for{' '}
            <strong className="font-semibold text-text">{variant.sku}</strong>?
          </p>
          <div className="rounded-md border border-border bg-surface-muted/50 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Previous Available Stock:</span>
              <span className="font-semibold">{currentAvailable}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Adjustment Delta:</span>
              <span
                className={`font-semibold ${
                  delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : ''
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">New Available Stock:</span>
              <span className="font-bold text-text">{newAvailable}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <span className="text-text-muted">Reason:</span>
              <span className="font-medium">{reason}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            This action will be permanently recorded in the stock movements audit log.
          </p>
        </div>
      </Modal>
    </>
  );
}
