import type { Category } from "../types/activity";

export const CATEGORIES: Category[] = [
  "Opener",
  "Icebreaker",
  "Active",
  "Connection",
  "Debrief",
  "Team Challenge",
];

export const FILTER_OPTIONS = {
  category: ["All", ...CATEGORIES],
  setupProps: ["Props", "No Props"],
  duration: ["5-15 min", "15-30 min", "30+ min"],
  gradeLevel: ["K-2", "3-5", "6-8", "9-12"],
  groupSize: ["Small (3-15)", "Medium (15-30)", "Large (30+)"],
  environment: ["Indoor", "Outdoor", "Both"],
};
