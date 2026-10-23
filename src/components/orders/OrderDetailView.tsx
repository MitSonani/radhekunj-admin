'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageLoader } from '@/components/common/PageLoader';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/layout/PageHeader';
import { APP_ROUTES } from '@/constants';
import { useOrder } from '@/hooks/useOrder';
import { useOrderMutations } from '@/hooks/useOrderMutations';
import type {
  CreateShipmentPayload,
  OrderStatus,
  ShipmentStatus,
} from '@/types/orders';

import { ApiError } from '@/types/api';
import {
  VALID_ORDER_NEXT_STATUSES,
  VALID_SHIPMENT_NEXT_STATUSES,
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getOrderStatusVariant,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  getShipmentStatusLabel,
  getShipmentStatusVariant,
} from './orderUtils';

interface OrderDetailViewProps {
  orderId: string;
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <h3 className="mb-4 text-base font-semibold text-text">{title}</h3>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { order, error: loadError, isLoading, refetch } = useOrder(orderId);

  const {
    updateOrderStatus,
    createShipment,
    updateShipmentStatus,
    updatePaymentStatus,
    isUpdatingStatus,
    isCreatingShipment,
    isUpdatingShipmentStatus,
    isUpdatingPaymentStatus,
  } = useOrderMutations();

  // Modals & confirmation dialog states
  const [pendingOrderStatus, setPendingOrderStatus] = useState<OrderStatus | null>(null);
  const [showAddShipmentModal, setShowAddShipmentModal] = useState(false);
  const [showUpdateShipmentModal, setShowUpdateShipmentModal] = useState(false);
  const [pendingCodCollect, setPendingCodCollect] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Add shipment form fields
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [providerShipmentId, setProviderShipmentId] = useState('');
  const [providerOrderId, setProviderOrderId] = useState('');
  const [initialShipmentStatus, setInitialShipmentStatus] = useState<ShipmentStatus>('BOOKED');

  // Update shipment status form fields
  const [nextShipmentStatus, setNextShipmentStatus] = useState<ShipmentStatus>('PICKED_UP');

  // Active shipment
  const activeShipment = useMemo(() => {
    if (!order) return null;
    if (order.shipment && order.shipment.status !== 'CANCELLED') {
      return order.shipment;
    }
    if (order.shipments && order.shipments.length > 0) {
      return (
        order.shipments.find((s) => s.status !== 'CANCELLED') ??
        order.shipments[0]
      );
    }
    return null;
  }, [order]);

  // Payment item
  const activePayment = useMemo(() => {
    if (!order) return null;
    if (order.payments && order.payments.length > 0) {
      return order.payments[0];
    }
    return null;
  }, [order]);

  const handleConfirmOrderStatus = async () => {
    if (!order || !pendingOrderStatus) return;
    setActionError(null);
    try {
      await updateOrderStatus(order.id, pendingOrderStatus);
      setPendingOrderStatus(null);
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to update order status'
      );
    }
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionError(null);

    const payload: CreateShipmentPayload = {
      courierName: courierName.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      trackingUrl: trackingUrl.trim() || undefined,
      providerShipmentId: providerShipmentId.trim() || undefined,
      providerOrderId: providerOrderId.trim() || undefined,
      status: initialShipmentStatus,
    };

