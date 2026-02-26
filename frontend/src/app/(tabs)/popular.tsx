import { View } from "react-native";

import { ActivityList } from "@/components/ActivityList";
import { mockActivities } from "@/data/mockActivities";
import { HomePopUpPageHeaderSection } from "@/home_components/HomePopUpPageHeaderSection";

export default function PopularScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HomePopUpPageHeaderSection
        sectionName="Popular"
        rightPadding={202}
      ></HomePopUpPageHeaderSection>
      <ActivityList header="" activities={mockActivities} variant="card" horizontal={false} />
    </View>
  );
}
