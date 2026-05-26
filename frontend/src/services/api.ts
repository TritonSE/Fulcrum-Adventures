import type { ActivityStatus, ApiActivity, Setup } from "../types/activity";

declare const process: {
  env?: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

const DEFAULT_API_BASE_URL = "http://10.50.146.216:4000";

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

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as unknown;
  }

  return response.text();
}

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
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

function isApiErrorResponse(data: unknown): data is { error: unknown } {
  return typeof data === "object" && data !== null && "error" in data;
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

  async function request(attempt: number): Promise<TResponse> {
    const response = await fetch(buildUrl(path, query), {
      ...options,
      method: requestMethod,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      if (shouldRetryRequest(response, requestMethod, attempt, maxRetries)) {
        const nextAttempt = attempt + 1;
        await delay(retryDelayMs * nextAttempt);
        return request(nextAttempt);
      }

      const message = isApiErrorResponse(data)
        ? String(data.error)
        : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as TResponse;
  }

  try {
    return await request(0);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (shouldRetryRequest(undefined, requestMethod, 0, maxRetries)) {
      await delay(retryDelayMs);
      return request(1);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Unable to reach the server.",
      0,
      error,
    );
  }
}

export const activitiesApi = {
  async list<TActivity = ApiActivity>(params: ListActivitiesParams = {}) {
    return apiRequest<ListActivitiesResponse<TActivity>>("/api/activities", {
      query: params,
    });
  },

  async get<TActivity = ApiActivity>(id: string) {
    return apiRequest<TActivity>(`/api/activities/${id}`);
  },
};
