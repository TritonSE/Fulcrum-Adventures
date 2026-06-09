import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import type { UserRole } from "../constants/userRoles";

export type VerifiedFirebaseUser = {
  userId: string;
  email: string;
  role: UserRole;
};

function getProjectId(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured.");
  }
  return projectId;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function initFirebaseAdmin(): void {
  if (getApps().length > 0) {
    return;
  }

  initializeApp({
    credential: cert({
      projectId: getProjectId(),
      clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

export async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  initFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  const role = (decoded.role as UserRole | undefined) ?? "admin";

  return {
    userId: decoded.uid,
    email: decoded.email ?? "",
    role,
  };
}
