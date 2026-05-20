import jwt from "jsonwebtoken";

import type { UserRole } from "../constants/userRoles";
import type { SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}

export function signAccessToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== "object" || decoded === null) {
    throw new TypeError("Invalid token payload.");
  }
  const { userId, email, role } = decoded as Record<string, unknown>;
  if (typeof userId !== "string" || typeof email !== "string" || typeof role !== "string") {
    throw new TypeError("Invalid token payload.");
  }
  return { userId, email, role: role as UserRole };
}
