import type { Metadata } from 'next';
import { BannersView } from '@/components/banners/BannersView';

export const metadata: Metadata = {
  title: 'Homepage Hero Banners',
};

export default function BannersPage() {
  return <BannersView />;
}
