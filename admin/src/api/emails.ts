import { get } from "./requests";

import type { EmailsListResponse } from "../types/email";

export async function fetchAllEmails(): Promise<EmailsListResponse> {
  const response = await get("/api/emails/all");
  return response.json() as Promise<EmailsListResponse>;
}
