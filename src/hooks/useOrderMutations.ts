'use client';

import { useState } from 'react';
import { orderService } from '@/services/api';
import type {
  CreateShipmentPayload,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from '@/types/orders';

export function useOrderMutations() {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isUpdatingShipmentStatus, setIsUpdatingShipmentStatus] = useState(false);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdatingStatus(true);
    setError(null);
    try {
      const response = await orderService.updateStatus(orderId, { status });
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      setError(msg);
      throw err;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const createShipment = async (orderId: string, payload: CreateShipmentPayload) => {
    setIsCreatingShipment(true);
    setError(null);
    try {
      const response = await orderService.createShipment(orderId, payload);
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create shipment';
      setError(msg);
      throw err;
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const updateShipmentStatus = async (
    orderId: string,
    shipmentId: string,
    status: ShipmentStatus
  ) => {
    setIsUpdatingShipmentStatus(true);
    setError(null);
    try {
      const response = await orderService.updateShipmentStatus(orderId, shipmentId, { status });
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update shipment status';
      setError(msg);
      throw err;
    } finally {
      setIsUpdatingShipmentStatus(false);
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    paymentId: string,
    paymentStatus: PaymentStatus
  ) => {
    setIsUpdatingPaymentStatus(true);
    setError(null);
    try {
      const response = await orderService.updatePaymentStatus(orderId, paymentId, {
        paymentStatus,
      });
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(msg);
      throw err;
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  return {
    updateOrderStatus,
    createShipment,
    updateShipmentStatus,
    updatePaymentStatus,
    isUpdatingStatus,
    isCreatingShipment,
    isUpdatingShipmentStatus,
    isUpdatingPaymentStatus,
    error,
    setError,
  };
}
