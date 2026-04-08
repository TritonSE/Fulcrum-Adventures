import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    gap: 36,
  },
  fieldContainer: {
    width: "100%",
  },
  labelStyle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F3B82",
    marginBottom: 12,
  },
  inputStyle: {
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
  textArea: {
    minHeight: 96,
    textAlignVertical: "top", // Important for Android multiline
  },
  errorTextStyle: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#E55C4D",
  },
  dropdownPlaceholder: {
    width: "100%",
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFF",
    padding: 14,
    justifyContent: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
});

export const OverviewSection: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Activity Title */}
      <View style={styles.fieldContainer}>
        <Text style={styles.labelStyle}>Activity Title</Text>
        <TextInput
          placeholder="Enter activity title"
          style={styles.inputStyle}
          placeholderTextColor="#999"
        />
        <View style={styles.errorTextStyle}>
          <Text style={styles.errorText}>▲</Text>
          <Text style={styles.errorText}>Please enter an activity title</Text>
        </View>
      </View>

      {/* Activity Overview */}
      <View style={styles.fieldContainer}>
        <Text style={styles.labelStyle}>Activity Overview</Text>
        <TextInput
          placeholder="Brief description of the activity"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          style={[styles.inputStyle, styles.textArea]}
        />
        <View style={styles.errorTextStyle}>
          <Text style={styles.errorText}>▲</Text>
          <Text style={styles.errorText}>Please enter an activity overview</Text>
        </View>
      </View>

      {/* Category */}
      <View style={styles.fieldContainer}>
        <Text style={styles.labelStyle}>
          Category <Text style={{ fontWeight: "400" }}>(Select up to three)</Text>
        </Text>

        <View style={styles.dropdownPlaceholder}>
          <Text style={styles.placeholderText}>Category placeholder</Text>
        </View>
      </View>
    </View>
  );
};
