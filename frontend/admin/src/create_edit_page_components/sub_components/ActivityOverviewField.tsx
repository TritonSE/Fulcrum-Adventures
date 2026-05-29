import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { FieldError } from "./FieldError";

const MAX_OVERVIEW_LENGTH = 200;

type ActivityOverviewFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
};

export const ActivityOverviewField: React.FC<ActivityOverviewFieldProps> = ({
  value,
  onChangeText,
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Overview</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Brief description of the activity"
        placeholderTextColor="#B4B4B4"
        maxLength={MAX_OVERVIEW_LENGTH}
        multiline
        numberOfLines={4}
        style={[styles.input, error && styles.inputError]}
      />

      <Text style={styles.characterCount}>
        {value.length}/{MAX_OVERVIEW_LENGTH} characters
      </Text>
      {error && <FieldError message={error} />}
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
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans Bold",
  },
  input: {
    width: "100%",
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0F172A",
    fontSize: 14,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  characterCount: {
    marginTop: 8,
    color: "#999",
    fontSize: 13,
  },
});
