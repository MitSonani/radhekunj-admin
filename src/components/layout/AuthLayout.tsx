import type { ReactNode } from 'react';
import Image from 'next/image';

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
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-md border border-border bg-white p-1.5 shadow-2xs">
            <Image
              src="/brand/cotton-clique-logo.jpg"
              alt="Logo"
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-text">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-text-secondary">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
