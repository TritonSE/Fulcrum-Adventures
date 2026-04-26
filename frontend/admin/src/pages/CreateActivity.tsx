import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import {
  ActivityContent,
  createDefaultActivityTabs,
} from "../create_edit_page_components/ActivityContent";
import { CollapsibleSection } from "../create_edit_page_components/CollapsibleSection";
import {
  createDefaultOverviewState,
  OverviewSection,
} from "../create_edit_page_components/OverviewSection";
import { SEL_Opportunity } from "../create_edit_page_components/SEL_Opportunity";

import type { ActivityTab } from "../create_edit_page_components/ActivityContent";
import type { OverviewFormState } from "../create_edit_page_components/OverviewSection";

export const CreateActivity: React.FC = () => {
  const [objective, setObjective] = useState("");
  const [activityTabs, setActivityTabs] = useState<ActivityTab[]>(createDefaultActivityTabs());

  const [overviewValue, setOverviewValue] = useState<OverviewFormState>(
    createDefaultOverviewState(),
  );

  const [selTags, setSelTags] = useState<string[]>([]);

  const handleOverviewChange = (patch: Partial<OverviewFormState>) => {
    setOverviewValue((prev) => ({ ...prev, ...patch }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Activity</Text>

      <CollapsibleSection title="Overview" defaultOpen>
        <OverviewSection
          value={overviewValue}
          onChange={handleOverviewChange}
          onPickVideo={() => {
            setOverviewValue((prev) => ({
              ...prev,
              thumbnailVideoName: "selected-video.mp4",
              thumbnailImageName: null,
            }));
          }}
          onPickImage={() => {
            setOverviewValue((prev) => ({
              ...prev,
              thumbnailImageName: "selected-image.png",
              thumbnailVideoName: null,
            }));
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Activity Content" defaultOpen>
        <ActivityContent
          objective={objective}
          setObjective={setObjective}
          tabs={activityTabs}
          setTabs={setActivityTabs}
        />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity" defaultOpen>
        <SEL_Opportunity tags={selTags} onTagsChange={setSelTags} />
      </CollapsibleSection>

      <Text style={styles.debugText}>Objective: {objective}</Text>
      <Text style={styles.debugText}>Activity tabs: {JSON.stringify(activityTabs)}</Text>
      <Text style={styles.debugText}>Parent SEL tags: {JSON.stringify(selTags)}</Text>
      <Text style={styles.debugText}>Overview state: {JSON.stringify(overviewValue)}</Text>
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
  debugText: {
    fontSize: 14,
    color: "#6C6C6C",
  },
});
