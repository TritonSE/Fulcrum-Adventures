import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type GroupSizeSectionProps = {
  minValue: string;
  maxValue: string;
  anySize: boolean;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onChangeAnySize: (value: boolean) => void;
};

export const GroupSizeSection: React.FC<GroupSizeSectionProps> = ({
  minValue,
  maxValue,
  anySize,
  onChangeMin,
  onChangeMax,
  onChangeAnySize,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Group Size</Text>

      <View style={styles.row}>
        <TextInput
          value={minValue}
          onChangeText={onChangeMin}
          editable={!anySize}
          placeholder="Min"
          placeholderTextColor="#B4B4B4"
          keyboardType="number-pad"
          style={[styles.input, anySize && styles.inputDisabled]}
        />

        <Text style={styles.toText}>to</Text>

        <TextInput
          value={maxValue}
          onChangeText={onChangeMax}
          editable={!anySize}
          placeholder="Max"
          placeholderTextColor="#B4B4B4"
          keyboardType="number-pad"
          style={[styles.input, anySize && styles.inputDisabled]}
        />
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => onChangeAnySize(!anySize)}>
        <View style={[styles.checkbox, anySize && styles.checkboxChecked]}>
          {anySize && <Text style={styles.checkboxCheck}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Any Size</Text>
      </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    width: 78,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    color: "#0F172A",
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: "#F6F6F6",
    color: "#B4B4B4",
  },
  toText: {
    fontSize: 16,
    color: "#5B6B8B",
    fontWeight: "500",
  },
  checkboxRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 4,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: "#1F3B82",
    backgroundColor: "#EAF0FF",
  },
  checkboxCheck: {
    color: "#1F3B82",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxLabel: {
    color: "#5B6B8B",
    fontSize: 14,
    fontWeight: "500",
  },
});
