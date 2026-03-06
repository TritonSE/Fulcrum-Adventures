import React from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 18,
    color: "#888",
  },
});

const PlaceHolderScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Placeholder Screen</Text>
      <Text style={styles.text}>Placeholder Screen</Text>
      <Text style={styles.text}>Placeholder Screen</Text>
      <Text style={styles.text}>Placeholder Screen</Text>
    </View>
  );
};

export default PlaceHolderScreen;
