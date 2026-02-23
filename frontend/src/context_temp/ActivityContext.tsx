import React, { createContext, use, useState } from "react";

import type { Activity } from "../types/activity";

type ActivityContextType = {
  activities: Activity[];
  toggleSaved: (id: string) => void;
  toggleDownload: (id: string) => void;
  toggleHistory: (id: string) => void;
  togglePlaylist: (id: string) => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const initialActivities: Activity[] = [
  {
    id: "1",
    title: "Hiking",
    isSaved: true,
    gradeLevel: "10",
    groupSize: "10",
    duration: "4 hours",
    category: "Opener",
    description: "Grand Canyon hiking!",
    energyLevel: "High",
    environment: "Outdoor",
    materials: [],
    isDownloaded: true,
  },
  {
    id: "2",
    title: "Museum",
    isSaved: true,
    gradeLevel: "3",
    groupSize: "5",
    duration: "2 hours",
    category: "Opener",
    description: "Fun!",
    energyLevel: "Low",
    environment: "Indoor",
    materials: [],
    isDownloaded: true,
    isPlaylist: true,
  },
];

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState(initialActivities);

  const toggleSaved = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a)));
  };

  const toggleDownload = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDownloaded: !a.isDownloaded } : a)),
    );
  };

  const toggleHistory = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isHistory: !a.isHistory } : a)));
  };

  const togglePlaylist = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPlaylist: !a.isPlaylist } : a)),
    );
  };

  return (
    <ActivityContext
      value={{ activities, toggleSaved, toggleDownload, toggleHistory, togglePlaylist }}
    >
      {children}
    </ActivityContext>
  );
}

export function useActivities() {
  const ctx = use(ActivityContext);
  if (!ctx) throw new Error("useActivities must be used in provider");
  return ctx;
}
