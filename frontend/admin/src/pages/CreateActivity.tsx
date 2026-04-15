import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { ActivityContent } from "../create_edit_page_components/ActivityContent";
import { CollapsibleSection } from "../create_edit_page_components/CollapsibleSection";
import { OverviewSection } from "../create_edit_page_components/OverviewSection";

export const CreateActivity: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Activity</Text>

      <CollapsibleSection title="Overview" defaultOpen>
        <OverviewSection />
      </CollapsibleSection>

      <CollapsibleSection title="Activity Content">
        <ActivityContent />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity">
        <Text>SEL Opportunity placeholder content</Text>
      </CollapsibleSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 40,
    alignSelf: "stretch",
    width: "100%",
    backgroundColor: "#F7F7F7",
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F3B82",
  },
});
