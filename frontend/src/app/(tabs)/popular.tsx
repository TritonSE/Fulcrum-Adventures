import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function PopularScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <HomePopUpPageHeaderSection sectionName="Popular" />

      <View style={{ flex: 1 }}>
        <ActivityList
          activities={mockActivities}
          variant="card"
          horizontal={false}
          showHeader={false}
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
