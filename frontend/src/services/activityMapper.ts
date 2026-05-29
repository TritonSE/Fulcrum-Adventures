import { API_BASE_URL } from "./api";

import type { Activity, ApiActivity, ApiDuration, ApiGroupSize, CustomTab } from "../types/activity";

function mapDuration(duration: ApiDuration) {
  switch (duration) {
    case "5-15 min":
      return { min: 5, max: 15 };
    case "15-30 min":
      return { min: 15, max: 30 };
    case "30+ min":
      return { min: 30, max: 99 };
  }
}

function mapMediaUrl(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;

  return new URL(url, `${API_BASE_URL}/`).toString();
}

function mapGroupSize(groupSize: ApiGroupSize): Activity["groupSize"] {
  if (groupSize.anySize) {
    return {
      min: groupSize.min ?? 1,
      max: groupSize.max ?? 99,
      anySize: true,
    };
  }

  return {
    min: groupSize.min,
    max: groupSize.max,
  };
}

function mapFacilitateSections(apiActivity: ApiActivity): Activity["facilitate"] {
  if (apiActivity.facilitateSections.length === 0) {
    return undefined;
  }

  return apiActivity.facilitateSections.reduce<NonNullable<Activity["facilitate"]>>(
    (sections, section) => {
      const key = section.tabName.toLowerCase();

      if (key === "prep" || key === "setup") {
        sections.prep = { setup: [section.content] };
      } else if (key === "play") {
        sections.play = { steps: [{ stepNumber: 1, content: section.content }] };
      } else if (key === "debrief") {
        sections.debrief = { questions: [section.content] };
      } else {
        sections[section.tabName] = {
          sections: [{ content: section.content }],
        } satisfies CustomTab;
      }

      return sections;
    },
    {},
  );
}

export function mapApiActivityToActivity(apiActivity: ApiActivity): Activity {
  const primaryEnvironment = apiActivity.environment[0] ?? "Any Environment";
  const primaryCategory = apiActivity.category[0];

  return {
    id: apiActivity._id,
    title: apiActivity.title,
    gradeLevel: apiActivity.gradeRange,
    groupSize: mapGroupSize(apiActivity.groupSize),
    duration: mapDuration(apiActivity.duration),
    category: primaryCategory,
    categories: apiActivity.category,
    description: apiActivity.overview,
    energyLevel: apiActivity.energyLevel,
    environment: primaryEnvironment,
    materials: apiActivity.materials,
    imageUrl: mapMediaUrl(apiActivity.thumbnailUrl),
    objective: apiActivity.objective,
    facilitate: mapFacilitateSections(apiActivity),
    selTags: apiActivity.selTags,
    hasTutorial: Boolean(apiActivity.videoUrl),
    videoUrl: mapMediaUrl(apiActivity.videoUrl),
  };
}
