import type { Category, EnergyLevel, Environment, Range } from "../types/activity";

export type RangeOption = Range & { label: string };

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
    { label: "5-15 min", min: 5, max: 15 },
    { label: "15-30 min", min: 15, max: 30 },
    { label: "30+ min", min: 30, max: 999 },
  ] as RangeOption[],

  gradeLevel: [
    { label: "K-2", min: 0, max: 2 },
    { label: "3-5", min: 3, max: 5 },
    { label: "6-8", min: 6, max: 8 },
    { label: "9-12", min: 9, max: 12 },
  ] as RangeOption[],

  groupSize: [
    { label: "Small (3-15)", min: 3, max: 15 },
    { label: "Medium (15-30)", min: 15, max: 30 },
    { label: "Large (30+)", min: 30, max: 999 },
  ] as RangeOption[],

  environment: ["Any Environment", "Classroom", "Field", "Gym/MPR", "Blacktop"] as Environment[],

  energyLevel: ["Low", "Medium", "High"] as EnergyLevel[],
};
