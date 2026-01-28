import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FiltersModal } from "./src/components/FiltersModal";

const defaultFilters = {
  category: undefined,
  setup_props: undefined,
  duration: [],
  grade_level: [],
  group_size: [],
  energy_level: 0,
  environment: [],
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setModalVisible(true)}>
        <Text>Open Filters</Text>
      </Pressable>

      <FiltersModal
        visible={modalVisible}
        initial={defaultFilters}
        onClose={() => setModalVisible(false)}
        onApply={() => {}}
      />
      <StatusBar style="auto" />
    </View>
  );
}
