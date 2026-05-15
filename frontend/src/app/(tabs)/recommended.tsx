import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { useActivities } from "@/Context/ActivityContext";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function RecommendedScreen() {
  const { activities, toggleSaved } = useActivities();

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
