import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  View,
  Platform,
  UIManager,
} from "react-native";

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFF",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  header: {
    width: "100%",
    paddingVertical: 24,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F3B82",
  },
  arrow: {
    fontSize: 16,
    color: "#1F3B82",
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    width: "100%",
  },
});

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleSectionProps = {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
};

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    // This adds a smooth transition when the content appears/disappears
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleOpen} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={[styles.arrow, { transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }]}>
          ▼
        </Text>
      </TouchableOpacity>

      {isOpen && <View style={styles.content}>{children ?? <Text>Placeholder content</Text>}</View>}
    </View>
  );
};
