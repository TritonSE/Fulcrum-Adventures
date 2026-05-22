import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { RECOMMENDED_TITLES } from "@/constants/homeSections";
import { useActivities } from "@/Context/ActivityContext";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";
import { applyActivityState } from "@/utils/activityState";

export default function RecommendedScreen() {
  const { activities: stateActivities, toggleSaved } = useActivities();
  const activities = applyActivityState(
    mockActivities.filter((activity) => RECOMMENDED_TITLES.includes(activity.title)),
    stateActivities,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HomePopUpPageHeaderSection sectionName="Recommended" />

      <View style={{ flex: 1 }}>
        <ActivityList
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
