import { GuestGuard } from '@/components/layout/GuestGuard';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
