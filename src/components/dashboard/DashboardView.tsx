'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  analyticsService,
  type DashboardAnalyticsData,
  type AnalyticsDateRangeQuery,
} from '@/services/api/analytics';
import { formatCurrency, formatDateTime } from '@/components/orders/orderUtils';

type PresetRange = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'custom';

export function DashboardView() {
  const [range, setRange] = useState<PresetRange>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [appliedCustom, setAppliedCustom] = useState<{ start: string; end: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    if (range === 'custom' && !appliedCustom) {
      return;
    }

    let isCancelled = false;

    const runFetch = async () => {
      try {
        const query: AnalyticsDateRangeQuery = {
          range,
          ...(range === 'custom' && appliedCustom ? { startDate: appliedCustom.start, endDate: appliedCustom.end } : {}),
        };
        const result = await analyticsService.getDashboardAnalytics(query);
        if (!isCancelled) {
          setData(result);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load analytics dashboard data';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void runFetch();

    return () => {
      isCancelled = true;
    };
  }, [range, appliedCustom, reloadKey]);

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setError('Please select both start and end dates.');
      return;
    }
    setLoading(true);
    setAppliedCustom({ start: customStart, end: customEnd });
  };

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard & Analytics"
          description="Server-authoritative ecommerce metrics, sales trends, and inventory health."
          breadcrumbs={[{ label: 'Admin', href: '/dashboard' }, { label: 'Analytics' }]}
        />

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start rounded-lg border border-border bg-surface p-1 shadow-sm">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'ytd', label: 'YTD' },
              { id: 'custom', label: 'Custom' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setRange(item.id);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === item.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Form */}
      {range === 'custom' && (
        <form
          onSubmit={handleCustomApply}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
        >
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-text-secondary">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="mt-1 block rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text shadow-xs focus:border-primary focus:outline-hidden"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-text-secondary">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="mt-1 block rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text shadow-xs focus:border-primary focus:outline-hidden"
              required
            />
          </div>
          <Button type="submit" size="sm" variant="primary" disabled={loading}>
            Apply Range
          </Button>
        </form>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-xs text-danger flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-surface-muted/50 p-4" />
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Gross Order Value */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Gross Order Value</span>
              <span className="text-[10px] text-text-muted">Placed non-cancelled</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-text">
              {formatCurrency(kpis.grossOrderValue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <span>Discounts: {formatCurrency(kpis.totalDiscountAmount)}</span>
            </div>
          </div>

          {/* Card 2: Net Collected Revenue */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Net Collected Revenue</span>
              <Badge variant="success">Paid</Badge>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-success">
              {formatCurrency(kpis.netCollectedRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <span>Refunds: {formatCurrency(kpis.totalRefunds)}</span>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Total Orders</span>
              <span className="text-[10px] text-text-muted">{kpis.cancelledOrderCount} cancelled</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-text">
              {kpis.orderCount.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <span>Active/Completed: {kpis.nonCancelledOrderCount}</span>
            </div>
          </div>

          {/* Card 4: Average Order Value */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Average Order Value</span>
              <span className="text-[10px] text-text-muted">per order</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-text">
              {formatCurrency(kpis.averageOrderValue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <span>From active orders</span>
            </div>
          </div>

          {/* Card 5: New Customers */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">New Customers</span>
              <Badge variant="info">Registered</Badge>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-text">
              {kpis.newCustomers.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-text-secondary">In selected period</div>
          </div>

          {/* Card 6: Pending Payments */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Pending Payments</span>
              {kpis.pendingPaymentsCount > 0 ? (
                <Badge variant="warning">Action Needed</Badge>
              ) : (
                <Badge variant="muted">Clear</Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-warning">
              {kpis.pendingPaymentsCount.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-text-secondary">Orders awaiting capture/payment</div>
          </div>

          {/* Card 7: Awaiting Fulfillment */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Awaiting Fulfillment</span>
              {kpis.awaitingFulfillmentCount > 0 ? (
                <Badge variant="info">Ready to Ship</Badge>
              ) : (
                <Badge variant="muted">None</Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-text">
              {kpis.awaitingFulfillmentCount.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-text-secondary">Confirmed orders not yet shipped</div>
          </div>

          {/* Card 8: Low Stock Variants */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Inventory Alerts</span>
              {kpis.lowStockVariantsCount > 0 || kpis.outOfStockVariantsCount > 0 ? (
                <Badge variant="danger">Restock</Badge>
              ) : (
                <Badge variant="success">Healthy</Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-danger">
              {kpis.lowStockVariantsCount + kpis.outOfStockVariantsCount}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
              <span>Low: {kpis.lowStockVariantsCount}</span>
              <span>Out: {kpis.outOfStockVariantsCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Time-Series Chart */}
      {data && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Sales & Order Trend</h2>
              <p className="text-xs text-text-secondary">
                Daily breakdown between {data.dateRange.startDate.slice(0, 10)} and{' '}
                {data.dateRange.endDate.slice(0, 10)}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface-muted/60 p-1">
              <button
                type="button"
                onClick={() => setActiveChartMetric('revenue')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeChartMetric === 'revenue'
                    ? 'bg-surface text-text shadow-xs'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Revenue (INR)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('orders')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeChartMetric === 'orders'
                    ? 'bg-surface text-text shadow-xs'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Order Volume
              </button>
            </div>
          </div>

          {data.timeSeries.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-xs text-text-muted">
              No activity recorded for this period
            </div>
          ) : (
            <div className="mt-4">
              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px]">
                  {(() => {
                    const values = data.timeSeries.map((p) =>
                      activeChartMetric === 'revenue' ? p.revenue : p.orderCount
                    );
                    const maxValue = Math.max(...values, 1);
                    const chartHeight = 180;
                    const chartWidth = 700;
                    const paddingX = 40;
                    const paddingY = 24;
                    const usableWidth = chartWidth - paddingX * 2;
                    const usableHeight = chartHeight - paddingY * 2;

                    const points = data.timeSeries.map((point, index) => {
                      const val = activeChartMetric === 'revenue' ? point.revenue : point.orderCount;
                      const x =
                        paddingX +
                        (data.timeSeries.length > 1
                          ? (index / (data.timeSeries.length - 1)) * usableWidth
                          : usableWidth / 2);
                      const y = chartHeight - paddingY - (val / maxValue) * usableHeight;
                      return { x, y, val, date: point.date };
                    });

                    const pathData = points
                      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
                      .join(' ');

                    const areaData = points.length > 0
                      ? `${pathData} L ${points[points.length - 1]!.x.toFixed(1)} ${(chartHeight - paddingY).toFixed(1)} L ${points[0]!.x.toFixed(1)} ${(chartHeight - paddingY).toFixed(1)} Z`
                      : '';

                    return (
                      <div className="relative">
                        <svg
                          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                          className="w-full h-48 select-none"
                        >
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#164a35" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#164a35" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid horizontal guidelines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                            const y = chartHeight - paddingY - pct * usableHeight;
                            const labelVal = maxValue * pct;
                            return (
                              <g key={idx}>
                                <line
                                  x1={paddingX}
                                  y1={y}
                                  x2={chartWidth - paddingX}
                                  y2={y}
                                  stroke="#eef1ef"
                                  strokeDasharray={pct === 0 ? undefined : '3 3'}
                                  strokeWidth="1"
                                />
                                <text
                                  x={paddingX - 6}
                                  y={y + 3}
                                  textAnchor="end"
                                  className="fill-text-muted text-[10px]"
                                >
                                  {activeChartMetric === 'revenue'
                                    ? labelVal >= 1000
                                      ? `₹${(labelVal / 1000).toFixed(0)}k`
                                      : `₹${labelVal.toFixed(0)}`
                                    : labelVal.toFixed(0)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area & Line */}
                          {points.length > 1 && (
                            <>
                              <path d={areaData} fill="url(#chartGradient)" />
                              <path
                                d={pathData}
                                fill="none"
                                stroke="#164a35"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </>
                          )}

                          {/* Data points */}
                          {points.map((pt, i) => (
                            <g key={i} className="group">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={points.length > 25 ? 2.5 : 4}
                                fill="#ffffff"
                                stroke="#164a35"
                                strokeWidth="2"
                                className="transition-transform group-hover:scale-125"
                              />
                              {/* Simple point tooltip */}
                              <title>{`${pt.date}: ${
                                activeChartMetric === 'revenue' ? formatCurrency(pt.val) : `${pt.val} orders`
                              }`}</title>
                            </g>
                          ))}
                        </svg>

                        {/* Date axis labels */}
                        <div className="flex justify-between px-10 pt-2 text-[10px] text-text-muted">
                          {points.length > 0 && (
                            <>
                              <span>{points[0]!.date}</span>
                              {points.length > 2 && (
                                <span>{points[Math.floor(points.length / 2)]!.date}</span>
                              )}
                              <span>{points[points.length - 1]!.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Breakdowns Row: Order Status & Payment Breakdown */}
      {data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Status Breakdown */}
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-text">Order Status Distribution</h2>
            <p className="text-xs text-text-secondary mt-0.5">Categorization of all orders in period</p>

            <div className="mt-4 space-y-3">
              {Object.entries(data.orderStatusBreakdown.counts).map(([status, count]) => {
                const percentage = data.orderStatusBreakdown.percentages[status] ?? 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text">{status.replace('_', ' ')}</span>
                      <span className="text-text-secondary">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Status Breakdown */}
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-text">Payment Breakdown</h2>
            <p className="text-xs text-text-secondary mt-0.5">Razorpay vs Cash on Delivery</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-md border border-border bg-surface-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">Razorpay</span>
                  <Badge variant="info">{data.paymentBreakdown.byMethod.razorpay.count} orders</Badge>
                </div>
                <div className="mt-2 text-lg font-bold text-text">
                  {formatCurrency(data.paymentBreakdown.byMethod.razorpay.collectedAmount)}
                </div>
                <div className="mt-0.5 text-[11px] text-text-secondary">
                  Total booked: {formatCurrency(data.paymentBreakdown.byMethod.razorpay.totalAmount)}
                </div>
              </div>

              <div className="rounded-md border border-border bg-surface-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">COD</span>
                  <Badge variant="muted">{data.paymentBreakdown.byMethod.cod.count} orders</Badge>
                </div>
                <div className="mt-2 text-lg font-bold text-text">
                  {formatCurrency(data.paymentBreakdown.byMethod.cod.collectedAmount)}
                </div>
                <div className="mt-0.5 text-[11px] text-text-secondary">
                  Total placed: {formatCurrency(data.paymentBreakdown.byMethod.cod.totalAmount)}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <span className="text-xs font-medium text-text-secondary">Payment Records by Status</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(data.paymentBreakdown.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 text-xs"
                  >
                    <span className="font-medium text-text">{status}:</span>
                    <span className="text-text-secondary font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Products & Top Categories */}
      {data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Selling Products */}
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-text">Top Selling Products</h2>
            <p className="text-xs text-text-secondary mt-0.5">By quantity sold and revenue</p>

            <div className="mt-4 divide-y divide-border overflow-hidden">
              {data.topProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted">No products sold in this period</div>
              ) : (
                data.topProducts.map((p, idx) => (
                  <div key={p.productId} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-muted w-4">{idx + 1}</span>
                      <div>
                        <div className="font-medium text-text">{p.productName}</div>
                        <div className="font-mono text-[11px] text-text-muted">SKU: {p.sku}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-text">{formatCurrency(p.revenue)}</div>
                      <div className="text-[11px] text-text-secondary">{p.unitsSold} units</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Categories & Coupons */}
          <div className="space-y-6">
            {/* Top Categories */}
            <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Top Categories</h2>
              <div className="mt-4 divide-y divide-border overflow-hidden">
                {data.topCategories.length === 0 ? (
                  <div className="py-4 text-center text-xs text-text-muted">No category sales in this period</div>
                ) : (
                  data.topCategories.map((cat, idx) => (
                    <div key={cat.categoryId} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-text-muted w-4">{idx + 1}</span>
                        <span className="font-medium text-text">{cat.categoryName}</span>
                      </div>
                      <span className="font-semibold text-text">{formatCurrency(cat.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Coupons Performance */}
            <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-text">Coupon Utilization</h2>
                  <p className="text-xs text-text-secondary">
                    {data.coupons.usageCount} redemptions totaling {formatCurrency(data.coupons.totalDiscounts)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {data.coupons.topCoupons.length === 0 ? (
                  <span className="text-xs text-text-muted py-1">No coupons redeemed in this period</span>
                ) : (
                  data.coupons.topCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="rounded border border-border bg-surface-muted/40 px-2.5 py-1 text-xs"
                    >
                      <span className="font-mono font-bold text-primary">{coupon.code}</span>
                      <span className="ml-1.5 text-text-secondary">
                        ({coupon.usages}x - {formatCurrency(coupon.discountAmount)})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Health Table */}
      {data && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Low-Stock & Out-of-Stock Variants</h2>
              <p className="text-xs text-text-secondary">Variants requiring inventory replenishment</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-text-secondary">
                Low: <strong className="text-warning">{data.inventory.lowStockCount}</strong>
              </span>
              <span className="text-text-secondary">
                Out: <strong className="text-danger">{data.inventory.outOfStockCount}</strong>
              </span>
            </div>
          </div>

          {data.inventory.lowStockItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-success">
              All inventory levels are above the safety threshold (stock &gt; 5).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-medium">SKU</th>
                    <th className="py-2 font-medium">Product</th>
                    <th className="py-2 font-medium">Available</th>
                    <th className="py-2 font-medium">Reserved</th>
                    <th className="py-2 font-medium">Total Physical</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.inventory.lowStockItems.map((item) => (
                    <tr key={item.variantId}>
                      <td className="py-2 font-mono font-medium text-text">{item.sku}</td>
                      <td className="py-2 text-text">{item.productName}</td>
                      <td className="py-2 font-semibold text-text">{item.availableStock}</td>
                      <td className="py-2 text-text-muted">{item.reservedQuantity}</td>
                      <td className="py-2 text-text-secondary">{item.quantity}</td>
                      <td className="py-2">
                        {item.availableStock <= 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : (
                          <Badge variant="warning">Low Stock</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders Table */}
      {data && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Recent Orders</h2>
              <p className="text-xs text-text-secondary">Latest purchases across the platform</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all orders &rarr;
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-medium">Order #</th>
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Payment</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-2.5 font-mono font-medium text-text">
                        <Link href={`/orders/${order.id}`} className="hover:text-primary hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5">
                        <div className="font-medium text-text">{order.customerName}</div>
                        <div className="text-[11px] text-text-muted">{order.customerMobile}</div>
                      </td>
                      <td className="py-2.5 text-text-secondary">{formatDateTime(order.createdAt)}</td>
                      <td className="py-2.5 font-semibold text-text">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-medium">{order.paymentMethod ?? '—'}</span>
                          {order.paymentStatus === 'PAID' ? (
                            <Badge variant="success">PAID</Badge>
                          ) : order.paymentStatus === 'FAILED' ? (
                            <Badge variant="danger">FAILED</Badge>
                          ) : (
                            <Badge variant="warning">{order.paymentStatus ?? 'PENDING'}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
