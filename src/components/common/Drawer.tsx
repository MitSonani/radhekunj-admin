'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CloseIcon } from './icons';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ open, onClose, title, children, footer, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-text/40" aria-label="Close drawer" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        className={cn(
          'absolute top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-lg',
          side === 'right' ? 'right-0 border-l border-border' : 'left-0 border-r border-border'
        )}
      >
        <div className="flex h-14 items-center justify-between gap-4 border-b border-border px-5">
          <h2 id="admin-drawer-title" className="text-base font-semibold text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-text">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </aside>
    </div>
  );
}
