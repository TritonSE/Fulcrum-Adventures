import type { UserRole } from "../constants/userRoles";

declare global {
  namespace Express {
    // eslint-disable-next-line ts/consistent-type-definitions -- Express augmentation requires interface
    interface AuthUser {
      userId: string;
      email: string;
      role: UserRole;
    }

    // eslint-disable-next-line ts/consistent-type-definitions -- Express augmentation requires interface
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};
