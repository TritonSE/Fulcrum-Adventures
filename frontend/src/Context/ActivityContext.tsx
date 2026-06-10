import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { getActivityById } from "../data/mockActivities";
import { mapApiActivityToActivity } from "../services/activityMapper";
import { activitiesApi } from "../services/api";

import { ActivityContext } from "./activityContextValue";

import type { Activity } from "../types/activity";
import type { Playlist } from "./activityContextValue";
import type { AppStateStatus } from "react-native";

const LOCAL_ACTIVITY_STATE_KEY = "fulcrum-adventures:activity-state:v1";

type PersistedActivityState = {
  savedActivityIds: string[];
  downloadedActivityIds: string[];
  viewedActivityTimestamps: Record<string, number>;
  playlists: Playlist[];
  activitySnapshots: Activity[];
};

const EMPTY_PERSISTED_STATE: PersistedActivityState = {
  savedActivityIds: [],
  downloadedActivityIds: [],
  viewedActivityTimestamps: {},
  playlists: [],
  activitySnapshots: [],
};

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizePersistedState(value: unknown): PersistedActivityState {
  if (!value || typeof value !== "object") return EMPTY_PERSISTED_STATE;

  const state = value as Partial<PersistedActivityState>;
  const viewedActivityTimestamps =
    state.viewedActivityTimestamps && typeof state.viewedActivityTimestamps === "object"
      ? Object.fromEntries(
          Object.entries(state.viewedActivityTimestamps).filter(
            ([id, timestamp]) => typeof id === "string" && typeof timestamp === "number",
          ),
        )
      : {};
  const activitySnapshots = Array.isArray(state.activitySnapshots)
    ? state.activitySnapshots.filter(
        (activity): activity is Activity =>
          Boolean(activity) &&
          typeof activity === "object" &&
          typeof (activity as Partial<Activity>).id === "string",
      )
    : [];

  return {
    savedActivityIds: getStringArray(state.savedActivityIds),
    downloadedActivityIds: getStringArray(state.downloadedActivityIds),
    viewedActivityTimestamps,
    playlists: Array.isArray(state.playlists) ? state.playlists : [],
    activitySnapshots,
  };
}

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

function applyPersistedActivityState(
  activities: Activity[],
  persistedState: PersistedActivityState,
) {
  const savedIds = new Set(persistedState.savedActivityIds);
  const downloadedIds = new Set(persistedState.downloadedActivityIds);
  const activityIds = new Set(activities.map((activity) => activity.id));
  const snapshotById = new Map(
    persistedState.activitySnapshots.map((activity) => [activity.id, activity]),
  );
  const playlistActivityIds = persistedState.playlists.flatMap((playlist) => playlist.activityIds);

  const mergedActivities = activities.map((activity) => ({
    ...activity,
    isSaved: savedIds.has(activity.id),
    isDownloaded: downloadedIds.has(activity.id),
    lastViewedAt: persistedState.viewedActivityTimestamps[activity.id] ?? activity.lastViewedAt,
  }));

  const localOnlyIds = new Set([
    ...persistedState.savedActivityIds,
    ...persistedState.downloadedActivityIds,
    ...Object.keys(persistedState.viewedActivityTimestamps),
    ...playlistActivityIds,
  ]);

  localOnlyIds.forEach((id) => {
    if (activityIds.has(id)) return;

    const localActivity = snapshotById.get(id) ?? getActivityById(id);
    if (!localActivity) return;

    mergedActivities.push({
      ...localActivity,
      isSaved: savedIds.has(id),
      isDownloaded: downloadedIds.has(id),
      lastViewedAt: persistedState.viewedActivityTimestamps[id] ?? localActivity.lastViewedAt,
    });
  });

  return mergedActivities;
}

function createPersistedActivityState(
  activities: Activity[],
  playlists: Playlist[],
): PersistedActivityState {
  const playlistActivityIds = new Set(playlists.flatMap((playlist) => playlist.activityIds));
  const activitySnapshots = activities.filter(
    (activity) =>
      activity.isSaved ||
      activity.isDownloaded ||
      typeof activity.lastViewedAt === "number" ||
      playlistActivityIds.has(activity.id),
  );

  return {
    savedActivityIds: activities
      .filter((activity) => activity.isSaved)
      .map((activity) => activity.id),
    downloadedActivityIds: activities
      .filter((activity) => activity.isDownloaded)
      .map((activity) => activity.id),
    viewedActivityTimestamps: activities.reduce<Record<string, number>>((timestamps, activity) => {
      if (typeof activity.lastViewedAt === "number") {
        timestamps[activity.id] = activity.lastViewedAt;
      }

      return timestamps;
    }, {}),
    playlists,
    activitySnapshots,
  };
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
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false);
  const currentActivitiesRef = useRef<Activity[]>([]);
  const lastSuccessfulActivitiesRef = useRef<Activity[]>([]);
  const persistedActivityStateRef = useRef<PersistedActivityState>(EMPTY_PERSISTED_STATE);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    currentActivitiesRef.current = activities;
  }, [activities]);

  const refreshActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    setActivitiesError(null);
    setIsUsingCachedActivities(false);

    try {
      const apiActivities = await activitiesApi.listAll({ status: "Published" });
      const nextActivities = applyPersistedActivityState(
        apiActivities.map(mapApiActivityToActivity),
        persistedActivityStateRef.current,
      );
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

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        (previousAppState === "background" || previousAppState === "inactive") &&
        nextAppState === "active"
      ) {
        void refreshActivities();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshActivities]);

  useEffect(() => {
    let isMounted = true;

    const loadLocalState = async () => {
      try {
        const storedState = await AsyncStorage.getItem(LOCAL_ACTIVITY_STATE_KEY);
        const parsedState: unknown = storedState ? JSON.parse(storedState) : EMPTY_PERSISTED_STATE;
        const persistedState = normalizePersistedState(parsedState);

        if (!isMounted) return;

        persistedActivityStateRef.current = persistedState;
        setPlaylists(persistedState.playlists);
        setActivities((previous) => applyPersistedActivityState(previous, persistedState));
      } catch {
        // Keep the app usable even if local storage is unavailable or corrupted.
      } finally {
        if (isMounted) setHasLoadedLocalState(true);
      }
    };

    void loadLocalState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalState || isLoadingActivities) return;

    const hasPersistedActivityState =
      persistedActivityStateRef.current.savedActivityIds.length > 0 ||
      persistedActivityStateRef.current.downloadedActivityIds.length > 0 ||
      Object.keys(persistedActivityStateRef.current.viewedActivityTimestamps).length > 0;

    if (activities.length === 0 && hasPersistedActivityState) {
      return;
    }

    const persistedState = createPersistedActivityState(activities, playlists);
    persistedActivityStateRef.current = persistedState;

    void AsyncStorage.setItem(LOCAL_ACTIVITY_STATE_KEY, JSON.stringify(persistedState));
  }, [activities, hasLoadedLocalState, isLoadingActivities, playlists]);

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
    setActivities((prev) => {
      if (!prev.some((activity) => activity.id === id)) {
        return addMockActivity(prev, id, { isDownloaded: true });
      }

      return prev.map((a) => (a.id === id ? { ...a, isDownloaded: !a.isDownloaded } : a));
    });
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
