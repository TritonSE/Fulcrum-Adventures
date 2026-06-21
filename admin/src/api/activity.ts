import type { Activity } from "../types/activity";
import { del, get, handleAPIError, patch, type APIResult } from "./requests";
import type {
  Category,
  Duration,
  EnergyLevel,
  Environment,
  Setup,
} from "../types/activity";

type GradeLevel = "K-2" | "3-5" | "6-8" | "9-12";
type GroupSize = "Small (3-15)" | "Medium (15-30)" | "Large (30+)";
export type ListActivitiesRequest = {
  status?: string;
  search?: string;
  category?: Category[];
  duration?: Duration[];
  gradeLevel?: GradeLevel[];
  groupSize?: GroupSize[];
  energyLevel?: EnergyLevel;
  environment?: Environment[];
  setup?: Setup;
  sort?: string;
  page?: string;
  limit?: string;
};

export type ListActivitiesResponse = {
  activities: Activity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function fetchActivities(
  request: ListActivitiesRequest,
): Promise<APIResult<ListActivitiesResponse>> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(request)) {
      if (value === undefined || value === "") continue;

      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
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

export type GetActivityStatsResponse = {
  total: number;
  categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  statuses: {
    [k: string]: number;
  };
};

export async function getActivityStats(): Promise<
  APIResult<GetActivityStatsResponse>
> {
  try {
    const response = await get("/api/activities/stats");
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function updateActivityStatus(
  activityId: string,
  status: string,
): Promise<APIResult<null>> {
  try {
    await patch(`/api/activities/${activityId}/status`, { status });
    return { success: true, data: null };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteActivity(
  activityId: string,
): Promise<APIResult<null>> {
  try {
    await del(`/api/activities/${activityId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleAPIError(error);
  }
}
