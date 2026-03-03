import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ActivityDetailScreen from "./src/app/saved/ActivityDetailScreen";
import BookmarksScreen from "./src/app/saved/BookmarksScreen";
import CreatePlaylistModalScreen from "./src/app/saved/CreatePlaylistModalScreen";
import DownloadsScreen from "./src/app/saved/DownloadsScreen";
import HistoryScreen from "./src/app/saved/HistoryScreen";
import LibraryPopupModalScreen from "./src/app/saved/LibraryPopupModalScreen";
import LibraryScreen from "./src/app/saved/LibraryScreen";
import PlaylistScreen from "./src/app/saved/PlaylistScreen";
import { ToastProvider } from "./src/components/ToastProvider";
import { ActivityProvider } from "./src/context_temp/ActivityContext";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent", // ✅ key
  },
};

export default function App() {
  return (
    <ToastProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActivityProvider>
          <NavigationContainer theme={TransparentTheme}>
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
                  headerShown: false,
                  presentation: "transparentModal",
                  animation: "slide_from_bottom",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="LibraryPopupModal"
                component={LibraryPopupModalScreen}
                options={{
                  headerShown: false,
                  presentation: "transparentModal",
                  animation: "slide_from_bottom",
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ActivityProvider>
      </GestureHandlerRootView>
    </ToastProvider>
  );
}
