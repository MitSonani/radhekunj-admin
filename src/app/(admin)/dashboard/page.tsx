import type { Metadata } from 'next';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const upcomingModules = [
  { id: 'products', title: 'Products', description: 'Catalog, variants, and pricing commands' },
  { id: 'orders', title: 'Orders', description: 'Fulfillment status and order operations' },
  { id: 'customers', title: 'Customers', description: 'Customer accounts and access' },
  { id: 'inventory', title: 'Inventory', description: 'Stock levels and availability' },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Foundation for the AURA Admin Panel. Business modules will be added against Backend API contracts."
        breadcrumbs={[{ label: 'Admin', href: '/dashboard' }, { label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {upcomingModules.map((module) => (
          <div key={module.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-text">{module.title}</h2>
              <Badge variant="muted">Soon</Badge>
            </div>
            <p className="mt-1.5 text-sm text-text-secondary">{module.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface">
        <EmptyState
          title="No operational data yet"
          description="Connect Backend APIs to populate dashboard metrics, tables, and alerts. This panel will not invent business data."
        />
      </div>
    </div>
  );
}
