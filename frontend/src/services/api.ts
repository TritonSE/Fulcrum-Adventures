import type { ApiActivity, ActivityStatus, Setup } from "../types/activity";

declare const process: {
  env?: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

const DEFAULT_API_BASE_URL = "http://172.20.88.215:4000";

export const API_BASE_URL =
  process.env?.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, boolean | number | string | undefined>;
  retryCount?: number;
  retryDelayMs?: number;
};

export type ListActivitiesParams = {
  status?: ActivityStatus;
  search?: string;
  category?: string;
  energyLevel?: string;
  environment?: string;
  setup?: Setup;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ListActivitiesResponse<TActivity = unknown> = {
  activities: TActivity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, `${API_BASE_URL}/`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryRequest(
  response: Response | undefined,
  method: string,
  attempt: number,
  retryCount: number,
) {
  if (attempt >= retryCount || method !== "GET") {
    return false;
  }

  if (!response) {
    return true;
  }

  return response.status === 408 || response.status === 429 || response.status >= 500;
}

export async function apiRequest<TResponse>(
  path: string,
  {
    body,
    headers,
    query,
    retryCount,
    retryDelayMs = 400,
    method = "GET",
    ...options
  }: RequestOptions = {},
): Promise<TResponse> {
  const requestMethod = method.toUpperCase();
  const maxRetries = retryCount ?? (requestMethod === "GET" ? 1 : 0);
  let attempt = 0;

  while (true) {
    let response: Response | undefined;

    try {
      response = await fetch(buildUrl(path, query), {
        ...options,
        method: requestMethod,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (shouldRetryRequest(undefined, requestMethod, attempt, maxRetries)) {
        attempt += 1;
        await delay(retryDelayMs * attempt);
        continue;
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unable to reach the server.",
        0,
        error,
      );
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      if (shouldRetryRequest(response, requestMethod, attempt, maxRetries)) {
        attempt += 1;
        await delay(retryDelayMs * attempt);
        continue;
      }

      const message =
        typeof data === "object" && data !== null && "error" in data
          ? String(data.error)
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as TResponse;
  }
}

export const activitiesApi = {
  list<TActivity = ApiActivity>(params: ListActivitiesParams = {}) {
    return apiRequest<ListActivitiesResponse<TActivity>>("/api/activities", {
      query: params,
    });
  },

  get<TActivity = ApiActivity>(id: string) {
    return apiRequest<TActivity>(`/api/activities/${id}`);
  },
};
