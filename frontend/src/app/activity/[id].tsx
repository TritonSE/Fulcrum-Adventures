import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ActivityDetail from "../../components/ActivityDetail";
import { useActivities } from "../../Context/ActivityContext";
import { getActivityById } from "../../data/mockActivities";
import { activitiesApi } from "../../services/api";
import { mapApiActivityToActivity } from "../../services/activityMapper";

import type { Activity } from "../../types/activity";

const styles = StyleSheet.create({
  statusScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: "#F9F9F9",
  },
  statusText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  retryText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans Medium",
    fontSize: 14,
    lineHeight: 21,
    textDecorationLine: "underline",
  },
});

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities } = useActivities();
  const contextActivity = activities.find((a) => a.id === id);
  const mockActivity = id ? getActivityById(id) : undefined;
  const initialActivity = contextActivity ?? mockActivity;
  const [activity, setActivity] = useState<Activity | undefined>(initialActivity);
  const [isLoading, setIsLoading] = useState(!initialActivity);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadActivity() {
      setIsLoading(true);
      setError(null);

      try {
        const apiActivity = await activitiesApi.get(id);
        if (isMounted) {
          setActivity(mapApiActivityToActivity(apiActivity));
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Unable to load activity.";

        if (isMounted) {
          setError(message);
          setActivity((currentActivity) => currentActivity ?? mockActivity);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadActivity();

    return () => {
      isMounted = false;
    };
  }, [id, mockActivity]);

  useEffect(() => {
    if (initialActivity) {
      setActivity(initialActivity);
    }
  }, [initialActivity]);

  if (isLoading && !activity) {
    return (
      <View style={styles.statusScreen}>
        <ActivityIndicator color="#153F7A" />
        <Text style={styles.statusText}>Loading activity...</Text>
      </View>
    );
  }

  if (error && !activity) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusText}>Unable to load activity.</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.retryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.statusScreen}>
        <Text style={styles.statusText}>Activity not found.</Text>
      </View>
    );
  }

  return <ActivityDetail activity={activity} onBack={() => router.back()} />;
}
