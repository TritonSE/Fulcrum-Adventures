import type { Range } from "../types/activity";

export const formatGradeLevel = (range: Range): string => {
  const minText = range.min === 0 ? "K" : range.min.toString();
  if (range.min === range.max) return minText;
  return `${minText}-${range.max}`;
};

export const formatDuration = (range: Range): string => {
  if (range.min === range.max) return `${range.min} min`;
  return `${range.min}-${range.max} min`;
};

export const formatGroupSize = (range: Range): string => {
  if ("anySize" in range && range.anySize) return "Any size";
  if (range.max >= 99) return `${range.min}+`;
  if (range.min === range.max) return range.min.toString();
  return `${range.min}-${range.max}`;
};

// hierarchy defined in Figma
const CATEGORY_ORDER = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

// Sorts categories and enforces the 3-tag max limit
export function getSortedCategories(
  categories?: string[] | string,
  contextCategory?: string,
): string[] {
  // Fallback in case data passes a single string instead of an array
  const catArray = Array.isArray(categories) ? categories : categories ? [categories] : [];

  if (catArray.length === 0) return [];

  const sorted = [...catArray].sort((a, b) => {
    // Context category (what the user clicked to get here) always wins #1 spot
    if (contextCategory) {
      if (a === contextCategory) return -1;
      if (b === contextCategory) return 1;
    }

    // Sort by defined Figma hierarchy
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Fallback alphabetical sort if they aren't in the official list
    return a.localeCompare(b);
  });

  // Enforce the absolute maximum of 3 tags per card
  return sorted.slice(0, 3);
}
