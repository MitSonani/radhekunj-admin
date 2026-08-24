import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { APP_ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-xl font-semibold text-text">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        The page you are looking for does not exist or is not available yet.
      </p>
      <Link href={APP_ROUTES.DASHBOARD} className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
