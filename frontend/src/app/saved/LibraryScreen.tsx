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
