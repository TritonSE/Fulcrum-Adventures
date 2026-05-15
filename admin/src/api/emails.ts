import axios from "axios";

import type { EmailsListResponse } from "../types/email";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
});

export async function fetchEmails(page: number, limit: number): Promise<EmailsListResponse> {
  const { data } = await api.get<EmailsListResponse>("/api/emails", {
    params: { page, limit, sort: "-createdAt" },
  });
  return data;
}
