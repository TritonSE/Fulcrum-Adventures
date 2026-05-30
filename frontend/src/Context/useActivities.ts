import { use } from "react";

import { ActivityContext } from "./activityContextValue";

import type { ActivityContextType } from "./activityContextValue";

export function useActivities(): ActivityContextType {
  const context = use(ActivityContext);

  if (!context) {
    throw new Error("useActivities must be used inside ActivityProvider");
  }

  return context;
}
