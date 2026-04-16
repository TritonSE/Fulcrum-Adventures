import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type ActivitySection = {
  id: string;
  title: string;
  content: string;
};

type TabKind = "prep" | "play" | "debrief" | "custom";

type ActivityTab = {
  id: string;
  name: string;
  kind: TabKind;
  sections: ActivitySection[];
  guidedItems: string[];
  materials: string[];
  noMaterialsNeeded: boolean;
};

const MAX_SECTIONS = 6;
const MAX_SECTION_TITLE_LENGTH = 30;

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

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createSection = (title = ""): ActivitySection => ({
  id: createId(),
  title,
  content: "",
});

const getMinimumGuidedItems = (kind: TabKind): number => {
  if (kind === "play") {
    return 2;
  }

  if (kind === "debrief") {
    return 1;
  }

  return 0;
};

const getDefaultSectionByKind = (kind: TabKind, sectionNumber: number): ActivitySection => {
  if (kind === "prep") {
    return createSection(sectionNumber === 1 ? "Set-Up" : "");
  }

  if (kind === "play") {
    return createSection(sectionNumber === 1 ? "How to Play" : "");
  }

  if (kind === "debrief") {
    return createSection(sectionNumber === 1 ? "Reflection Questions" : "");
  }

  return createSection(sectionNumber === 1 ? "Section" : "");
};

const createDefaultTab = (name: string, kind: TabKind): ActivityTab => ({
  id: createId(),
  name,
  kind,
  sections: [getDefaultSectionByKind(kind, 1)],
  guidedItems: kind === "play" ? ["", ""] : kind === "debrief" ? [""] : [],
  materials: [],
  noMaterialsNeeded: false,
});

