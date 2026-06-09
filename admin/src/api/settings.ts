import type { User } from "../types/user";

import { apiFetch } from "./client";
import { changePasswordAdmin, getAuthToken, setAdminSession } from "./auth";

const AUTH_BASE = "/api/auth";

export type SettingsResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? fallback;
}

export async function updateProfile(input: {
  fullName: string;
}): Promise<SettingsResult<{ user: User; message: string }>> {
  try {
    const res = await apiFetch(`${AUTH_BASE}/me`, {
      method: "PATCH",
      body: JSON.stringify({
        fullName: input.fullName.trim(),
      }),
    });
    if (!res.ok) {
      return { ok: false, message: await parseError(res, "Unable to save profile.") };
    }
    const data = (await res.json()) as { user: User; message?: string };
    const token = await getAuthToken();
    if (token && data.user) {
      setAdminSession(token, data.user);
    }
    return {
      ok: true,
      data: { user: data.user, message: data.message ?? "Changes successfully saved!" },
    };
  } catch {
    return { ok: false, message: "Unable to save profile." };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<SettingsResult<{ message: string }>> {
  const result = await changePasswordAdmin(input);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return {
    ok: true,
    data: { message: "Password changed successfully." },
  };
}

export async function fetchAllowedAdminEmails(): Promise<SettingsResult<{ emails: string[] }>> {
  try {
    const res = await apiFetch(`${AUTH_BASE}/allowed-admins`);
    if (!res.ok) {
      return { ok: false, message: await parseError(res, "Unable to load admin list.") };
    }
    const data = (await res.json()) as { emails: string[] };
    return { ok: true, data: { emails: data.emails ?? [] } };
  } catch {
    return { ok: false, message: "Unable to load admin list." };
  }
}

export async function updateAllowedAdminEmails(
  emails: string[],
): Promise<SettingsResult<{ emails: string[]; message: string }>> {
  try {
    const res = await apiFetch(`${AUTH_BASE}/allowed-admins`, {
      method: "PUT",
      body: JSON.stringify({ emails }),
    });
    if (!res.ok) {
      return { ok: false, message: await parseError(res, "Unable to save admin list.") };
    }
    const data = (await res.json()) as { emails: string[]; message?: string };
    return {
      ok: true,
      data: {
        emails: data.emails ?? emails,
        message: data.message ?? "Changes successfully saved!",
      },
    };
  } catch {
    return { ok: false, message: "Unable to save admin list." };
  }
}
