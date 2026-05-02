import { SearchPage } from "./src/app/(tabs)/search";
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { InstrumentSans_400Regular } from "@expo-google-fonts/instrument-sans";
import { View, Text } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
    InstrumentSans_400Regular,
  });

  if (!fontsLoaded) {
    return <View />;
  }

  return <SearchPage />;
}
