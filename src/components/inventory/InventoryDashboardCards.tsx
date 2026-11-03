'use client';

import type { ReactNode } from 'react';
import type { InventoryDashboardData, StockStatus } from '@/types/inventory';
import { formatCurrency } from './inventoryUtils';

interface InventoryDashboardCardsProps {
  data: InventoryDashboardData | null;
  isLoading: boolean;
  activeStatusFilter?: 'ALL' | StockStatus;
  onSelectStatusFilter?: (status: 'ALL' | StockStatus) => void;
}

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon: ReactNode;
  badge?: ReactNode;
  highlight?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  clickable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  highlight = 'default',
  clickable = false,
  isSelected = false,
  onClick,
}: StatCardProps) {
  const borderHighlight = isSelected
    ? 'border-primary ring-2 ring-primary/20 bg-primary-soft/10'
    : 'border-border bg-surface hover:border-border-hover';

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={`relative flex flex-col justify-between rounded-lg border p-4 shadow-xs transition-all ${borderHighlight} ${
        clickable ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium text-text-secondary">{title}</span>
          <div className="text-2xl font-bold tracking-tight text-text">{value}</div>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-text-secondary">
            {icon}
          </div>
        </div>
      </div>
      {subtitle && <div className="mt-3 text-xs text-text-muted">{subtitle}</div>}
    </div>
  );
}

export function InventoryDashboardCards({
  data,
  isLoading,
  activeStatusFilter,
  onSelectStatusFilter,
}: InventoryDashboardCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-28 animate-pulse flex-col justify-between rounded-lg border border-border bg-surface p-4"
          >
            <div className="h-4 w-20 rounded bg-surface-muted" />
            <div className="h-7 w-16 rounded bg-surface-muted" />
            <div className="h-3 w-28 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* 1. Total Products */}
      <StatCard
        title="Total Products"
        value={data.totalProducts.toLocaleString()}
        subtitle="Catalog Products"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        }
      />

      {/* 2. Total Variants */}
      <StatCard
        title="Total Variants"
        value={data.totalVariants.toLocaleString()}
        subtitle="Active SKU Variants"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        }
      />

      {/* 3. Total Available Stock */}
      <StatCard
        title="Available Stock"
        value={data.totalAvailableStock.toLocaleString()}
        subtitle={`Total: ${data.totalStock.toLocaleString()} | Reserved: ${data.totalReservedStock.toLocaleString()}`}
        icon={
          <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        }
        clickable={Boolean(onSelectStatusFilter)}
        isSelected={activeStatusFilter === 'IN_STOCK'}
        onClick={() => onSelectStatusFilter?.(activeStatusFilter === 'IN_STOCK' ? 'ALL' : 'IN_STOCK')}
      />

      {/* 4. Low Stock */}
      <StatCard
        title="Low Stock"
        value={data.lowStockVariantsCount.toLocaleString()}
        subtitle="Variants below threshold"
        highlight="warning"
        icon={
          <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
        clickable={Boolean(onSelectStatusFilter)}
        isSelected={activeStatusFilter === 'LOW_STOCK'}
        onClick={() => onSelectStatusFilter?.(activeStatusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
      />

      {/* 5. Out of Stock */}
      <StatCard
        title="Out of Stock"
        value={data.outOfStockVariantsCount.toLocaleString()}
        subtitle="Variants with 0 stock"
        highlight="danger"
        icon={
          <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        }
        clickable={Boolean(onSelectStatusFilter)}
        isSelected={activeStatusFilter === 'OUT_OF_STOCK'}
        onClick={() => onSelectStatusFilter?.(activeStatusFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
      />

      {/* 6. Inventory Valuation */}
      <StatCard
        title="Inventory Value"
        value={formatCurrency(data.inventoryValuation.retailValue)}
        subtitle={data.inventoryValuation.valuationMethod || 'Retail Value (Selling Price)'}
        icon={
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
}
