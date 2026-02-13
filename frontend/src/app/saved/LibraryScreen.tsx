import { Pressable, ScrollView, Text, View } from "react-native";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Library">;

// export default function LibraryScreen() {
//   return null;
// }

export default function LibraryScreen({ navigation }: Props) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
      <View style={{ padding: 20 }}>
        {/* Title */}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Your Library</Text>

        {/* Bookmarks card */}
        <Pressable
          onPress={() => navigation.navigate("Bookmarks")}
          style={{
            backgroundColor: "#2F3E75",
            padding: 18,
            borderRadius: 14,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Bookmarks</Text>
          <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Save for later</Text>
        </Pressable>

        {/* Downloads + History row */}
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Downloads</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Available offline</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>History</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Recently viewed</Text>
          </View>
        </View>

        {/* Playlists header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Playlists</Text>

          <Pressable
            style={{
              backgroundColor: "#2F3E75",
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 20 }}>+</Text>
          </Pressable>
        </View>

        {/* Playlist card */}
        <View
          style={{
            backgroundColor: "#8BC34A",
            padding: 20,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Elementary K-5</Text>

          <Text style={{ color: "#EAF5D6", marginTop: 6 }}>6 activities</Text>
        </View>
      </View>
    </ScrollView>
  );
}

//HELLO

// import { useState } from "react";
// import { Pressable, Text, View } from "react-native";

// import { ActivityList } from "../../../src/components/ActivityList";

// import type { Activity } from "../../../src/types/activity";

// export default function SavedScreen() {
//   const [tab, setTab] = useState<"bookmarks" | "downloads" | "history">("bookmarks");

//   // Example activity data
//   const allActivities: Activity[] = [
//     {
//       id: "1",
//       title: "Hiking",
//       isSaved: true,
//       gradeLevel: "10",
//       groupSize: "10",
//       duration: "4 hours",
//       category: "Opener",
//       description: "Grand Canyon hiking!",
//       energyLevel: "High",
//       environment: "Outdoor",
//       materials: ["Backpack", "Water bottle"].map((name) => ({ name, isChecked: false })),
//     },
//     {
//       id: "2",
//       title: "Museum",
//       isSaved: true,
//       gradeLevel: "3",
//       groupSize: "5",
//       duration: "2 hours",
//       category: "Opener",
//       description: "Fun!",
//       energyLevel: "Low",
//       environment: "Indoor",
//       materials: ["Backpack", "Water bottle"].map((name) => ({ name, isChecked: false })),
//     },
//     {
//       id: "3",
//       title: "Kayaking",
//       isSaved: true,
//       gradeLevel: "5",
//       groupSize: "10",
//       duration: "4 hours",
//       category: "Opener",
//       description: "Creeks!",
//       energyLevel: "High",
//       environment: "Outdoor",
//       materials: ["Lifejacket", "Water bottle"].map((name) => ({ name, isChecked: false })),
//     },
//   ];

//   const bookmarks = ["1", "3"];
//   const downloads = ["2"];
//   const history = ["1", "2", "3"];

//   const data = { bookmarks, downloads, history };

//   // Convert IDs -> Activity objects
//   const activitiesForTab = allActivities.filter((a) => data[tab].includes(a.id));

//   return (
//     <View style={{ padding: 20, flex: 1 }}>
//       <View style={{ flexDirection: "row", gap: 12 }}>
//         <Pressable onPress={() => setTab("bookmarks")}>
//           <Text>Bookmarks</Text>
//         </Pressable>
//         <Pressable onPress={() => setTab("downloads")}>
//           <Text>Downloads</Text>
//         </Pressable>
//         <Pressable onPress={() => setTab("history")}>
//           <Text>History</Text>
//         </Pressable>
//       </View>

//       <ActivityList header={tab.toUpperCase()} activities={activitiesForTab} />
//     </View>
//   );
// }

// import { ScrollView, Text, View } from "react-native";

// import { LibraryRow } from "../../components/LibraryRow";
// import { PlaylistCard } from "../../components/PlaylistCard";

// export default function LibraryScreen() {
//   return (
//     <ScrollView style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Your Library</Text>

//       <LibraryRow icon="bookmark-outline" label="Bookmarks" />
//       <LibraryRow icon="download-outline" label="Downloads" />
//       <LibraryRow icon="time-outline" label="History" />

//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           marginTop: 24,
//           marginBottom: 12,
//         }}
//       >
//         <Text style={{ fontSize: 22, fontWeight: "700" }}>Your Playlists</Text>

//         <Text>Edit</Text>
//       </View>

//       <View
//         style={{
//           flexDirection: "row",
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <PlaylistCard title="+ Create Playlist" count="" color="#eee" />
//         <PlaylistCard title="Elementary K-5" count={12} color="#A7B6D8" />
//         <PlaylistCard title="Energizers" count={12} color="#60B284" />
//         <PlaylistCard title="Mondays" count={12} color="#E3CF58" />
//       </View>
//     </ScrollView>
//   );
// }
