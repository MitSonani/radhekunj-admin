'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { BellIcon, LogoutIcon, MenuIcon } from '@/components/common/icons';
import { Button } from '@/components/common/Button';
import { getNavItemByHref } from '@/config/navigation';
import { APP_ROUTES } from '@/constants';
import { useSession } from '@/hooks/useSession';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();
  const currentItem = getNavItemByHref(pathname);
  const displayName = user?.name || 'Admin';

  const handleLogout = () => {
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 flex h-header items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{currentItem?.label || 'Admin'}</p>
          <p className="hidden truncate text-xs text-text-muted sm:block">Administrative console</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text"
          aria-label="Notifications"
          disabled
          title="Notifications will be available later"
        >
          <BellIcon />
        </button>
        <div className="hidden items-center gap-2 rounded-md px-2 py-1 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-32 truncate text-sm text-text">{displayName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
          <LogoutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
