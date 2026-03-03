// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useNavigation } from "@react-navigation/native";
// import React, { useMemo } from "react";
// import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

// import { useActivities } from "../context_temp/ActivityContext";
// import { showToast } from "../utils/toast";

// import type { RootStackParamList } from "../types/navigation";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   activityId: string;
// };

// type Nav = NativeStackNavigationProp<RootStackParamList>;

// export const LibraryPopup: React.FC<Props> = ({ visible, onClose, activityId }) => {
//   const { playlists, addToPlaylist, removeFromPlaylist, setSaved, activities } = useActivities();

//   const navigation = useNavigation<Nav>();

//   const activity = activities.find((a) => a.id === activityId);
//   const currentlySaved = !!activity?.isSaved;

//   // Count of bookmarked entries for the subtitle
//   const bookmarkedCount = useMemo(() => activities.filter((a) => a.isSaved).length, [activities]);

//   const toggleBookmark = () => {
//     setSaved(activityId, !currentlySaved);
//   };

//   // const isInPlaylist = (playlistId: string) => {
//   //   const p = playlists.find((x) => x.id === playlistId);
//   //   if (!p) return false;
//   //   return p.activityIds.includes(activityId);
//   // };

//   const togglePlaylist = (playlistId: string) => {
//     const playlist = playlists.find((p) => p.id === playlistId);
//     if (!playlist) return;

//     const alreadyIn = playlist.activityIds.includes(activityId);

//     if (alreadyIn) {
//       removeFromPlaylist(playlistId, activityId);

//       showToast("Removed from playlist", {
//         actionLabel: "Undo",
//         onAction: () => addToPlaylist(playlistId, activityId),
//       });
//     } else {
//       addToPlaylist(playlistId, activityId);
//       setSaved(activityId, true);

//       showToast(`Added to ${playlist.name}`, {
//         actionLabel: "Undo",
//         onAction: () => removeFromPlaylist(playlistId, activityId),
//       });
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//       {/* Backdrop */}
//       <Pressable style={styles.backdrop} onPress={onClose} />

//       {/* Bottom sheet */}
//       <View style={styles.sheet}>
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>Library</Text>

//           <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
//             <Ionicons name="close" size={18} color="#1E2A5A" />
//           </Pressable>
//         </View>

//         {/* Bookmarked card */}
//         <View style={styles.card}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardTitle}>Bookmarked</Text>
//             <Text style={styles.cardSub}>{bookmarkedCount} activities</Text>
//           </View>

//           <Pressable onPress={toggleBookmark} style={styles.iconCircle} hitSlop={10}>
//             <Ionicons
//               name={currentlySaved ? "bookmark" : "bookmark-outline"}
//               size={18}
//               color="#1E2A5A"
//             />
//           </Pressable>
//         </View>

//         {/* Save to playlist header */}
//         <View style={styles.sectionHeaderRow}>
//           <Text style={styles.sectionTitle}>Save to Playlist</Text>

//           <Pressable
//             onPress={() => {
//               onClose();
//               navigation.navigate("CreatePlaylistModal", { activityId });
//             }}
//             hitSlop={10}
//           >
//             <Text style={styles.createNew}>Create New</Text>
//           </Pressable>
//         </View>

//         {playlists.length === 0 ? (
//           <Text style={styles.empty}>No playlists created yet.</Text>
//         ) : (
//           <FlatList
//             data={playlists}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={{ paddingBottom: 10 }}
//             renderItem={({ item }) => {
//               const selected = item.activityIds.includes(activityId);

//               return (
//                 <Pressable style={styles.playlistRow} onPress={() => togglePlaylist(item.id)}>
//                   <View style={styles.colorDotWrap}>
//                     <View style={[styles.colorDot, { backgroundColor: item.color }]} />
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.playlistName}>{item.name}</Text>
//                     <Text style={styles.playlistSub}>{item.activityIds.length} activity</Text>
//                   </View>

//                   {selected ? (
//                     <View style={styles.checkCircle}>
//                       <Ionicons name="checkmark" size={16} color="white" />
//                     </View>
//                   ) : (
//                     <View style={styles.checkCircleOutline} />
//                   )}
//                 </Pressable>
//               );
//             }}
//           />
//         )}
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.35)",
//   },

//   sheet: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "white",
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//     padding: 20,
//     paddingTop: 18,
//     maxHeight: "75%",
//   },

//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: "#1E2A5A",
//   },

//   closeBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#EBEBEB",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "white",
//   },

//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#EEE",
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 2,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#1E2A5A",
//   },

//   cardSub: {
//     marginTop: 6,
//     fontSize: 13,
//     color: "#2F3E75",
//     opacity: 0.8,
//   },

//   iconCircle: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     borderWidth: 1,
//     borderColor: "#EBEBEB",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "white",
//   },

//   sectionHeaderRow: {
//     marginTop: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1E2A5A",
//   },

//   createNew: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#2F3E75",
//   },

//   empty: {
//     textAlign: "center",
//     color: "#8A8FA3",
//     marginTop: 30,
//     marginBottom: 10,
//     fontSize: 14,
//   },

//   playlistRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 16,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#EEE",
//     marginBottom: 12,
//     backgroundColor: "white",
//   },

//   colorDotWrap: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#F2F3F5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },

//   colorDot: {
//     width: 22,
//     height: 22,
//     borderRadius: 6,
//   },

//   playlistName: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#1E2A5A",
//   },

//   playlistSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#8A8FA3",
//   },

//   checkCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#1E2A5A",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   checkCircleOutline: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: "#1E2A5A",
//     opacity: 0.25,
//   },
// });
