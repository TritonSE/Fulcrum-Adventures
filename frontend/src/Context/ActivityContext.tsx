import React, { useCallback, useEffect, useRef, useState } from "react";

import { getActivityById } from "../data/mockActivities";
import { mapApiActivityToActivity } from "../services/activityMapper";
import { activitiesApi } from "../services/api";

import { ActivityContext } from "./activityContextValue";

import type { Activity } from "../types/activity";
import type { Playlist } from "./activityContextValue";

function mergeLocalActivityState(previous: Activity[], next: Activity[]) {
  const previousById = new Map(previous.map((activity) => [activity.id, activity]));
  const nextIds = new Set(next.map((activity) => activity.id));

  const mergedActivities = next.map((activity) => {
    const previousActivity = previousById.get(activity.id);

    if (!previousActivity) {
      return activity;
    }

    return {
      ...activity,
      isSaved: previousActivity.isSaved,
      isCompleted: previousActivity.isCompleted,
      isDownloaded: previousActivity.isDownloaded,
      isHistory: previousActivity.isHistory,
      isPlaylist: previousActivity.isPlaylist,
      lastViewedAt: previousActivity.lastViewedAt,
    };
  });

  const localOnlyActivities = previous.filter(
    (activity) =>
      !nextIds.has(activity.id) &&
      (activity.isSaved ||
        activity.isCompleted ||
        activity.isDownloaded ||
        activity.isHistory ||
        activity.isPlaylist),
  );

  return [...mergedActivities, ...localOnlyActivities];
}

function addMockActivity(previous: Activity[], id: string, changes: Partial<Activity>) {
  const mockActivity = getActivityById(id);
  if (!mockActivity) return previous;

  return [...previous, { ...mockActivity, ...changes }];
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [isUsingCachedActivities, setIsUsingCachedActivities] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const currentActivitiesRef = useRef<Activity[]>([]);
  const lastSuccessfulActivitiesRef = useRef<Activity[]>([]);

  useEffect(() => {
    currentActivitiesRef.current = activities;
  }, [activities]);

  const refreshActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    setActivitiesError(null);
    setIsUsingCachedActivities(false);

    try {
      const apiActivities = await activitiesApi.listAll({ status: "Published" });
      const nextActivities = apiActivities.map(mapApiActivityToActivity);
      setActivities((previous) => {
        const mergedActivities = mergeLocalActivityState(previous, nextActivities);
        lastSuccessfulActivitiesRef.current = mergedActivities;
        return mergedActivities;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load activities.";
      const currentActivities = currentActivitiesRef.current;
      const fallbackActivities =
        currentActivities.length > 0 ? currentActivities : lastSuccessfulActivitiesRef.current;

      setActivitiesError(message);
      setIsUsingCachedActivities(fallbackActivities.length > 0);

      if (fallbackActivities.length > 0) {
        lastSuccessfulActivitiesRef.current = fallbackActivities;
        setActivities(fallbackActivities);
      }
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  useEffect(() => {
    void refreshActivities();
  }, [refreshActivities]);

  const markViewed = (id: string) => {
    const now = Date.now();
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              lastViewedAt: now,
            }
          : a,
      ),
    );
  };

  const removeFromPlaylist = (playlistId: string, activityId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, activityIds: p.activityIds.filter((id) => id !== activityId) }
          : p,
      ),
    );
  };

  const restorePlaylist = (playlist: Playlist, index?: number) => {
    setPlaylists((prev) => {
      // Prevent duplicates if undo is tapped twice
      if (prev.some((p) => p.id === playlist.id)) return prev;

      const copy = [...prev];
      const insertAt = index == null ? copy.length : Math.max(0, Math.min(index, copy.length));
      copy.splice(insertAt, 0, playlist);
      return copy;
    });
  };
  const setSaved = (id: string, saved: boolean) => {
    setActivities((prev) => {
      if (!prev.some((activity) => activity.id === id)) {
        return saved ? addMockActivity(prev, id, { isSaved: true }) : prev;
      }

      return prev.map((a) => (a.id === id ? { ...a, isSaved: saved } : a));
    });
  };

  const reorderPlaylistActivities = (playlistId: string, newActivityIds: string[]) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, activityIds: newActivityIds } : p)),
    );
  };

  const editPlaylist = (playlistId: string, name: string, color: string) => {
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, name, color } : p)));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

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
    setActivities((prev) => {
      if (!prev.some((activity) => activity.id === id)) {
        return addMockActivity(prev, id, { isSaved: true });
      }

      return prev.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a));
    });
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
        isLoadingActivities,
        activitiesError,
        isUsingCachedActivities,
        refreshActivities,
        toggleSaved,
        toggleDownload,
        toggleHistory,
        togglePlaylist,
        reorderBookmarks,
        playlists,
        addToPlaylist,
        createPlaylist,
        setSaved,
        reorderPlaylistActivities,
        editPlaylist,
        deletePlaylist,
        markViewed,
        restorePlaylist,
        removeFromPlaylist,
      }}
    >
      {children}
    </ActivityContext>
  );
}
