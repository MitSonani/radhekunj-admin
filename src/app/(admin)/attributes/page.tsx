import type { Metadata } from 'next';
import { AttributesView } from '@/components/attributes/AttributesView';

export const metadata: Metadata = {
  title: 'Attributes',
};

export default function AttributesPage() {
  return <AttributesView />;
}
