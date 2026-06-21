export type UserRole = "super_admin" | "admin";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: User;
};
