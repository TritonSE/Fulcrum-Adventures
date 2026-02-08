import { View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { mockActivities } from "../data/mockActivities";
import { HomePopUpPageHeaderSection } from "../home_components/HomePopUpPageHeaderSection";

export default function PopularScreen() {
  return (
    <View>
      <HomePopUpPageHeaderSection sectionName="Recommended" rightPadding={91} />
      <ActivityList header="" activities={mockActivities} variant="card" horizontal={false} />
    </View>
  );
}
