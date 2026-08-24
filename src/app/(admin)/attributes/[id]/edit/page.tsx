import type { Metadata } from 'next';
import { AttributeEditView } from '@/components/attributes/AttributeEditView';

export const metadata: Metadata = {
  title: 'Edit Attribute',
};

export default async function EditAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AttributeEditView key={id} attributeId={id} />;
}
