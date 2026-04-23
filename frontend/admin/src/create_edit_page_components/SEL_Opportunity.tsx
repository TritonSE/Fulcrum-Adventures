import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const MAX_TAG_LENGTH = 30;

const baseInputSurface = {
  borderWidth: 1,
  borderColor: "#D6D6D6",
  backgroundColor: "#FFF",
};

const baseRemoveButton = {
  width: 40,
  height: 40,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const baseRemoveIcon = {
  color: "#153A7A",
  fontSize: 28,
  lineHeight: 28,
};

type SELOpportunityProps = {
  tags: string[];
  onTagsChange: (nextTags: string[]) => void;
};

export const SEL_Opportunity: React.FC<SELOpportunityProps> = ({ tags, onTagsChange }) => {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;

    if (tags.some((item) => item.toLowerCase() === nextTag.toLowerCase())) {
      return;
    }

    onTagsChange([...tags, nextTag]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((item) => item !== tag));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Social and Emotional Learning Tags</Text>

      {tags.length > 0 && (
        <View style={styles.tagList}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tagRow}>
              <View style={styles.tagValueBox}>
                <Text style={styles.tagValueText}>{tag}</Text>
              </View>

              <Pressable onPress={() => handleRemoveTag(tag)} style={styles.removeTagButton}>
                <Text style={styles.removeTagIcon}>-</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Add SEL Tag.."
          placeholderTextColor="#B4B4B4"
          style={styles.input}
          maxLength={MAX_TAG_LENGTH}
          onSubmitEditing={handleAddTag}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddTag} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.characterCount}>{tagInput.length}/30 characters</Text>
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
  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    ...baseInputSurface,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F4AA5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  addButtonText: {
    color: "#1F3B82",
    fontSize: 24,
    lineHeight: 24,
  },
  characterCount: {
    marginTop: 8,
    color: "#999",
    fontSize: 13,
  },
  tagList: {
    marginTop: 4,
    marginBottom: 12,
    gap: 12,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagValueBox: {
    flex: 1,
    ...baseInputSurface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tagValueText: {
    color: "#1F3B82",
    fontSize: 14,
  },
  removeTagButton: {
    ...baseRemoveButton,
  },
  removeTagIcon: {
    ...baseRemoveIcon,
  },
});
