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

export function applyActivityStateAndMediaByTitle(
  baseActivities: Activity[],
  stateActivities: Activity[],
): Activity[] {
  const stateById = new Map(stateActivities.map((activity) => [activity.id, activity]));
  const stateByTitle = new Map(stateActivities.map((activity) => [activity.title, activity]));

  return baseActivities.map((activity) => {
    const titleMatch = stateByTitle.get(activity.title);
    const stateActivity = titleMatch ?? stateById.get(activity.id);
    const localStateActivity = stateActivity ? stateById.get(stateActivity.id) : undefined;
    const activityWithRemoteMedia = stateActivity
      ? {
          ...activity,
          id: stateActivity.id,
          imageUrl: stateActivity.imageUrl ?? activity.imageUrl,
          videoUrl: stateActivity.videoUrl ?? activity.videoUrl,
          hasTutorial: stateActivity.hasTutorial ?? activity.hasTutorial,
        }
      : activity;

    if (!localStateActivity) return activityWithRemoteMedia;

    return LOCAL_STATE_FIELDS.reduce<Activity>(
      (mergedActivity, field) => ({
        ...mergedActivity,
        [field]: localStateActivity[field],
      }),
      activityWithRemoteMedia,
    );
  });
}
