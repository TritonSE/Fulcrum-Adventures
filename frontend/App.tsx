// import { StatusBar } from "expo-status-bar";
// import { StyleSheet, Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BookmarksScreen from "./src/app/saved/BookmarksScreen";
import LibraryScreen from "./src/app/saved/LibraryScreen";
// import LibraryScreen from "./src/app/saved/LibraryScreen";
import { ActivityProvider } from "./src/Context/ActivityContext";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ActivityProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ActivityProvider>
  );
}
