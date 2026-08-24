export type SessionUser = {
  id: string;
  name: string;
};

export type AuthSession = {
  token: string | null;
  user: SessionUser | null;
};
