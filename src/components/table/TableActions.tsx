'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

const MENU_GAP = 4;
const VIEWPORT_PADDING = 8;

export function TableActions({ actions, label = 'Row actions' }: TableActionsProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 144;
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const openUpward = menuHeight > 0 && menuHeight > spaceBelow && rect.top > spaceBelow;
    const top = openUpward ? rect.top - MENU_GAP - menuHeight : rect.bottom + MENU_GAP;
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, rect.right - menuWidth),
      window.innerWidth - menuWidth - VIEWPORT_PADDING
    );

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  return (
    <div ref={triggerRef} className="inline-flex justify-end">
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
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-md"
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
          </div>,
          document.body
        )}
    </div>
  );
}
