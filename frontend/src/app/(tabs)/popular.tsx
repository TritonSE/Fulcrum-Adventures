import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { POPULAR_TITLES } from "@/constants/homeSections";
import { useActivities } from "@/Context/useActivities";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function PopularScreen() {
  const { activities: stateActivities, toggleSaved } = useActivities();
  const sourceActivities = stateActivities.length > 0 ? stateActivities : mockActivities;
  const activities = sourceActivities.filter((activity) => POPULAR_TITLES.includes(activity.title));

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HomePopUpPageHeaderSection sectionName="Popular" />

      <View style={{ flex: 1 }}>
        <ActivityList
          activities={activities}
          onSaveToggle={toggleSaved}
          variant="card"
          horizontal={false}
          showHeader={false}
          showApiStatus={false}
          contentContainerStyle={{
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: 40,
          }}
        />
      </View>
    </View>
  );
}
