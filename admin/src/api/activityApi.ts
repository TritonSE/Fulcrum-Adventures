const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

export const ACTIVITY_API_BASE_URL = defaultApiBaseUrl.replace(/\/+$/, "");
export const ACTIVITY_API_URL = `${ACTIVITY_API_BASE_URL}/api/activities`;

export type ActivityStatus = "Draft" | "Published" | "Archived";

export type CreateActivityPayload = {
  title: string;
  overview: string;
  thumbnailUrl?: string;
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
  objective: string;
  facilitateSections: {
    tabName: string;
    content: string;
  }[];
  materials: string[];
  selTags: string[];
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

const readErrorBody = async (response: Response) => {
  const text = await response.text();

  if (!text) return `Request failed with status ${response.status}`;

  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    return parsed.error || parsed.message || text;
  } catch {
    return text;
  }
};

export const getActivityId = (activity: ActivityResponse) => {
  const id = activity._id ?? activity.id;
  return typeof id === "string" && id.length > 0 ? id : null;
};

export const createActivity = async (payload: CreateActivityPayload) => {
  const response = await fetch(ACTIVITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await readErrorBody(response));
  return response.json() as Promise<ActivityResponse>;
};

export const getActivityById = async (activityId: string) => {
  const response = await fetch(`${ACTIVITY_API_URL}/${activityId}`);

  if (!response.ok) throw new Error(await readErrorBody(response));
  return response.json() as Promise<ActivityDetail>;
};

export const updateActivity = async (activityId: string, payload: CreateActivityPayload) => {
  const response = await fetch(`${ACTIVITY_API_URL}/${activityId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await readErrorBody(response));
  return response.json() as Promise<ActivityResponse>;
};

export const updateActivityStatus = async (activityId: string, status: ActivityStatus) => {
  const response = await fetch(`${ACTIVITY_API_URL}/${activityId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error(await readErrorBody(response));
  return response.json() as Promise<ActivityResponse>;
};
