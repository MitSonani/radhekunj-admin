'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export interface TableAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
  label?: string;
}

export function TableActions({ actions, label = 'Row actions' }: TableActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </Button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-36 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-md"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              className={cn(
                'block w-full px-3 py-1.5 text-left text-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50',
                action.variant === 'danger' ? 'text-danger' : 'text-text'
              )}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
