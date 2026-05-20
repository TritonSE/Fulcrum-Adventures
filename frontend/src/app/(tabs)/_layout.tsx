import { Tabs } from "expo-router";

import { NavbarTabBar } from "@/components/NavbarTabBar"; // path from app/(tabs)

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavbarTabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
    </Tabs>
  );
}
