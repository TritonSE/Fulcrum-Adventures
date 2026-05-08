import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function RecommendedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HomePopUpPageHeaderSection sectionName="Recommended" />

      <View style={{ flex: 1 }}>
        <ActivityList
          activities={mockActivities}
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
