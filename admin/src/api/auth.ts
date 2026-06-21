import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { apiUrl } from "./baseUrl";

import type { User } from "../types/user";

const TOKEN_KEY = "fulcrum_admin_token";
const USER_KEY = "fulcrum_admin_user";

const AUTH_BASE = "/api/auth";

export type LoginResult = { ok: true; token: string; user: User } | { ok: false; message: string };

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterResult =
  | { ok: true; token: string; user: User }
  | { ok: false; message: string; field?: "password" };

export type ForgotPasswordResult = { ok: true } | { ok: false; message: string };

export type ResetPasswordResult = { ok: true } | { ok: false; message: string };

let authReady = false;
let authReadyPromise: Promise<void> | null = null;

function firebaseAuthErrorMessage(code: string, fallback: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be more than 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled. In Firebase Console, open Authentication → Sign-in method and enable Email/Password.";
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
      return "Firebase is misconfigured for this app. Check your API key, authorized domains, and restart the admin dev server.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "Invalid or expired reset link.";
    default:
      return fallback;
  }
}

function getFirebaseError(err: unknown, fallback: string): { code: string; message: string } {
  if (err instanceof FirebaseError) {
    if (import.meta.env.DEV) {
      console.error("[auth]", err.code, err.message);
    }
    return {
      code: err.code,
      message: firebaseAuthErrorMessage(err.code, err.message || fallback),
    };
  }

  if (err instanceof Error) {
    return { code: "", message: err.message || fallback };
  }

  const code = (err as { code?: string }).code ?? "";
  return { code, message: firebaseAuthErrorMessage(code, fallback) };
}

async function buildSessionFromUser(fbUser: FirebaseUser): Promise<{ token: string; user: User }> {
  const token = await fbUser.getIdToken();
  const res = await fetch(apiUrl(`${AUTH_BASE}/me`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; user?: User };

  if (!res.ok || !data.user) {
    throw new Error(data.error ?? "This account is not authorized for admin access.");
  }

  const user = data.user;
  setAdminSession(token, user);
  return { token, user };
}

export function waitForAuth(): Promise<void> {
  if (authReady) {
    return Promise.resolve();
  }
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, () => {
        authReady = true;
        resolve();
      });
    });
  }
  return authReadyPromise;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const session = await buildSessionFromUser(credential.user);
    return { ok: true, ...session };
  } catch (err) {
    const { message } = getFirebaseError(err, "Incorrect email or password.");
    return { ok: false, message };
  }
}

export async function registerAdmin(input: RegisterInput): Promise<RegisterResult> {
  let firebaseUser: FirebaseUser | null = null;

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password,
    );
    firebaseUser = credential.user;

    const displayName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    const token = await firebaseUser.getIdToken();
    const syncRes = await fetch(apiUrl(`${AUTH_BASE}/register`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
      }),
    });

    const syncData = (await syncRes.json().catch(() => ({}))) as {
      error?: string;
      user?: User;
    };

    if (!syncRes.ok || !syncData.user) {
      try {
        await deleteUser(firebaseUser);
      } catch {
        // ignore cleanup failure
      }
      const message = syncData.error ?? "Unable to create account.";
      return { ok: false, message };
    }

    setAdminSession(token, syncData.user);
    return { ok: true, token, user: syncData.user };
  } catch (err) {
    if (firebaseUser) {
      try {
        await deleteUser(firebaseUser);
      } catch {
        // ignore cleanup failure
      }
    }
    const { code, message } = getFirebaseError(err, "Unable to create account.");
    const field = code === "auth/weak-password" ? "password" : undefined;
    return { ok: false, message, field };
  }
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResult = { ok: true } | { ok: false; message: string };

export async function changePasswordAdmin(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, message: "New password and confirmation do not match." };
  }

  if (input.newPassword.length <= 6) {
    return { ok: false, message: "Password must be more than 6 characters." };
  }

  const user = auth.currentUser;
  if (!user?.email) {
    return { ok: false, message: "You must be signed in to change your password." };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, input.currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, input.newPassword);
    return { ok: true };
  } catch (err) {
    const { message } = getFirebaseError(err, "Unable to change password.");
    return { ok: false, message };
  }
}

const INVALID_EMAIL_MESSAGE = "Invalid email";

function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.trim());
}

function resetPasswordContinueUrl(): string {
  return `${window.location.origin}/reset-password?resetComplete=true`;
}

export async function forgotPasswordAdmin(email: string): Promise<ForgotPasswordResult> {
  const trimmed = email.trim();

  if (!isValidEmailAddress(trimmed)) {
    return { ok: false, message: INVALID_EMAIL_MESSAGE };
  }

  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, trimmed);
    if (signInMethods.length === 0) {
      return { ok: false, message: INVALID_EMAIL_MESSAGE };
    }

    await sendPasswordResetEmail(auth, trimmed, {
      url: resetPasswordContinueUrl(),
      handleCodeInApp: true,
    });
    return { ok: true };
  } catch (err) {
    const { code } = getFirebaseError(err, INVALID_EMAIL_MESSAGE);
    if (
      code === "auth/invalid-email" ||
      code === "auth/user-not-found" ||
      code === "auth/invalid-credential"
    ) {
      return { ok: false, message: INVALID_EMAIL_MESSAGE };
    }
    return { ok: false, message: INVALID_EMAIL_MESSAGE };
  }
}

export function isPasswordResetCompleteFromUrl(searchParams: URLSearchParams): boolean {
  return (
    searchParams.get("resetComplete") === "true" ||
    searchParams.get("reset") === "success"
  );
}

export async function verifyPasswordResetOobCode(
  oobCode: string,
): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { ok: true, email };
  } catch (err) {
    const { message } = getFirebaseError(err, "Invalid or expired reset link.");
    return { ok: false, message };
  }
}

export async function resetPasswordAdmin(
  oobCode: string,
  password: string,
): Promise<ResetPasswordResult> {
  try {
    await confirmPasswordReset(auth, oobCode, password);
    return { ok: true };
  } catch (err) {
    const { message } = getFirebaseError(err, "Unable to reset password.");
    return { ok: false, message };
  }
}

export function setAdminSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function clearAdminSession(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (auth.currentUser) {
    await signOut(auth);
  }
}

export function isAdminAuthenticated(): boolean {
  return auth.currentUser !== null;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const fbUser = auth.currentUser;
  if (!fbUser) {
    await clearAdminSession();
    return null;
  }

  const token = await fbUser.getIdToken();
  try {
    const res = await fetch(apiUrl(`${AUTH_BASE}/me`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      await clearAdminSession();
      return null;
    }
    const data = (await res.json()) as { user?: User };
    if (!data.user) {
      await clearAdminSession();
      return null;
    }
    setAdminSession(token, data.user);
    return data.user;
  } catch {
    await clearAdminSession();
    return null;
  }
}

export type { AuthSession } from "../types/user";
