export type NavIconName =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'settings';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: NavIconName;
  enabled: boolean;
}

/**
 * Sidebar navigation foundation.
 * Disabled items are shown for structure only — module pages are not implemented yet.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    enabled: true,
  },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    icon: 'products',
    enabled: false,
  },
  {
    id: 'categories',
    label: 'Categories',
    href: '/categories',
    icon: 'categories',
    enabled: false,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '/inventory',
    icon: 'inventory',
    enabled: false,
  },
  {
    id: 'orders',
    label: 'Orders',
    href: '/orders',
    icon: 'orders',
    enabled: false,
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: 'customers',
    enabled: false,
  },
  {
    id: 'coupons',
    label: 'Coupons',
    href: '/coupons',
    icon: 'coupons',
    enabled: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'settings',
    enabled: false,
  },
];

export function getNavItemByHref(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
