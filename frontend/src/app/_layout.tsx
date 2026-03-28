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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Instrument Sans": InstrumentSans_400Regular,
    "Instrument Sans Medium": InstrumentSans_500Medium,
    "Instrument Sans Bold": InstrumentSans_700Bold,
    "League Spartan": LeagueSpartan_700Bold,
    "League Spartan Regular": LeagueSpartan_400Regular,
    "League Spartan Medium": LeagueSpartan_500Medium,
    "League Spartan SemiBold": LeagueSpartan_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
