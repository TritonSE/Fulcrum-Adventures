import type { AuthSession, User } from "../types/user";

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

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      user?: User;
    };
    if (!res.ok || !data.token || !data.user) {
      return {
        ok: false,
        message: data.error ?? "Incorrect email or password.",
      };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return {
      ok: false,
      message: "Incorrect email or password.",
    };
  }
}

export async function registerAdmin(input: RegisterInput): Promise<RegisterResult> {
  try {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        password: input.password,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      user?: User;
    };
    if (!res.ok || !data.token || !data.user) {
      const message = data.error ?? "Unable to create account.";
      const field =
        res.status === 400 && message.toLowerCase().includes("password")
          ? "password"
          : undefined;
      return { ok: false, message, field };
    }
    return { ok: true, token: data.token, user: data.user };
  } catch {
    return { ok: false, message: "Unable to create account." };
  }
}

export function setAdminSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      exp?: number;
    };
    if (typeof payload.exp !== "number") return true;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAdminSession();
    return false;
  }
  return true;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    clearAdminSession();
    return null;
  }

  try {
    const res = await fetch(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAdminSession();
      return null;
    }
    const data = (await res.json()) as { user?: User };
    if (!data.user) {
      clearAdminSession();
      return null;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch {
    return getStoredUser();
  }
}

export type { AuthSession };
