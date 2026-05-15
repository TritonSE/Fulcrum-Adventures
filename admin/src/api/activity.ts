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

export async function listActivities(request: ListActivitiesRequest): Promise<APIResult<Activity[]>> {
  try {
    const response = await get("/api/activities", request);
    const data = await response.json();
    return { success: true, data: data.activities };
  } catch (error) {
    return handleAPIError(error);
  }
}