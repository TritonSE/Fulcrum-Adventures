import { createContext } from "react";

import type { Activity } from "../types/activity";

export type Playlist = {
  id: string;
  name: string;
  color: string;
  activityIds: string[];
};

export type ActivityContextType = {
  activities: Activity[];
  bookmarkedActivities: Activity[];
  isLoadingActivities: boolean;
  activitiesError: string | null;
  isUsingCachedActivities: boolean;
  refreshActivities: () => Promise<void>;
  toggleSaved: (id: string) => void;
  toggleDownload: (id: string) => void;
  toggleHistory: (id: string) => void;
  togglePlaylist: (id: string) => void;
  reorderBookmarks: (newOrder: Activity[]) => void;
  playlists: Playlist[];
  addToPlaylist: (playlistId: string, activityId: string) => void;
  createPlaylist: (name: string, color: string) => string;
  setSaved: (id: string, saved: boolean) => void;
  reorderPlaylistActivities: (playlistId: string, newActivityIds: string[]) => void;
  editPlaylist: (playlistId: string, name: string, color: string) => void;
  deletePlaylist: (playlistId: string) => void;
  markViewed: (id: string) => void;
  restorePlaylist: (playlist: Playlist, index?: number) => void;
  removeFromPlaylist: (playlistId: string, activityId: string) => void;
};

export const ActivityContext = createContext<ActivityContextType | undefined>(undefined);
