import React, { createContext, use, useState } from "react";

import type { Activity } from "../types/activity";

type Playlist = {
  id: string;
  name: string;
  color: string;
  activityIds: string[];
};

type ActivityContextType = {
  activities: Activity[];
  bookmarkedActivities: Activity[];
  toggleSaved: (id: string) => void;
  toggleDownload: (id: string) => void;
  toggleHistory: (id: string) => void;
  togglePlaylist: (id: string) => void;
  reorderBookmarks: (newOrder: Activity[]) => void;

  playlists: Playlist[];
  addToPlaylist: (playlistId: string, activityId: string) => void;
  createPlaylist: (name: string, color: string) => string;
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
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const bookmarkedActivities = activities.filter((a) => a.isSaved);

  const reorderBookmarks = (newOrder: Activity[]) => {
    setActivities((prev) => {
      const nonBookmarked = prev.filter((a) => !a.isSaved);
      return [...newOrder, ...nonBookmarked];
    });
  };

  const addToPlaylist = (playlistId: string, activityId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              activityIds: p.activityIds.includes(activityId)
                ? p.activityIds
                : [...p.activityIds, activityId],
            }
          : p,
      ),
    );
  };

  const createPlaylist = (name: string, color: string): string => {
    const id = Date.now().toString();
    const newPlaylist: Playlist = { id, name, color, activityIds: [] };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return id;
  };

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
      value={{
        activities,
        bookmarkedActivities,
        toggleSaved,
        toggleDownload,
        toggleHistory,
        togglePlaylist,
        reorderBookmarks,
        playlists,
        addToPlaylist,
        createPlaylist,
      }}
    >
      {children}
    </ActivityContext>
  );
}

export const useActivities = (): ActivityContextType => {
  const context = use(ActivityContext);
  if (!context) throw new Error("useActivities must be used inside ActivityProvider");
  return context;
};
