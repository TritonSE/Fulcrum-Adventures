import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

type GradeSectionProps = {
  minValue: string;
  maxValue: string;
  onChange: (minValue: string, maxValue: string) => void;
};

type HandleType = "min" | "max";

export const GradeSection: React.FC<GradeSectionProps> = ({ minValue, maxValue, onChange }) => {
  const [activeHandle, setActiveHandle] = useState<HandleType>("max");

  const handleSelect = (nextValue: string) => {
    const nextIndex = GRADE_OPTIONS.indexOf(nextValue);
    const minIndex = GRADE_OPTIONS.indexOf(minValue);
    const maxIndex = GRADE_OPTIONS.indexOf(maxValue);

    if (activeHandle === "min") {
      if (nextIndex <= maxIndex) {
        onChange(nextValue, maxValue);
      } else {
        onChange(maxValue, nextValue);
      }
      setActiveHandle("max");
      return;
    }

    if (nextIndex >= minIndex) {
      onChange(minValue, nextValue);
    } else {
      onChange(nextValue, minValue);
    }
    setActiveHandle("min");
  };

  const minIndex = GRADE_OPTIONS.indexOf(minValue);
  const maxIndex = GRADE_OPTIONS.indexOf(maxValue);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Grade</Text>

      <View style={styles.handleRow}>
        <Pressable
          style={[styles.handleButton, activeHandle === "min" && styles.handleButtonActive]}
          onPress={() => setActiveHandle("min")}
        >
          <Text
            style={[
              styles.handleButtonText,
              activeHandle === "min" && styles.handleButtonTextActive,
            ]}
          >
            Min: {minValue}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.handleButton, activeHandle === "max" && styles.handleButtonActive]}
          onPress={() => setActiveHandle("max")}
        >
          <Text
            style={[
              styles.handleButtonText,
              activeHandle === "max" && styles.handleButtonTextActive,
            ]}
          >
            Max: {maxValue}
          </Text>
        </Pressable>
      </View>

      <View style={styles.gradeRow}>
        {GRADE_OPTIONS.map((grade, index) => {
          const isInRange = index >= minIndex && index <= maxIndex;
          const isEdge = grade === minValue || grade === maxValue;

          return (
            <Pressable
              key={grade}
              onPress={() => handleSelect(grade)}
              style={[
                styles.gradeChip,
                isInRange && styles.gradeChipInRange,
                isEdge && styles.gradeChipEdge,
              ]}
            >
              <Text style={[styles.gradeChipText, isInRange && styles.gradeChipTextInRange]}>
                {grade}
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
    marginBottom: 12,
  },
  handleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  handleButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7DDE8",
    backgroundColor: "#FFF",
    justifyContent: "center",
  },
  handleButtonActive: {
    borderColor: "#1F3B82",
    backgroundColor: "#EAF0FF",
  },
  handleButtonText: {
    color: "#5B6B8B",
    fontSize: 14,
    fontWeight: "500",
  },
  handleButtonTextActive: {
    color: "#1F3B82",
  },
  gradeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gradeChip: {
    minWidth: 42,
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7DDE8",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  gradeChipInRange: {
    backgroundColor: "#EAF0FF",
    borderColor: "#AFC4F1",
  },
  gradeChipEdge: {
    borderColor: "#1F3B82",
    borderWidth: 1.5,
  },
  gradeChipText: {
    fontSize: 14,
    color: "#5B6B8B",
    fontWeight: "500",
  },
  gradeChipTextInRange: {
    color: "#1F3B82",
  },
});
