'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_SECTIONS } from '@/config/navigation';
import { config } from '@/config';
import { CloseIcon, NavIcon } from '@/components/common/icons';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-text/40 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-sidebar-border bg-sidebar text-sidebar-text transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-header items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-active text-sm font-semibold">
              A
            </span>
            <span className="text-sm font-semibold tracking-wide">{config.appName}</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-3">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                {section.label && (
                  <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted/70">
                    {section.label}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const className = cn(
                      'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                      item.enabled
                        ? isActive
                          ? 'bg-sidebar-active text-sidebar-text'
                          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                        : 'cursor-not-allowed text-sidebar-muted/50'
                    );

                    return (
                      <li key={item.id}>
                        {item.enabled ? (
                          <Link
                            href={item.href}
                            className={className}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={onClose}
                          >
                            <NavIcon name={item.icon} />
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <span className={className} aria-disabled="true" title="Coming soon">
                            <NavIcon name={item.icon} />
                            <span className="flex-1">{item.label}</span>
                            <span className="text-[10px] uppercase tracking-wide text-sidebar-muted/70">Soon</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
