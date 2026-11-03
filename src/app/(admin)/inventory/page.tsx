import type { Metadata } from 'next';
import { InventoryView } from '@/components/inventory';

export const metadata: Metadata = {
  title: 'Inventory',
};

export default function InventoryPage() {
  return <InventoryView />;
}
