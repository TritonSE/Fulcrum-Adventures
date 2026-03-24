import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";
import { LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import ActivityDetail from "./src/components/ActivityDetail";
import NotesScreen from "./src/components/NotesScreen";
import { getActivityById } from "./src/data/mockActivities";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "League Spartan": LeagueSpartan_700Bold,
    "Instrument Sans": InstrumentSans_400Regular,
    "Instrument Sans Medium": InstrumentSans_500Medium,
    "Instrument Sans Bold": InstrumentSans_700Bold,
  });

  const activityId = "1";
  const [showNotes, setShowNotes] = useState(false);
  const activity = getActivityById(activityId);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!activity) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityDetail activity={activity} onOpenNotes={() => setShowNotes(true)} />
      {showNotes && <NotesScreen activityId={activityId} onClose={() => setShowNotes(false)} />}
      <StatusBar style="auto" />
    </View>
  );
}
