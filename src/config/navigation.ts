export type NavIconName =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'attributes'
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

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

/**
 * Sidebar navigation foundation.
 * Disabled items are shown for structure only — module pages are not implemented yet.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'dashboard',
        enabled: true,
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      {
        id: 'categories',
        label: 'Categories',
        href: '/categories',
        icon: 'categories',
        enabled: true,
      },
      {
        id: 'attributes',
        label: 'Attributes',
        href: '/attributes',
        icon: 'attributes',
        enabled: true,
      },
      {
        id: 'products',
        label: 'Products',
        href: '/products',
        icon: 'products',
        enabled: true,
      },
    ],
  },
  {
    id: 'commerce',
    items: [
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
    ],
  },
  {
    id: 'system',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: 'settings',
        enabled: false,
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export function getNavItemByHref(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
