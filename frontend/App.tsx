import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts as useInstrumentSansFonts,
} from "@expo-google-fonts/instrument-sans";
import {
  LeagueSpartan_500Medium,
  LeagueSpartan_700Bold,
  LeagueSpartan_800ExtraBold,
  useFonts as useLeagueSpartanFonts,
} from "@expo-google-fonts/league-spartan";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { isLoaded } from "expo-font";
import { GestureHandlerRootView, Pressable } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ActivityDetailScreen from "./src/app/saved/ActivityDetailScreen";
import BookmarksScreen from "./src/app/saved/BookmarksScreen";
import CreatePlaylistModalScreen from "./src/app/saved/CreatePlaylistModalScreen";
import DownloadsScreen from "./src/app/saved/DownloadsScreen";
import HistoryScreen from "./src/app/saved/HistoryScreen";
import LibraryPopupModalScreen from "./src/app/saved/LibraryPopupModalScreen";
import LibraryScreen from "./src/app/saved/LibraryScreen";
import PlaylistScreen from "./src/app/saved/PlaylistScreen";
import { HeaderBackButton } from "./src/components/HeaderBackButton";
import { ToastProvider } from "./src/components/ToastProvider";
import { ActivityProvider } from "./src/context_temp/ActivityContext";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

export default function App() {
  const [lsLoaded] = useLeagueSpartanFonts({
    LeagueSpartan_500Medium,
    LeagueSpartan_700Bold,
    LeagueSpartan_800ExtraBold,
  });
  const [isLoaded1] = useInstrumentSansFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  if (!lsLoaded || !isLoaded1) return null;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ActivityProvider>
            <NavigationContainer theme={TransparentTheme}>
              <Stack.Navigator
                screenOptions={({ navigation }) => ({
                  headerBackVisible: false,
                  headerLeft: () =>
                    navigation.canGoBack() ? (
                      <HeaderBackButton onPress={() => navigation.goBack()} />
                    ) : null,
                })}
              >
                <Stack.Screen
                  name="Library"
                  component={LibraryScreen}
                  options={{
                    headerLeft: () => null,
                    headerStyle: { backgroundColor: "#F2F3F5" },
                    headerShadowVisible: false, // iOS
                    headerTintColor: "#153A7A",
                    headerTitle: "",
                  }}
                />
                <Stack.Screen
                  name="Bookmarks"
                  component={BookmarksScreen}
                  options={{
                    headerShown: false,
                    title: "Bookmarks",
                    headerTitleStyle: {
                      fontFamily: "LeagueSpartan_700Bold",
                      fontSize: 32,
                    },
                  }}
                />
                <Stack.Screen
                  name="Downloads"
                  component={DownloadsScreen}
                  options={{
                    headerShown: false,
                    headerStyle: { backgroundColor: "#153A7A" },
                    headerTintColor: "white", // title + back arrow color
                    headerTitleStyle: {
                      fontWeight: "700",
                      fontSize: 32,
                    },
                  }}
                />
                <Stack.Screen
                  name="History"
                  component={HistoryScreen}
                  options={{
                    headerShown: false,
                    headerStyle: { backgroundColor: "#153A7A" },
                    headerTintColor: "white", // title + back arrow color
                    headerTitleStyle: {
                      fontWeight: "700",
                      fontSize: 26,
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
    </SafeAreaProvider>
  );
}
