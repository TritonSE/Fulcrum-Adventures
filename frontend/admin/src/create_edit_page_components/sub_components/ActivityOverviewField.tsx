import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { FieldError } from "./FieldError";

export const ActivityOverviewField: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Overview</Text>

      <TextInput
        placeholder="Brief description of the activity"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <FieldError message="Please enter an activity overview" />
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
  textArea: {
    width: "100%",
    minHeight: 96,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E55C4D",
    fontSize: 14,
    backgroundColor: "#FFF",
    color: "#000",
    textAlignVertical: "top",
  },
});
