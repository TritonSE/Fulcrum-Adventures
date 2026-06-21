import type { UserDocument } from "../models/user";

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserDocument["role"];
};

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
