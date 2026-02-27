import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { StatusBar } from "expo-status-bar";
// import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import ActivityDetailScreen from "./src/app/saved/ActivityDetailScreen";
import BookmarksScreen from "./src/app/saved/BookmarksScreen";
import CreatePlaylistModalScreen from "./src/app/saved/CreatePlaylistModalScreen";
import DownloadsScreen from "./src/app/saved/DownloadsScreen";
import HistoryScreen from "./src/app/saved/HistoryScreen";
import LibraryScreen from "./src/app/saved/LibraryScreen";
import PlaylistScreen from "./src/app/saved/PlaylistScreen";
import { ToastProvider } from "./src/components/ToastProvider";
// import LibraryScreen from "./src/app/saved/LibraryScreen";
import { ActivityProvider } from "./src/context_temp/ActivityContext";
// import { PlaylistProvider } from "./src/context_temp/PlaylistContext";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ToastProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActivityProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Library"
                component={LibraryScreen}
                options={{
                  headerStyle: { backgroundColor: "#153A7A" },
                  headerTintColor: "white", // title + back arrow color
                  headerTitleStyle: {
                    fontWeight: "800",
                    fontSize: 20,
                  },
                }}
              />
              <Stack.Screen
                name="Bookmarks"
                component={BookmarksScreen}
                options={{
                  headerStyle: { backgroundColor: "#153A7A" },
                  headerTintColor: "white", // title + back arrow color
                  headerTitleStyle: {
                    fontWeight: "800",
                    fontSize: 20,
                  },
                }}
              />
              <Stack.Screen
                name="Downloads"
                component={DownloadsScreen}
                options={{
                  headerStyle: { backgroundColor: "#153A7A" },
                  headerTintColor: "white", // title + back arrow color
                  headerTitleStyle: {
                    fontWeight: "800",
                    fontSize: 20,
                  },
                }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  headerStyle: { backgroundColor: "#153A7A" },
                  headerTintColor: "white", // title + back arrow color
                  headerTitleStyle: {
                    fontWeight: "800",
                    fontSize: 20,
                  },
                }}
              />
              <Stack.Screen name="Playlist" component={PlaylistScreen} />
              <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
              <Stack.Screen
                name="CreatePlaylistModal"
                component={CreatePlaylistModalScreen}
                options={{
                  headerStyle: { backgroundColor: "#153A7A" },
                  presentation: "modal",
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ActivityProvider>
      </GestureHandlerRootView>
    </ToastProvider>
  );
}
