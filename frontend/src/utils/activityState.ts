import type { Activity } from "../types/activity";

const LOCAL_STATE_FIELDS = [
  "isSaved",
  "isCompleted",
  "isDownloaded",
  "isHistory",
  "isPlaylist",
  "lastViewedAt",
] as const;

export function applyActivityState(
  baseActivities: Activity[],
  stateActivities: Activity[],
): Activity[] {
  const stateById = new Map(stateActivities.map((activity) => [activity.id, activity]));

  return baseActivities.map((activity) => {
    const stateActivity = stateById.get(activity.id);
    if (!stateActivity) return activity;

    return LOCAL_STATE_FIELDS.reduce<Activity>(
      (mergedActivity, field) => ({
        ...mergedActivity,
        [field]: stateActivity[field],
      }),
      activity,
    );
  });
}
