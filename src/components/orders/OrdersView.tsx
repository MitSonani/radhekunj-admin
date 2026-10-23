'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/table/DataTable';
import { TableFilters } from '@/components/table/TableFilters';
import { TablePagination } from '@/components/table/TablePagination';
import { APP_ROUTES, PAGINATION } from '@/constants';
import { useOrders } from '@/hooks/useOrders';
import type {
  AdminOrderListItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
} from '@/types/orders';
import {
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

type OrderStatusFilter = 'ALL' | OrderStatus;
type PaymentMethodFilter = 'ALL' | PaymentMethod;
type PaymentStatusFilter = 'ALL' | PaymentStatus;
type ShipmentStatusFilter = 'ALL' | ShipmentStatus;

export function OrdersView() {
  const router = useRouter();
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>('ALL');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<ShipmentStatusFilter>('ALL');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setSearch(nextSearch);
      setPage(PAGINATION.DEFAULT_PAGE);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      paymentMethod: paymentMethodFilter === 'ALL' ? undefined : paymentMethodFilter,
      paymentStatus: paymentStatusFilter === 'ALL' ? undefined : paymentStatusFilter,
      shipmentStatus: shipmentStatusFilter === 'ALL' ? undefined : shipmentStatusFilter,
    }),
    [page, limit, search, statusFilter, paymentMethodFilter, paymentStatusFilter, shipmentStatusFilter]
  );

  const { orders, pagination, error, isLoading, refetch } = useOrders(listParams);

  const hasFilters =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    paymentMethodFilter !== 'ALL' ||
    paymentStatusFilter !== 'ALL' ||
    shipmentStatusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ALL');
    setPaymentMethodFilter('ALL');
    setPaymentStatusFilter('ALL');
    setShipmentStatusFilter('ALL');
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  const columns: DataTableColumn<AdminOrderListItem>[] = [
    {
      id: 'orderNumber',
      header: 'Order #',
      cell: (order) => (
        <div>
          <Link
            href={APP_ROUTES.orderDetail(order.id)}
            className="font-mono text-sm font-semibold text-primary hover:underline"
          >
            {order.orderNumber}
          </Link>
          <div className="text-xs text-text-muted">
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: (order) => (
        <div>
          <div className="font-medium text-text">
            {order.customer.name || 'Anonymous User'}
          </div>
          <div className="text-xs text-text-muted">
            {order.customer.countryCode} {order.customer.mobileNumber}
          </div>
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Date',
      cell: (order) => (
        <span className="text-sm text-text-secondary">
          {formatDateTime(order.createdAt)}
        </span>
      ),
    },
    {
      id: 'totalAmount',
      header: 'Total',
      cell: (order) => (
        <span className="font-semibold text-text">
          {formatCurrency(order.totalAmount)}
        </span>
      ),
    },
    {
      id: 'payment',
      header: 'Payment',
      cell: (order) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs font-medium text-text">
            {getPaymentMethodLabel(order.paymentMethod)}
          </span>
          <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
            {getPaymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Order Status',
      cell: (order) => (
        <Badge variant={getOrderStatusVariant(order.status)}>
          {getOrderStatusLabel(order.status)}
        </Badge>
      ),
    },
    {
      id: 'shipmentStatus',
      header: 'Shipment',
      cell: (order) => (
        <Badge variant={getShipmentStatusVariant(order.shipmentStatus)}>
          {getShipmentStatusLabel(order.shipmentStatus)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (order) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(APP_ROUTES.orderDetail(order.id))}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.DASHBOARD },
          { label: 'Orders' },
        ]}
      />

      <TableFilters>
        <div className="w-full sm:w-64">
          <Input
            aria-label="Search orders"
            placeholder="Search by order #, customer, mobile..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            aria-label="Filter by order status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatusFilter);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
            options={[
              { value: 'ALL', label: 'All Order Statuses' },
              { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            aria-label="Filter by payment method"
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value as PaymentMethodFilter);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
            options={[
              { value: 'ALL', label: 'All Payment Methods' },
              { value: 'COD', label: 'Cash on Delivery' },
              { value: 'RAZORPAY', label: 'Razorpay' },
            ]}
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            aria-label="Filter by payment status"
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as PaymentStatusFilter);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
            options={[
              { value: 'ALL', label: 'All Payment Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'PAID', label: 'Paid' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            aria-label="Filter by shipment status"
            value={shipmentStatusFilter}
            onChange={(e) => {
              setShipmentStatusFilter(e.target.value as ShipmentStatusFilter);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
            options={[
              { value: 'ALL', label: 'All Shipment Statuses' },
              { value: 'NOT_BOOKED', label: 'Not Booked' },
              { value: 'BOOKED', label: 'Booked' },
              { value: 'PICKED_UP', label: 'Picked Up' },
              { value: 'IN_TRANSIT', label: 'In Transit' },
              { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </TableFilters>

      <div className="rounded-lg border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          data={orders}
          getRowId={(order) => order.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No orders found"
          emptyDescription={
            hasFilters
              ? 'Try adjusting your filters or search criteria.'
              : 'Orders will appear here once customers place them.'
          }
        />

        {!isLoading && !error && orders.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              onPageChange={(nextPage) => setPage(nextPage)}
              onPageSizeChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(PAGINATION.DEFAULT_PAGE);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
