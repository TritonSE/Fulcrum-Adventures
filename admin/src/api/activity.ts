import type { Activity } from "../types/activity";
import { get, handleAPIError, type APIResult } from "./requests";

export type ListActivitiesRequest = {
  status?: string;
  search?: string;
  category?: string;
  energyLevel?: string;
  environment?: string;
  setup?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export type ListActivitiesResponse = {
  activities: Activity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function fetchActivities(request: ListActivitiesRequest): Promise<APIResult<ListActivitiesResponse>> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(request)) {
      if (value !== undefined && value !== "") {
        params.append(key, value);
      }
    }
    const query = params.toString();
    const url = `/api/activities${query ? `?${query}` : ""}`;
    const response = await get(url);
    const data = await response.json();
    return {
      success: true,
      data: {
        activities: data.activities,
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  }
}