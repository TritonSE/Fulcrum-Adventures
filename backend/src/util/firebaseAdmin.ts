import admin from "firebase-admin";

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

function initFirebaseAdmin(): void {
  if (admin.apps.length > 0) {
    return;
  }

  admin.initializeApp({
    projectId: getProjectId(),
  });
}

export async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  initFirebaseAdmin();
  const decoded = await admin.auth().verifyIdToken(token);
  const role = (decoded.role as UserRole | undefined) ?? "admin";

  return {
    userId: decoded.uid,
    email: decoded.email ?? "",
    role,
  };
}
