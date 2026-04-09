import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { FieldError } from "./FieldError";

export const ActivityTitleField: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Title</Text>

      <TextInput
        placeholder="Enter activity title"
        placeholderTextColor="#999"
        style={styles.input}
      />

      <FieldError message="Please enter an activity title" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F3B82",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E55C4D",
    fontSize: 14,
    backgroundColor: "#FFF",
    color: "#000",
  },
});
