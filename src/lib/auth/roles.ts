import { ADMIN_ROLE } from '@/constants';

export function isAdminRole(roleName: string | null | undefined): boolean {
  return roleName?.trim().toLowerCase() === ADMIN_ROLE;
}
