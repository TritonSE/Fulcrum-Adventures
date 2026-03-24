import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useLayoutEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "../../../assets/icons/back_button.svg";
import { ActivityList } from "../../components/ActivityList";
import { Navbar } from "../../components/Navbar";
import { useActivities } from "../../context/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Downloads">;

export default function DownloadsScreen({ navigation }: Props) {
  const { activities, toggleSaved, markViewed } = useActivities();

  const downloaded = activities.filter((a) => a.isDownloaded);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Downloads",
      headerStyle: { backgroundColor: "#153A7A" },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800", fontSize: 26 },
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Count row (same as Bookmarks) */}
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: "#153A7A",
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingLeft: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <BackButton width={40} height={40} />
        </Pressable>

        <Text
          style={{
            marginLeft: 12,
            marginBottom: 5,
            fontFamily: "LeagueSpartan_700Bold",
            fontSize: 28,
            color: "#FFF",
          }}
        >
          Downloads
        </Text>
      </View>

      <ActivityList
        header=""
        activities={downloaded}
        fill
        showHeader={false}
        onSaveToggle={toggleSaved}
        onActivityPress={(a) => {
          markViewed?.(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
      <View style={{ paddingBottom: insets.bottom + 8, backgroundColor: "#F2F3F5" }}>
        <Navbar
          currentTab="Library"
          onSwitchTab={(tab) => {
            if (tab === "Library") navigation.navigate("Library");
          }}
        />
      </View>
    </View>
  );
}
