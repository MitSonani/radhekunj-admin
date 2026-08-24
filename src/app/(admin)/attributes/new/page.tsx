import type { Metadata } from 'next';
import { AttributeCreateView } from '@/components/attributes/AttributeCreateView';

export const metadata: Metadata = {
  title: 'Add Attribute',
};

export default function NewAttributePage() {
  return <AttributeCreateView />;
}
