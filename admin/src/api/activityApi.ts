import { API_BASE_URL, get, patch, post, put } from "./requests";

export const ACTIVITY_API_BASE_URL = API_BASE_URL;
export const ACTIVITY_API_URL = `${ACTIVITY_API_BASE_URL}/api/activities`;

export type ActivityStatus = "Draft" | "Published" | "Archived";

export type CreateActivityPayload = {
  title?: string;
  overview?: string;
  thumbnailUrl?: string;
  category?: string[];
  gradeRange?: {
    min: number;
    max: number;
  };
  groupSize?: {
    min: number;
    max: number;
    anySize: boolean;
  };
  duration?: string;
  energyLevel?: string;
  environment?: string[];
  setup?: "None" | "Required";
  objective?: string;
  facilitateSections?: {
    tabName: string;
    content: string;
  }[];
  materials?: string[];
  selTags?: string[];
  status: ActivityStatus;
  videoUrl?: string;
};

export type ActivityResponse = {
  _id?: string;
  id?: string;
  status?: ActivityStatus;
  [key: string]: unknown;
};

export type ActivityDetail = ActivityResponse & {
  title: string;
  overview: string;
  thumbnailUrl?: string;
  additionalMedia?: Array<{
    type: "image" | "video";
    url: string;
  }>;
  category: string[];
  gradeRange: {
    min: number;
    max: number;
  };
  groupSize: {
    min: number;
    max: number;
    anySize: boolean;
  };
  duration: string;
  energyLevel: string;
  environment: string[];
  setup: "None" | "Required";
  objective?: string;
  facilitateSections: Array<{
    tabName: string;
    content: string;
  }>;
  materials: string[];
  selTags: string[];
  videoUrl?: string;
};

export const getActivityId = (activity: ActivityResponse) => {
  const id = activity._id ?? activity.id;
  return typeof id === "string" && id.length > 0 ? id : null;
};

export const createActivity = async (payload: CreateActivityPayload) => {
  const response = await post("/api/activities", payload);
  return response.json() as Promise<ActivityResponse>;
};

export const getActivityById = async (activityId: string) => {
  const response = await get(`/api/activities/${activityId}`);
  return response.json() as Promise<ActivityDetail>;
};

export const updateActivity = async (activityId: string, payload: CreateActivityPayload) => {
  const response = await put(`/api/activities/${activityId}`, payload);
  return response.json() as Promise<ActivityResponse>;
};

export const updateActivityStatus = async (activityId: string, status: ActivityStatus) => {
  const response = await patch(`/api/activities/${activityId}/status`, { status });
  return response.json() as Promise<ActivityResponse>;
};
