import { getAuthToken } from "./auth";
import { apiUrl } from "./baseUrl";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", JSON_HEADERS["Content-Type"]);
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(apiUrl(path), { ...init, headers });
}

export { apiUrl };
