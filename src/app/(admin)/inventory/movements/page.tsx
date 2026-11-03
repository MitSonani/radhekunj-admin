import { Suspense } from 'react';
import type { Metadata } from 'next';
import { InventoryMovementsView } from '@/components/inventory';
import { PageLoader } from '@/components/common/PageLoader';

export const metadata: Metadata = {
  title: 'Stock Movements',
};

export default function InventoryMovementsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InventoryMovementsView />
    </Suspense>
  );
}
