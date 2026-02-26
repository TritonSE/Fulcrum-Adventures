import { Pressable, Text, View } from "react-native";

import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Library">;

export default function LibraryScreen({ navigation }: Props) {
  const { activities, bookmarkedActivities, playlists } = useActivities();

  const downloadsCount = activities.filter((a) => a.isDownloaded).length;
  const historyCount = activities.filter((a) => a.isHistory).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
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
          <Text style={{ color: "#D0D5E8", marginTop: 4 }}>
            {bookmarkedActivities.length} activities
          </Text>
        </Pressable>

        {/* Downloads + History row */}
        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={() => navigation.navigate("Downloads")}
            style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Downloads</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>{downloadsCount} activities</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={{
              flex: 1,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>History</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>{historyCount} activities</Text>
          </Pressable>
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
            onPress={() => navigation.navigate("CreatePlaylistModal")}
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

        {/* Playlists list */}
        {playlists.length === 0 ? (
          <Text style={{ color: "#777" }}>No playlists yet. Tap + to create one.</Text>
        ) : (
          playlists.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate("Playlist", { playlistId: p.id })}
              style={{
                backgroundColor: p.color,
                padding: 16,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>{p.name}</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
                {p.activityIds.length} activities
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}
// import { useState } from "react";
// import { Modal, Pressable, Text, TextInput, View } from "react-native";

// import { useActivities } from "../../context_temp/ActivityContext";

// import type { RootStackParamList } from "../../types/navigation";
// import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// type Props = NativeStackScreenProps<RootStackParamList, "Library">;

// export default function LibraryScreen({ navigation }: Props) {
//   const { playlists } = useActivities();

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
//       <View style={{ padding: 20 }}>
//         {/* Header */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 16,
//           }}
//         >
//           <Text style={{ fontSize: 22, fontWeight: "bold" }}>Your Library</Text>

//           {/* + button opens modal SCREEN */}
//           <Pressable
//             onPress={() => navigation.navigate("CreatePlaylistModal")}
//             style={{
//               backgroundColor: "#2F3E75",
//               width: 32,
//               height: 32,
//               borderRadius: 16,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ color: "white", fontSize: 20 }}>+</Text>
//           </Pressable>
//         </View>

//         {/* Playlists list */}
//         {playlists.length === 0 ? (
//           <Text style={{ color: "#777" }}>No playlists yet. Tap + to create one.</Text>
//         ) : (
//           playlists.map((p) => (
//             <Pressable
//               key={p.id}
//               onPress={() => navigation.navigate("Playlist", { playlistId: p.id })}
//               style={{
//                 backgroundColor: "white",
//                 padding: 16,
//                 borderRadius: 14,
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ fontSize: 16, fontWeight: "700" }}>{p.name}</Text>
//               <Text style={{ color: "#777", marginTop: 4 }}>{p.activityIds.length} activities</Text>
//             </Pressable>
//           ))
//         )}
//       </View>
//     </View>
//   );
// }
// import { useState } from "react";
// import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
// import DraggableFlatList from "react-native-draggable-flatlist";

// import { usePlaylists } from "../../context_temp/PlaylistContext";

// import type { Playlist } from "../../context_temp/PlaylistContext";
// import type { RootStackParamList } from "../../types/navigation";
// import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// type Props = NativeStackScreenProps<RootStackParamList, "Library">;

// export default function LibraryScreen({ navigation }: Props) {
//   const [showModal, setShowModal] = useState(false);
//   const [playlistName, setPlaylistName] = useState("");
//   const [color, setColor] = useState("#8BC34A");
//   const { playlists, createPlaylist, setPlaylists, updatePlaylist } = usePlaylists();
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
//   const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
//   const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
//   const handleDelete = (id: string | null) => {
//     if (!id) return;
//     setPlaylists((prev) => prev.filter((p) => p.id !== id));
//   };

//   const handleEdit = () => {
//     if (!selectedPlaylistId) return;

//     const playlist = playlists.find((p) => p.id === selectedPlaylistId);
//     if (!playlist) return;

//     setEditingPlaylist(playlist);
//     setPlaylistName(playlist.name);
//     setColor(playlist.color);
//     setShowModal(true);
//   };
//   return (
//     <View style={{ flex: 1 }}>
//       <DraggableFlatList
//         style={{ backgroundColor: "#F2F3F5" }}
//         contentContainerStyle={{ padding: 20 }}
//         data={playlists}
//         keyExtractor={(item) => item.id}
//         onDragEnd={({ data }) => setPlaylists(data)}
//         ListHeaderComponent={
//           <>
//             {/* Title */}
//             <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Your Library</Text>

//             {/* Bookmarks card */}
//             <Pressable
//               onPress={() => navigation.navigate("Bookmarks")}
//               style={{
//                 backgroundColor: "#2F3E75",
//                 padding: 18,
//                 borderRadius: 14,
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Bookmarks</Text>
//               <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Save for later</Text>
//             </Pressable>

//             {/* Downloads + History row */}
//             <View style={{ flexDirection: "row", marginBottom: 28 }}>
//               <Pressable
//                 onPress={() => navigation.navigate("Downloads")}
//                 style={{
//                   flex: 1,
//                   marginRight: 12,
//                   backgroundColor: "#2F3E75",
//                   padding: 18,
//                   borderRadius: 14,
//                 }}
//               >
//                 <Text style={{ color: "white", fontWeight: "bold" }}>Downloads</Text>
//                 <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Available offline</Text>
//               </Pressable>

//               <Pressable
//                 onPress={() => navigation.navigate("History")}
//                 style={{
//                   flex: 1,
//                   backgroundColor: "#2F3E75",
//                   padding: 18,
//                   borderRadius: 14,
//                 }}
//               >
//                 <Text style={{ color: "white", fontWeight: "bold" }}>History</Text>
//                 <Text style={{ color: "#D0D5E8", marginTop: 4 }}>Recently viewed</Text>
//               </Pressable>
//             </View>

//             {/* Playlists header */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Playlists</Text>

//               <Pressable
//                 onPress={() => setShowModal(true)}
//                 style={{
//                   backgroundColor: "#2F3E75",
//                   width: 32,
//                   height: 32,
//                   borderRadius: 16,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text style={{ color: "white", fontSize: 20 }}>+</Text>
//               </Pressable>
//             </View>
//           </>
//         }
//         renderItem={({ item, drag, isActive }) => (
//           <Pressable
//             onLongPress={drag}
//             disabled={isActive}
//             onPress={() => navigation.navigate("Playlist", { playlistId: item.id })}
//             style={{
//               backgroundColor: item.color,
//               padding: 20,
//               borderRadius: 14,
//               marginBottom: 12,
//               opacity: isActive ? 0.8 : 1,
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <View>
//               <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>{item.name}</Text>

//               <Text style={{ color: "#EAF5D6", marginTop: 6 }}>
//                 {item.activityIds.length} activities
//               </Text>
//             </View>

//             {/* 3 Dot Menu Button */}
//             <Pressable
//               onPress={() => {
//                 setSelectedPlaylistId(item.id);
//                 setMenuVisible(true);
//               }}
//               style={{ padding: 6 }}
//             >
//               <Text style={{ color: "white", fontSize: 18 }}>⋮</Text>
//             </Pressable>
//           </Pressable>
//         )}
//       />
//       <Modal visible={showModal} transparent animationType="fade">
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             backgroundColor: "rgba(0,0,0,0.5)",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "white",
//               borderRadius: 16,
//               padding: 20,
//             }}
//           >
//             {/* Header */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ fontWeight: "700", fontSize: 18 }}>
//                 {editingPlaylist ? "Edit Playlist" : "New Playlist"}
//               </Text>

//               <Pressable onPress={() => setShowModal(false)}>
//                 <Text style={{ fontSize: 18 }}>✕</Text>
//               </Pressable>
//             </View>

//             {/* Name input */}
//             <Text>Playlist Name</Text>
//             <TextInput
//               value={playlistName}
//               onChangeText={setPlaylistName}
//               placeholder="Enter name..."
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 8,
//                 padding: 10,
//                 marginTop: 6,
//                 marginBottom: 16,
//               }}
//             />

//             {/* Color picker */}
//             <Text>Color</Text>
//             <View style={{ flexDirection: "row", marginTop: 10 }}>
//               {["#8BC34A", "#2196F3", "#FF9800", "#E91E63"].map((c) => (
//                 <Pressable
//                   key={c}
//                   onPress={() => setColor(c)}
//                   style={{
//                     width: 32,
//                     height: 32,
//                     borderRadius: 16,
//                     backgroundColor: c,
//                     marginRight: 12,
//                     borderWidth: color === c ? 3 : 0,
//                     borderColor: "black",
//                   }}
//                 />
//               ))}
//             </View>

//             {/* Buttons */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginTop: 24,
//               }}
//             >
//               <Pressable
//                 onPress={() => {
//                   setPlaylistName("");
//                   setColor("#8BC34A");
//                 }}
//               >
//                 <Text>Reset</Text>
//               </Pressable>

//               <Pressable
//                 onPress={() => {
//                   if (editingPlaylist) {
//                     updatePlaylist(editingPlaylist.id, playlistName, color);
//                   } else {
//                     createPlaylist(playlistName, color);
//                   }

//                   setEditingPlaylist(null);
//                   setPlaylistName("");
//                   setColor("#8BC34A");
//                   setShowModal(false);
//                 }}
//                 style={{
//                   backgroundColor: "#2F3E75",
//                   paddingHorizontal: 16,
//                   paddingVertical: 10,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Text style={{ color: "white" }}>Create Playlist</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//       <Modal visible={menuVisible} transparent animationType="fade">
//         <Pressable
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//           onPress={() => setMenuVisible(false)}
//         >
//           <View
//             style={{
//               width: 250,
//               backgroundColor: "white",
//               borderRadius: 12,
//               padding: 20,
//             }}
//           >
//             <Pressable
//               onPress={() => {
//                 setMenuVisible(false);
//                 handleEdit();
//               }}
//             >
//               <Text style={{ fontSize: 16, marginBottom: 15 }}>Edit</Text>
//             </Pressable>

//             <Pressable
//               onPress={() => {
//                 setMenuVisible(false);
//                 setConfirmDeleteVisible(true);
//               }}
//             >
//               <Text style={{ fontSize: 16, color: "red", marginBottom: 15 }}>Delete</Text>
//             </Pressable>

//             <Pressable onPress={() => setMenuVisible(false)}>
//               <Text style={{ textAlign: "right" }}>Cancel</Text>
//             </Pressable>
//           </View>
//         </Pressable>
//       </Modal>
//       <Modal visible={confirmDeleteVisible} transparent animationType="fade">
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: "rgba(0,0,0,0.4)",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               width: "100%",
//               backgroundColor: "white",
//               borderRadius: 16,
//               padding: 20,
//             }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Delete Playlist?
//             </Text>

//             <Text style={{ marginBottom: 20, color: "#555" }}>This action cannot be undone.</Text>

//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//               }}
//             >
//               <Pressable onPress={() => setConfirmDeleteVisible(false)}>
//                 <Text>Cancel</Text>
//               </Pressable>

//               <Pressable
//                 onPress={() => {
//                   handleDelete(selectedPlaylistId);
//                   setConfirmDeleteVisible(false);
//                   setSelectedPlaylistId(null);
//                 }}
//                 style={{
//                   backgroundColor: "red",
//                   paddingHorizontal: 16,
//                   paddingVertical: 8,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Text style={{ color: "white", fontWeight: "600" }}>Delete</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }
