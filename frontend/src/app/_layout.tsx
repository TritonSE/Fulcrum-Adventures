import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";
import {
  LeagueSpartan_400Regular,
  LeagueSpartan_500Medium,
  LeagueSpartan_600SemiBold,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "../components/ToastProvider";
import { ActivityProvider } from "../Context/ActivityContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Instrument Sans": InstrumentSans_400Regular,
    "Instrument Sans Medium": InstrumentSans_500Medium,
    "Instrument Sans Bold": InstrumentSans_700Bold,
    "League Spartan": LeagueSpartan_700Bold,
    "League Spartan Regular": LeagueSpartan_400Regular,
    "League Spartan Medium": LeagueSpartan_500Medium,
    "League Spartan SemiBold": LeagueSpartan_600SemiBold,
    // Aliases for typo.ts (save page) naming convention
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_700Bold,
    LeagueSpartan_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ActivityProvider>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="activity/[id]" />
              <Stack.Screen name="category/[name]" />
              <Stack.Screen
                name="saved/LibraryPopupModalScreen"
                options={{
                  presentation: "transparentModal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="saved/CreatePlaylistModalScreen"
                options={{
                  presentation: "transparentModal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          </ToastProvider>
        </ActivityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
