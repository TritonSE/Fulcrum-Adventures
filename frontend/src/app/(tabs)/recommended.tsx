import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import type { Activity } from "@/types/activity";
import type { FlatList } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { RECOMMENDED_TITLES } from "@/constants/homeSections";
import { useActivities } from "@/Context/useActivities";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function RecommendedScreen() {
  const { activities: stateActivities, toggleSaved } = useActivities();
  const listRef = useRef<FlatList<Activity>>(null);
  const sourceActivities = stateActivities.length > 0 ? stateActivities : mockActivities;
  const activities = sourceActivities.filter((activity) =>
    RECOMMENDED_TITLES.includes(activity.title),
  );

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
    }, []),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HomePopUpPageHeaderSection sectionName="Recommended" />

      <View style={{ flex: 1 }}>
        <ActivityList
          listRef={listRef}
          activities={activities}
          onSaveToggle={toggleSaved}
          variant="card"
          horizontal={false}
          showHeader={false}
          showApiStatus={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 40,
          }}
        />
      </View>
    </View>
  );
}
