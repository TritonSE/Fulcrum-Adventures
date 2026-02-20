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
  duration: [
    { min: 5, max: 15 },
    { min: 15, max: 30 },
    { min: 30, max: 60 },
  ],
  gradeLevel: [
    { min: 0, max: 2 },
    { min: 3, max: 5 },
    { min: 6, max: 8 },
    { min: 9, max: 12 },
  ],
  groupSize: [
    { min: 3, max: 15 },
    { min: 15, max: 30 },
    { min: 30, max: 100 },
  ],
  environment: ["Indoor", "Outdoor", "Both"],
};
