import type { ReactNode, SVGProps } from 'react';
import type { NavIconName } from '@/config/navigation';
import { cn } from '@/lib/utils';

type IconProps = SVGProps<SVGSVGElement>;

function iconClass(className?: string) {
  return cn('h-[1.125rem] w-[1.125rem] shrink-0', className);
}

export function DashboardIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h3A2.25 2.25 0 0 1 11.25 6v3A2.25 2.25 0 0 1 9 11.25H6A2.25 2.25 0 0 1 3.75 9V6Zm9 0A2.25 2.25 0 0 1 15 3.75h3A2.25 2.25 0 0 1 20.25 6v3A2.25 2.25 0 0 1 18 11.25h-3A2.25 2.25 0 0 1 12.75 9V6ZM3.75 15A2.25 2.25 0 0 1 6 12.75h3A2.25 2.25 0 0 1 11.25 15v3A2.25 2.25 0 0 1 9 20.25H6A2.25 2.25 0 0 1 3.75 18v-3Zm9 0A2.25 2.25 0 0 1 15 12.75h3A2.25 2.25 0 0 1 20.25 15v3A2.25 2.25 0 0 1 18 20.25h-3A2.25 2.25 0 0 1 12.75 18v-3Z" />
    </svg>
  );
}

export function ProductsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5m18 0-9 4.5m9-4.5v9l-9 4.5m0-13.5L3 7.5m9 4.5v9m0-9L3 7.5m0 9 9 4.5" />
    </svg>
  );
}

export function CategoriesIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export function AttributesIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

export function InventoryIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5H3.75m16.5 0v10.125c0 1.243-1.007 2.25-2.25 2.25H6c-1.243 0-2.25-1.007-2.25-2.25V7.5m16.5 0-1.8-3.15A1.5 1.5 0 0 0 17.16 3.75H6.84a1.5 1.5 0 0 0-1.29.6L3.75 7.5" />
    </svg>
  );
}

export function OrdersIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M8.25 4.5h7.5A2.25 2.25 0 0 1 18 6.75v12.75A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5V6.75A2.25 2.25 0 0 1 8.25 4.5Z" />
    </svg>
  );
}

export function CustomersIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function CouponsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75h.008v.008H16.5V6.75Zm-9 10.5h.008v.008H7.5v-.008ZM3.75 9.75A2.25 2.25 0 0 0 6 12a2.25 2.25 0 0 1 0 4.5H5.25A2.25 2.25 0 0 1 3 14.25v-7.5A2.25 2.25 0 0 1 5.25 4.5H18a2.25 2.25 0 0 1 2.25 2.25v2.25A2.25 2.25 0 0 1 18 11.25 2.25 2.25 0 0 0 18 15.75h.75A2.25 2.25 0 0 1 21 18v1.5A2.25 2.25 0 0 1 18.75 21.75H6A2.25 2.25 0 0 1 3.75 19.5v-9.75Z" />
    </svg>
  );
}

export function SettingsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export function BellIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

export function LogoutIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass(className)} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18.75 15 21.75 12m0 0L18.75 9M21.75 12h-9" />
    </svg>
  );
}

const NAV_ICONS: Record<NavIconName, (props: IconProps) => ReactNode> = {
  dashboard: DashboardIcon,
  products: ProductsIcon,
  categories: CategoriesIcon,
  attributes: AttributesIcon,
  inventory: InventoryIcon,
  orders: OrdersIcon,
  customers: CustomersIcon,
  coupons: CouponsIcon,
  settings: SettingsIcon,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = NAV_ICONS[name];
  return <Icon className={className} />;
}