export const ActivityContent: React.FC = () => {
  const [objective, setObjective] = useState("");
  const [tabs, setTabs] = useState<ActivityTab[]>([
    createDefaultTab("Prep", "prep"),
    createDefaultTab("Play", "play"),
    createDefaultTab("Debrief", "debrief"),
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [materialInput, setMaterialInput] = useState("");

  const resolvedActiveTabId = useMemo(() => {
    if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
      return activeTabId;
    }

    return tabs[0]?.id ?? null;
  }, [activeTabId, tabs]);

  const activeTab = tabs.find((tab) => tab.id === resolvedActiveTabId) ?? null;

  const updateActiveTab = (updater: (tab: ActivityTab) => ActivityTab) => {
    if (!resolvedActiveTabId) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === resolvedActiveTabId ? updater(tab) : tab)),
    );
  };

  const handleCreateTab = () => {
    setTabs((prevTabs) => {
      const nextTab = createDefaultTab(`Tab ${prevTabs.length + 1}`, "custom");
      setActiveTabId(nextTab.id);
      return [...prevTabs, nextTab];
    });
  };

  const handleAddSection = () => {
    if (!activeTab || activeTab.sections.length >= MAX_SECTIONS) return;

    updateActiveTab((tab) => ({
      ...tab,
      sections: [...tab.sections, getDefaultSectionByKind(tab.kind, tab.sections.length + 1)],
    }));
  };

  const handleUpdateGuidedItem = (index: number, value: string) => {
    updateActiveTab((tab) => ({
      ...tab,
      guidedItems: tab.guidedItems.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const handleAddGuidedItem = () => {
    updateActiveTab((tab) => ({
      ...tab,
      guidedItems: [...tab.guidedItems, ""],
    }));
  };

  const handleRemoveGuidedItem = (index: number) => {
    updateActiveTab((tab) => {
      const minimumItems = getMinimumGuidedItems(tab.kind);
      if (tab.guidedItems.length <= minimumItems || index < minimumItems) {
        return tab;
      }

      return {
        ...tab,
        guidedItems: tab.guidedItems.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleUpdateSection = (
    sectionId: string,
    updater: (section: ActivitySection) => ActivitySection,
  ) => {
    updateActiveTab((tab) => ({
      ...tab,
      sections: tab.sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    updateActiveTab((tab) => {
      if (tab.sections.length <= 1) {
        return tab;
      }

      return {
        ...tab,
        sections: tab.sections.filter((section) => section.id !== sectionId),
      };
    });
  };

  const handleAddMaterial = () => {
    const nextMaterial = materialInput.trim();
    if (!nextMaterial || !activeTab) return;

    updateActiveTab((tab) => {
      if (tab.materials.some((item) => item.toLowerCase() === nextMaterial.toLowerCase())) {
        return tab;
      }

      return {
        ...tab,
        materials: [...tab.materials, nextMaterial],
        noMaterialsNeeded: false,
      };
    });

    setMaterialInput("");
  };

  const handleRemoveMaterial = (material: string) => {
    updateActiveTab((tab) => ({
      ...tab,
      materials: tab.materials.filter((item) => item !== material),
    }));
  };

  const handleToggleNoMaterialsNeeded = () => {
    updateActiveTab((tab) => ({
      ...tab,
      noMaterialsNeeded: !tab.noMaterialsNeeded,
    }));
  };

  const isAddSectionDisabled = !activeTab || activeTab.sections.length >= MAX_SECTIONS;
  const defaultSection = activeTab?.sections[0] ?? null;
  const additionalSections = activeTab?.sections.slice(1) ?? [];
  const isPrepTab = activeTab?.kind === "prep";
  const isPlayTab = activeTab?.kind === "play";
  const isDebriefTab = activeTab?.kind === "debrief";
  const minimumGuidedItems = activeTab ? getMinimumGuidedItems(activeTab.kind) : 0;
  const canRemoveGuidedItem = (index: number) => index >= minimumGuidedItems;

  return (
    <View style={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Objective</Text>
        <TextInput
          value={objective}
          onChangeText={setObjective}
          placeholder="Enter activity objective"
          placeholderTextColor="#A6A6A6"
          maxLength={150}
          style={styles.input}
        />
        <Text style={styles.characterCount}>{objective.length}/150 characters</Text>
      </View>

      <View style={styles.facilitateHeader}>
        <Text style={styles.label}>Facilitate</Text>
        <TouchableOpacity
          style={styles.createTabButton}
          onPress={handleCreateTab}
          activeOpacity={0.8}
        >
          <Text style={styles.createTabButtonText}>+ Create New Tab</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = tab.id === resolvedActiveTabId;

          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTabId(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab && (
        <View style={styles.detailsContainer}>
          {defaultSection && isPrepTab && (
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>{defaultSection.title || "Set-Up"}</Text>
              <TextInput
                value={defaultSection.content}
                onChangeText={(value) => {
                  handleUpdateSection(defaultSection.id, (existingSection) => ({
                    ...existingSection,
                    content: value,
                  }));
                }}
                placeholder="Describe how to set up the space.."
                placeholderTextColor="#B3B3B3"
                multiline
                numberOfLines={3}
                style={styles.defaultSectionInput}
              />
            </View>
          )}

          {defaultSection && (isPlayTab || isDebriefTab) && (
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>{defaultSection.title}</Text>

              {activeTab.guidedItems.map((item, index) => {
                const isRemovable = canRemoveGuidedItem(index);

                return (
                  <View key={`${defaultSection.id}-${index}`} style={styles.guidedItemGroup}>
                    <Text style={styles.guidedItemLabel}>
                      {isPlayTab ? `Step ${index + 1}` : `Q${index + 1}`}
                    </Text>
                    <View style={styles.guidedItemInputRow}>
                      <TextInput
                        value={item}
                        onChangeText={(value) => handleUpdateGuidedItem(index, value)}
                        placeholder={
                          isPlayTab
                            ? "Enter instructions here.."
                            : "Enter reflection or prompt here.."
                        }
                        placeholderTextColor="#B4B4B4"
                        style={styles.guidedItemInput}
                      />
                      {isRemovable ? (
                        <Pressable
                          onPress={() => handleRemoveGuidedItem(index)}
                          style={styles.removeGuidedItemButton}
                        >
                          <Text style={styles.removeGuidedItemIcon}>-</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.removeGuidedItemSpacer} />
                      )}
                    </View>
                  </View>
                );
              })}

              <View style={styles.guidedActionWrap}>
                <TouchableOpacity
                  style={styles.guidedActionButton}
                  onPress={handleAddGuidedItem}
                  activeOpacity={0.8}
                >
                  <Text style={styles.guidedActionButtonText}>
                    {isPlayTab ? "+ Add Step" : "+ Add Question"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isPrepTab && (
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Materials</Text>

              {activeTab.materials.length > 0 && (
                <View style={styles.materialList}>
                  {activeTab.materials.map((material) => (
                    <View key={material} style={styles.materialRow}>
                      <View style={styles.materialValueBox}>
                        <Text style={styles.materialValueText}>{material}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleRemoveMaterial(material)}
                        style={styles.removeMaterialButton}
                      >
                        <Text style={styles.removeMaterialIcon}>-</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.materialInputRow}>
                <TextInput
                  value={materialInput}
                  onChangeText={setMaterialInput}
                  placeholder="Add new material item..."
                  placeholderTextColor="#A6A6A6"
                  style={styles.materialInput}
                  editable={!activeTab.noMaterialsNeeded}
                  onSubmitEditing={handleAddMaterial}
                />

                <TouchableOpacity
                  style={styles.addMaterialButton}
                  onPress={handleAddMaterial}
                  activeOpacity={0.8}
                  disabled={activeTab.noMaterialsNeeded}
                >
                  <Text style={styles.addMaterialButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <Pressable style={styles.checkboxRow} onPress={handleToggleNoMaterialsNeeded}>
                <View
                  style={[styles.checkbox, activeTab.noMaterialsNeeded && styles.checkboxChecked]}
                >
                  {activeTab.noMaterialsNeeded && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>No materials needed</Text>
              </Pressable>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.addSectionButton,
              isAddSectionDisabled && styles.addSectionButtonDisabled,
            ]}
            onPress={handleAddSection}
            activeOpacity={0.8}
            disabled={isAddSectionDisabled}
          >
            <Text style={styles.addSectionButtonText}>+ Add Section</Text>
          </TouchableOpacity>

          {additionalSections.map((section) => (
            <View style={styles.sectionCard} key={section.id}>
              <View style={styles.sectionCardHeader}>
                <TouchableOpacity
                  onPress={() => handleDeleteSection(section.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteSectionText}>Delete Section</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={section.title}
                onChangeText={(value) => {
                  handleUpdateSection(section.id, (existingSection) => ({
                    ...existingSection,
                    title: value,
                  }));
                }}
                placeholder="Section Title"
                placeholderTextColor="#B3B3B3"
                maxLength={MAX_SECTION_TITLE_LENGTH}
                style={styles.sectionTitleInput}
              />

              <Text style={styles.sectionCharacterCount}>
                {section.title.length}/{MAX_SECTION_TITLE_LENGTH} characters
              </Text>

              <TextInput
                value={section.content}
                onChangeText={(value) => {
                  handleUpdateSection(section.id, (existingSection) => ({
                    ...existingSection,
                    content: value,
                  }));
                }}
                placeholder="Enter section contents.."
                placeholderTextColor="#B3B3B3"
                multiline
                numberOfLines={7}
                style={styles.sectionContentInput}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 28,
  },
  label: {
    fontSize: 22,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    ...baseInputSurface,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  characterCount: {
    marginTop: 8,
    color: "#999",
    fontSize: 13,
  },
  facilitateHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  createTabButton: {
    borderWidth: 1,
    borderColor: "#1F4AA5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  createTabButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "500",
  },
  tabContainer: {
    width: "100%",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 8,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#153A7A",
    fontWeight: "500",
  },
  detailsContainer: {
    width: "100%",
    marginTop: 28,
  },
  sectionCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 24,
    backgroundColor: "#FFF",
    marginBottom: 24,
  },
  sectionCardHeader: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  deleteSectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#153A7A",
  },
  sectionTitleInput: {
    width: "100%",
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...baseInputSurface,
    fontSize: 18,
    fontWeight: "700",
    color: "#3B3B3B",
  },
  sectionCharacterCount: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 13,
    color: "#9E9E9E",
  },
  sectionContentInput: {
    width: "100%",
    minHeight: 160,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...baseInputSurface,
    fontSize: 14,
    color: "#343434",
    textAlignVertical: "top",
  },
  defaultSectionInput: {
    width: "100%",
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    ...baseInputSurface,
    fontSize: 14,
    color: "#343434",
    textAlignVertical: "top",
  },
  guidedItemGroup: {
    marginBottom: 16,
  },
  guidedItemLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 10,
  },
  guidedItemInputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guidedItemInput: {
    flex: 1,
    height: 58,
    borderRadius: 10,
    ...baseInputSurface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#343434",
  },
  removeGuidedItemButton: {
    ...baseRemoveButton,
  },
  removeGuidedItemSpacer: {
    ...baseRemoveButton,
  },
  removeGuidedItemIcon: {
    ...baseRemoveIcon,
  },
  guidedActionWrap: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 4,
  },
  guidedActionButton: {
    borderWidth: 1,
    borderColor: "#1F4AA5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
  },
  guidedActionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#153A7A",
  },
  materialInputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  materialInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    ...baseInputSurface,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  addMaterialButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F4AA5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  addMaterialButtonText: {
    color: "#153A7A",
    fontSize: 24,
    lineHeight: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C9CDD4",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#153A7A",
    borderColor: "#153A7A",
  },
  checkboxMark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxText: {
    color: "#153A7A",
    fontSize: 16,
  },
  materialList: {
    marginTop: 12,
    marginBottom: 12,
    gap: 12,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  materialValueBox: {
    flex: 1,
    ...baseInputSurface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  materialValueText: {
    color: "#153A7A",
    fontSize: 14,
  },
  removeMaterialButton: {
    ...baseRemoveButton,
  },
  removeMaterialIcon: {
    ...baseRemoveIcon,
  },
  addSectionButton: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginTop: 8,
  },
  addSectionButtonDisabled: {
    opacity: 0.45,
  },
  addSectionButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "500",
  },
});