    try {
      await createShipment(order.id, payload);
      setShowAddShipmentModal(false);
      // Reset form
      setCourierName('');
      setTrackingNumber('');
      setTrackingUrl('');
      setProviderShipmentId('');
      setProviderOrderId('');
      setInitialShipmentStatus('BOOKED');
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to create shipment'
      );
    }
  };

  const handleUpdateShipmentStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !activeShipment) return;
    setActionError(null);

    try {
      await updateShipmentStatus(order.id, activeShipment.id, nextShipmentStatus);
      setShowUpdateShipmentModal(false);
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to update shipment status'
      );
    }
  };

  const handleConfirmCodCollect = async () => {
    if (!order || !activePayment) return;
    setActionError(null);
    try {
      await updatePaymentStatus(order.id, activePayment.id, 'PAID');
      setPendingCodCollect(false);
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to record payment'
      );
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading order details..." />;
  }

  if (loadError || !order) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Order Details"
          breadcrumbs={[
            { label: 'Admin', href: APP_ROUTES.DASHBOARD },
            { label: 'Orders', href: APP_ROUTES.ORDERS },
            { label: 'Error' },
          ]}
        />
        <ErrorState
          title="Order not found"
          message={loadError || 'The requested order could not be loaded.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const validNextStatuses = VALID_ORDER_NEXT_STATUSES[order.status] ?? [];
  const validNextShipmentStatuses = activeShipment
    ? VALID_SHIPMENT_NEXT_STATUSES[activeShipment.status] ?? []
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Orders', href: APP_ROUTES.ORDERS },
          { label: order.orderNumber },
        ]}
      />

      {/* Global Action Error Alert */}
      {actionError && (
        <div className="rounded-md border border-danger/20 bg-danger-soft p-4 text-sm text-danger flex items-center justify-between">
          <span>{actionError}</span>
          <Button variant="ghost" size="sm" onClick={() => setActionError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Top Banner / Order Overview Bar */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={getOrderStatusVariant(order.status)} className="text-sm px-3 py-1">
            {getOrderStatusLabel(order.status)}
          </Badge>
          <span className="text-sm text-text-muted">
            Placed on {formatDateTime(order.createdAt)}
          </span>
        </div>

        {/* Status transition action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {validNextStatuses.includes('CONFIRMED') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPendingOrderStatus('CONFIRMED')}
              disabled={isUpdatingStatus}
            >
              Confirm Order
            </Button>
          )}

          {validNextStatuses.includes('SHIPPED') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPendingOrderStatus('SHIPPED')}
              disabled={isUpdatingStatus}
            >
              Mark Shipped
            </Button>
          )}

          {validNextStatuses.includes('DELIVERED') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPendingOrderStatus('DELIVERED')}
              disabled={isUpdatingStatus}
            >
              Mark Delivered
            </Button>
          )}

          {validNextStatuses.includes('CANCELLED') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setPendingOrderStatus('CANCELLED')}
              disabled={isUpdatingStatus}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Content 2-column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Items & Shipment */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Section */}
          <SectionCard title={`Ordered Items (${order.items.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                    <th className="pb-3 font-medium">Product / SKU</th>
                    <th className="pb-3 text-right font-medium">Price</th>
                    <th className="pb-3 text-center font-medium">Qty</th>
                    <th className="pb-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-muted/50">
                      <td className="py-3">
                        <div className="font-medium text-text">{item.productName}</div>
                        <div className="font-mono text-xs text-text-muted">SKU: {item.sku}</div>
                        {item.attributes && item.attributes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.attributes.map((attr, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-sm bg-surface-muted px-1.5 py-0.5 text-[11px] text-text-secondary"
                              >
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-right font-medium text-text">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-center font-medium text-text">{item.quantity}</td>
                      <td className="py-3 text-right font-semibold text-text">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Shipment & Tracking Details Section */}
          <SectionCard title="Shipment & Shiprocket Tracking">
            <div className="mb-4 rounded-md border border-border bg-surface-muted/60 p-3 text-xs leading-relaxed text-text-secondary">
              <strong className="font-semibold text-text">Manual Shiprocket Workflow:</strong> Shipments
              are booked manually in the Shiprocket portal. Once booked, record the courier name, AWB /
              tracking number, and Shiprocket IDs below to keep customer tracking synchronized.
            </div>

            {activeShipment ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Status:</span>
                    <Badge variant={getShipmentStatusVariant(activeShipment.status)}>
                      {getShipmentStatusLabel(activeShipment.status)}
                    </Badge>
                  </div>

                  {validNextShipmentStatuses.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNextShipmentStatus(validNextShipmentStatuses[0]);
                        setShowUpdateShipmentModal(true);
                      }}
                    >
                      Update Shipment Status
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Courier Partner"
                    value={activeShipment.courierName || 'Not specified'}
                  />
                  <InfoItem
                    label="AWB / Tracking Number"
                    value={
                      activeShipment.trackingNumber ? (
                        <span className="font-mono">{activeShipment.trackingNumber}</span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <InfoItem
                    label="Shiprocket Shipment ID"
                    value={
                      activeShipment.providerShipmentId ? (
                        <span className="font-mono">{activeShipment.providerShipmentId}</span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <InfoItem
                    label="Shiprocket Order ID"
                    value={
                      activeShipment.providerOrderId ? (
                        <span className="font-mono">{activeShipment.providerOrderId}</span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <InfoItem
                    label="Booked At"
                    value={formatDateTime(activeShipment.bookedAt || activeShipment.createdAt)}
                  />
                  <InfoItem
                    label="Shipped At"
                    value={formatDateTime(activeShipment.shippedAt)}
                  />
                  <InfoItem
                    label="Delivered At"
                    value={formatDateTime(activeShipment.deliveredAt)}
                  />
                  <InfoItem
                    label="Tracking URL"
                    value={
                      activeShipment.trackingUrl ? (
                        <a
                          href={activeShipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Open Tracking Link &rarr;
                        </a>
                      ) : (
                        '—'
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Badge variant="muted" className="mb-2">
                  Shipment Not Booked
                </Badge>
                <p className="max-w-md text-xs text-text-muted mb-4">
                  No shipment has been recorded for this order yet. After booking the package on
                  Shiprocket, enter the tracking details here.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddShipmentModal(true)}
                  disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                >
                  Add Booked Shipment Details
                </Button>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column: Customer, Address, Payment, Price Breakdown */}
        <div className="space-y-6">
          {/* Customer Summary Card */}
          <SectionCard title="Customer Information">
            <div className="space-y-3">
              <InfoItem
                label="Full Name"
                value={order.customer.name || 'Anonymous User'}
              />
              <InfoItem
                label="Phone Number"
                value={`${order.customer.countryCode} ${order.customer.mobileNumber}`}
              />
              <InfoItem
                label="Customer ID"
                value={<span className="font-mono text-xs">{order.customer.id}</span>}
              />
            </div>
          </SectionCard>

          {/* Delivery Address Snapshot Card */}
          <SectionCard title="Delivery Address">
            <div className="text-sm text-text leading-relaxed">
              <div className="font-medium">{order.shippingAddress.fullName}</div>
              <div className="text-text-secondary">
                {order.shippingAddress.countryCode} {order.shippingAddress.mobileNumber}
              </div>
              <div className="mt-2 text-text-secondary">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </div>
              <div className="text-text-secondary">
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}
              </div>
              <div className="text-text-secondary">{order.shippingAddress.country}</div>
            </div>
          </SectionCard>

          {/* Payment Details Card */}
          <SectionCard title="Payment Details">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <InfoItem
                  label="Method"
                  value={getPaymentMethodLabel(order.paymentMethod || activePayment?.paymentMethod)}
                />
                <Badge
                  variant={getPaymentStatusVariant(
                    order.paymentStatus || activePayment?.paymentStatus
                  )}
                >
                  {getPaymentStatusLabel(order.paymentStatus || activePayment?.paymentStatus)}
                </Badge>
              </div>

              {activePayment?.providerOrderId && (
                <InfoItem
                  label="Provider Order ID"
                  value={<span className="font-mono text-xs">{activePayment.providerOrderId}</span>}
                />
              )}

              {activePayment?.providerPaymentId && (
                <InfoItem
                  label="Provider Payment ID"
                  value={
                    <span className="font-mono text-xs">{activePayment.providerPaymentId}</span>
                  }
                />
              )}

              {activePayment?.paidAt && (
                <InfoItem label="Paid At" value={formatDateTime(activePayment.paidAt)} />
              )}

              {/* Action to mark COD cash collected */}
              {order.paymentMethod === 'COD' &&
                (order.paymentStatus === 'PENDING' || activePayment?.paymentStatus === 'PENDING') && (
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setPendingCodCollect(true)}
                      disabled={isUpdatingPaymentStatus || order.status === 'CANCELLED'}
                    >
                      Record Cash Collected
                    </Button>
                  </div>
                )}
            </div>
          </SectionCard>

          {/* Price Breakdown Card */}
          <SectionCard title="Payment Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(order.discountAmount || '0') > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Shipping Fee</span>
                <span>
                  {parseFloat(order.shippingFee || '0') === 0
                    ? 'Free'
                    : formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-text">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Modal: Add Booked Shipment Details */}
      <Modal
        open={showAddShipmentModal}
        onClose={() => setShowAddShipmentModal(false)}
        title="Add Booked Shipment Details"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowAddShipmentModal(false)}
              disabled={isCreatingShipment}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddShipment}
              isLoading={isCreatingShipment}
            >
              Save Shipment
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddShipment} className="space-y-4">
          <p className="text-xs text-text-muted">
            Enter the details of the shipment booked on Shiprocket. Saving this will automatically
            transition a Confirmed order to Shipped.
          </p>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Courier Partner Name
            </label>
            <Input
              placeholder="e.g. Blue Dart, Delhivery, DTDC"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              AWB / Tracking Number
            </label>
            <Input
              placeholder="e.g. 1234567890"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Tracking URL
            </label>
            <Input
              placeholder="https://shiprocket.co/tracking/..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Shiprocket Shipment ID
              </label>
              <Input
                placeholder="Optional"
                value={providerShipmentId}
                onChange={(e) => setProviderShipmentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Shiprocket Order ID
              </label>
              <Input
                placeholder="Optional"
                value={providerOrderId}
                onChange={(e) => setProviderOrderId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Initial Shipment Status
            </label>
            <Select
              value={initialShipmentStatus}
              onChange={(e) => setInitialShipmentStatus(e.target.value as ShipmentStatus)}
              options={[
                { value: 'BOOKED', label: 'Booked' },
                { value: 'PICKED_UP', label: 'Picked Up' },
                { value: 'IN_TRANSIT', label: 'In Transit' },
                { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                { value: 'DELIVERED', label: 'Delivered' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Update Shipment Status */}
      <Modal
        open={showUpdateShipmentModal}
        onClose={() => setShowUpdateShipmentModal(false)}
        title="Update Shipment Status"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowUpdateShipmentModal(false)}
              disabled={isUpdatingShipmentStatus}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateShipmentStatus}
              isLoading={isUpdatingShipmentStatus}
            >
              Update Status
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateShipmentStatus} className="space-y-4">
          <p className="text-xs text-text-muted">
            Select the new tracking status as updated in the Shiprocket portal. Marking as
            Delivered will also complete the customer order.
          </p>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              New Status
            </label>
            <Select
              value={nextShipmentStatus}
              onChange={(e) => setNextShipmentStatus(e.target.value as ShipmentStatus)}
              options={validNextShipmentStatuses.map((st) => ({
                value: st,
                label: getShipmentStatusLabel(st),
              }))}
            />
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog: Order Status Change */}
      <ConfirmDialog
        open={pendingOrderStatus !== null}
        onClose={() => setPendingOrderStatus(null)}
        onConfirm={handleConfirmOrderStatus}
        title="Confirm Order Status Change"
        description={`Are you sure you want to change this order's status to "${
          pendingOrderStatus ? getOrderStatusLabel(pendingOrderStatus) : ''
        }"?`}
        confirmLabel="Update Status"
        variant={pendingOrderStatus === 'CANCELLED' ? 'danger' : 'primary'}
        isConfirming={isUpdatingStatus}
      />

      {/* Confirm Dialog: Record COD Payment */}
      <ConfirmDialog
        open={pendingCodCollect}
        onClose={() => setPendingCodCollect(false)}
        onConfirm={handleConfirmCodCollect}
        title="Record Cash Collection"
        description="Are you sure you want to mark this COD order's payment as PAID? This indicates that cash was collected from the customer upon delivery."
        confirmLabel="Mark as Paid"
        variant="primary"
        isConfirming={isUpdatingPaymentStatus}
      />
    </div>
  );
}
