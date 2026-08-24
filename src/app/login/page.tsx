import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { APP_ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-md bg-primary-soft px-3 py-2 text-sm text-primary">
        Sign-in is not implemented yet. Do not invent credentials or call unconfirmed auth endpoints from this panel.
      </p>
      <Link href={APP_ROUTES.DASHBOARD}>
        <Button className="w-full" size="lg">
          Continue to dashboard
        </Button>
      </Link>
    </div>
  );
}
