// import { StatusBar } from "expo-status-bar";
// import { StyleSheet, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BookmarksScreen from "./src/app/saved/BookmarksScreen";
import DownloadsScreen from "./src/app/saved/DownloadsScreen";
import HistoryScreen from "./src/app/saved/HistoryScreen";
import LibraryScreen from "./src/app/saved/LibraryScreen";
import PlaylistScreen from "./src/app/saved/PlaylistScreen";
// import LibraryScreen from "./src/app/saved/LibraryScreen";
import { ActivityProvider } from "./src/context_temp/ActivityContext";
import { PlaylistProvider } from "./src/context_temp/PlaylistContext";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PlaylistProvider>
      <ActivityProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Downloads" component={DownloadsScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Playlist" component={PlaylistScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ActivityProvider>
    </PlaylistProvider>
  );
}
