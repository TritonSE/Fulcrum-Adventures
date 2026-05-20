const EMAIL_RE = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return null;
  return email;
}

export function parseName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 100) return null;
  return value;
}

export function parsePassword(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length < MIN_PASSWORD_LENGTH) return null;
  return raw;
}

export function parseResetToken(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const token = raw.trim();
  if (!token) return null;
  return token;
}
