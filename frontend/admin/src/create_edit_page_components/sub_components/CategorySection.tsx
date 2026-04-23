import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const CATEGORY_OPTIONS = [
  "Opener",
  "Icebreaker",
  "Active",
  "Debrief",
  "Connection",
  "Team Challenge",
];

type CategorySectionProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const CategorySection: React.FC<CategorySectionProps> = ({ selected, onChange }) => {
  const canSelectMore = selected.length < 3;

  const toggleCategory = (category: string) => {
    const isSelected = selected.includes(category);

    if (isSelected) {
      onChange(selected.filter((item) => item !== category));
      return;
    }

    if (!canSelectMore) return;

    onChange([...selected, category]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Category <Text style={styles.lightText}>(Select up to three)</Text>
      </Text>

      <View style={styles.chipContainer}>
        {CATEGORY_OPTIONS.map((category) => {
          const isSelected = selected.includes(category);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <Pressable
              key={category}
              onPress={() => toggleCategory(category)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                isDisabled && styles.chipDisabled,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  isDisabled && styles.chipTextDisabled,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: 16,
  },
  lightText: {
    fontWeight: "400",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7DDE8",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  chipSelected: {
    borderColor: "#1F3B82",
    backgroundColor: "#EAF0FF",
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5B6B8B",
  },
  chipTextSelected: {
    color: "#1F3B82",
  },
  chipTextDisabled: {
    color: "#8E99B2",
  },
});
