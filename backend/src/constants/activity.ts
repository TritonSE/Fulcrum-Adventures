export const ACTIVITY_STATUSES = ["Draft", "Published", "Archived"] as const;

export const ACTIVITY_CATEGORIES = [
  "Opener",
  "Icebreaker",
  "Active",
  "Connection",
  "Debrief",
  "Team Challenge",
] as const;

export const ACTIVITY_ENERGY_LEVELS = ["Low", "Medium", "High"] as const;

export const ACTIVITY_ENVIRONMENTS = [
  "Blacktop",
  "Field",
  "Classroom",
  "Gym/MPR",
  "Any Environment",
] as const;

export const ACTIVITY_SETUPS = ["None", "Required"] as const;

export const ACTIVITY_DURATIONS = ["5-15 min", "15-30 min", "30+ min"] as const;

export const ACTIVITY_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "energyLevel",
  "duration",
  "status",
] as const;
