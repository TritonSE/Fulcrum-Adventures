import type { Range } from "../types/activity";

// Formats grade range (e.g., 0-12 -> "K-12")
export const formatGradeLevel = (range: Range): string => {
  const minText = range.min === 0 ? "K" : range.min.toString();
  if (range.min === range.max) return minText;
  return `${minText}-${range.max}`;
};

// Formats duration (e.g., 5-15 -> "5-15 min")
export const formatDuration = (range: Range): string => {
  if (range.min === range.max) return `${range.min} min`;
  return `${range.min}-${range.max} min`;
};

// Formats group size (e.g., 5-20 -> "5-20")
export const formatGroupSize = (range: Range): string => {
  if (range.max >= 99) return `${range.min}+`;
  if (range.min === range.max) return range.min.toString();
  return `${range.min}-${range.max}`;
};
