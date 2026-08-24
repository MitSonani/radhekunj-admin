export type UserRole = {
  id: string;
  name: string;
};

export type SessionUser = {
  id: string;
  name: string;
  role: UserRole | null;
};

export type AuthSession = {
  token: string | null;
  user: SessionUser | null;
};
