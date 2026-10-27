import type { ReactNode } from 'react';
import Image from 'next/image';
import { config } from '@/config';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 h-14 w-14 overflow-hidden rounded-md border border-border bg-white p-1 shadow-2xs">
            <Image
              src="/brand/cotton-clique-logo.jpg"
              alt="Cotton Clique"
              width={56}
              height={56}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{config.appName}</p>
          <h1 className="mt-2 text-xl font-semibold text-text">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-text-secondary">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
