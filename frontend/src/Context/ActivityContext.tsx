import React, { createContext, use, useState } from "react";

import { mockActivities } from "../data/mockActivities";

import type { Activity } from "../types/activity";

type ActivityContextType = {
  activities: Activity[];
  toggleSaved: (id: string) => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const toggleSaved = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a)));
  };

  return <ActivityContext value={{ activities, toggleSaved }}>{children}</ActivityContext>;
}

export function useActivities() {
  const ctx = use(ActivityContext);
  if (!ctx) throw new Error("useActivities must be used in provider");
  return ctx;
}
