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
  if (range.max >= 99) return `${range.min}+`;
  if (range.min === range.max) return range.min.toString();
  return `${range.min}-${range.max}`;
};
