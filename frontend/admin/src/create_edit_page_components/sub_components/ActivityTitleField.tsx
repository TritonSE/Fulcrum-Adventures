import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const MAX_TITLE_LENGTH = 40;

type ActivityTitleFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export const ActivityTitleField: React.FC<ActivityTitleFieldProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activity Title</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter activity title"
        placeholderTextColor="#B4B4B4"
        maxLength={MAX_TITLE_LENGTH}
        style={styles.input}
      />

      <Text style={styles.characterCount}>
        {value.length}/{MAX_TITLE_LENGTH} characters
      </Text>
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
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  characterCount: {
    marginTop: 8,
    color: "#999",
    fontSize: 13,
  },
});
