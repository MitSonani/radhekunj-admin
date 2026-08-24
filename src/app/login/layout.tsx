import { AuthLayout } from '@/components/layout/AuthLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout
      title="Sign in"
      description="Admin authentication will be connected to the Backend contract. Session handling is prepared for Bearer JWT tokens."
    >
      {children}
    </AuthLayout>
  );
}
