import type { Metadata } from 'next';
import { AttributeDetailView } from '@/components/attributes/AttributeDetailView';

export const metadata: Metadata = {
  title: 'Attribute',
};

export default async function AttributeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AttributeDetailView key={id} attributeId={id} />;
}
