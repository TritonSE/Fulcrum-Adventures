import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
import {
  type CropDraftImage,
  ImageCropModal,
} from "../create_edit_page_components/sub_components/ImageCropModal";

import type { ActivityTab } from "../create_edit_page_components/ActivityContent";
import type { OverviewFormState } from "../create_edit_page_components/OverviewSection";

const getImageDimensions = async (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });

type ActivityStatus = "idle" | "Draft" | "Published" | "Archived";

type FormErrors = {
  objective: string | null;
  setupInstructions: string | null;
  materials: string | null;
  playGuidedItems: (string | null)[];
  debriefGuidedItems: (string | null)[];
  selTags: string | null;
};

type HeaderActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "secondary" | "primary";
};

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  label,
  onPress,
  variant = "secondary",
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.headerButton,
        isPrimary ? styles.headerButtonPrimary : styles.headerButtonSecondary,
      ]}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.headerButtonText,
          isPrimary ? styles.headerButtonTextPrimary : styles.headerButtonTextSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

type CreateActivityHeaderProps = {
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

const CreateActivityHeader: React.FC<CreateActivityHeaderProps> = ({
  onCancel,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.pageTitle}>Create New Activity</Text>
      </View>

      <View style={styles.headerActions}>
        <HeaderActionButton label="Cancel" onPress={onCancel} />
        <HeaderActionButton label="Save as Draft" onPress={onSaveDraft} />
        <HeaderActionButton label="Publish Activity" onPress={onPublish} variant="primary" />
      </View>
    </View>
  );
};

export const CreateActivity: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [objective, setObjective] = useState("");
  const [activityTabs, setActivityTabs] = useState<ActivityTab[]>(() =>
    createDefaultActivityTabs(),
  );
  const [overviewValue, setOverviewValue] = useState<OverviewFormState>(() =>
    createDefaultOverviewState(),
  );
  const [selTags, setSelTags] = useState<string[]>([]);
  const [cropDraftImage, setCropDraftImage] = useState<CropDraftImage | null>(null);
  const [status, setStatus] = useState<ActivityStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({
    objective: null,
    setupInstructions: null,
    materials: null,
    playGuidedItems: [],
    debriefGuidedItems: [],
    selTags: null,
  });
  const [forceOpenPrepTab, setForceOpenPrepTab] = useState(false);

  const handleOverviewChange = (patch: Partial<OverviewFormState>) => {
    setOverviewValue((prev) => ({ ...prev, ...patch }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      objective: null,
      setupInstructions: null,
      materials: null,
      playGuidedItems: [],
      debriefGuidedItems: [],
      selTags: null,
    };

    // Validate objective
    if (!objective.trim()) {
      newErrors.objective = "Please enter an activity objective";
    }

    // Validate setup instructions (Prep tab)
    const prepTab = activityTabs.find((tab) => tab.kind === "prep");
    if (prepTab) {
      const setupSection = prepTab.sections[0];
      if (!setupSection?.content.trim()) {
        newErrors.setupInstructions = "Please enter set-up instructions";
      }
    }

    // Validate materials (Prep tab)
    if (prepTab) {
      if (!prepTab.noMaterialsNeeded && prepTab.materials.length === 0) {
        newErrors.materials = "Please enter items or select no materials";
      }
    }

    // Validate Play tab guided items
    const playTab = activityTabs.find((tab) => tab.kind === "play");
    if (playTab) {
      newErrors.playGuidedItems = playTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter how to play instructions" : null
      );
    }

    // Validate Debrief tab guided items
    const debriefTab = activityTabs.find((tab) => tab.kind === "debrief");
    if (debriefTab) {
      newErrors.debriefGuidedItems = debriefTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter a reflection question" : null
      );
    }

    // Validate SEL tags
    if (selTags.length === 0) {
      newErrors.selTags = "Please enter at least one SEL tag";
    }

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors =
      newErrors.objective !== null ||
      newErrors.setupInstructions !== null ||
      newErrors.materials !== null ||
      newErrors.playGuidedItems.some((e) => e !== null) ||
      newErrors.debriefGuidedItems.some((e) => e !== null) ||
      newErrors.selTags !== null;

    return !hasErrors;
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Photo access required",
        "Allow photo library access to choose a thumbnail image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const dimensions =
      asset.width && asset.height
        ? { width: asset.width, height: asset.height }
        : await getImageDimensions(asset.uri);

    setCropDraftImage({
      uri: asset.uri,
      name: asset.fileName ?? "thumbnail-image.jpg",
      type: asset.mimeType ?? "image/jpeg",
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  const handleCancel = () => {
    console.log("cancel");
  };

  const handleSaveDraft = () => {
    setStatus("Draft");
  };

  const handlePublish = () => {
    if (!validateForm()) {
      // Scroll to first error
      scrollToFirstError();
      return;
    }
    setStatus("Published");
  };

  const scrollToFirstError = () => {
    // Priority order: objective -> setup -> materials -> play -> debrief -> selTags
    if (errors.objective) {
      scrollViewRef.current?.scrollTo({ y: 150, animated: true });
    } else if (errors.setupInstructions || errors.materials) {
      setForceOpenPrepTab(true);
      scrollViewRef.current?.scrollTo({ y: 350, animated: true });
    } else if (errors.playGuidedItems.some((e) => e !== null)) {
      const playTab = activityTabs.find((tab) => tab.kind === "play");
      if (playTab) {
        // Open Play tab and scroll
        // We'll pass this through to ActivityContent
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      }
    } else if (errors.debriefGuidedItems.some((e) => e !== null)) {
      const debriefTab = activityTabs.find((tab) => tab.kind === "debrief");
      if (debriefTab) {
        // Open Debrief tab and scroll
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      }
    } else if (errors.selTags) {
      scrollViewRef.current?.scrollTo({ y: 600, animated: true });
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <CreateActivityHeader
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <CollapsibleSection title="Overview" defaultOpen>
        <OverviewSection
          value={overviewValue}
          onChange={handleOverviewChange}
          onPickVideo={() => {
            setOverviewValue((prev) => ({
              ...prev,
              thumbnailVideoName: "selected-video.mp4",
              thumbnailImage: null,
            }));
          }}
          onPickImage={() => {
            void handlePickImage();
          }}
        />
      </CollapsibleSection>

      <ImageCropModal
        visible={!!cropDraftImage}
        image={cropDraftImage}
        onCancel={() => setCropDraftImage(null)}
        onSave={(croppedImage) => {
          setCropDraftImage(null);
          setOverviewValue((prev) => ({
            ...prev,
            thumbnailImage: croppedImage,
            thumbnailVideoName: null,
          }));
        }}
      />

      <CollapsibleSection title="Activity Content" defaultOpen>
        <ActivityContent
          objective={objective}
          setObjective={setObjective}
          tabs={activityTabs}
          setTabs={setActivityTabs}
          objectiveError={errors.objective}
          setupError={errors.setupInstructions}
          materialsError={errors.materials}
          playGuidedItemErrors={errors.playGuidedItems}
          debriefGuidedItemErrors={errors.debriefGuidedItems}
          forceOpenPrepTab={forceOpenPrepTab}
          onPrepTabOpened={() => setForceOpenPrepTab(false)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity" defaultOpen>
        <SEL_Opportunity 
          tags={selTags} 
          onTagsChange={setSelTags}
          error={errors.selTags}
        />
      </CollapsibleSection>

      <Text style={styles.debugText}>Objective: {objective}</Text>
      <Text style={styles.debugText}>Status: {status}</Text>
      <Text style={styles.debugText}>Activity tabs: {JSON.stringify(activityTabs)}</Text>
      <Text style={styles.debugText}>Parent SEL tags: {JSON.stringify(selTags)}</Text>
      <Text style={styles.debugText}>
        Thumbnail image URL: {overviewValue.thumbnailImage?.uri ?? "No image selected"}
      </Text>
      <Text style={styles.debugText}>
        Thumbnail image upload part:{" "}
        {overviewValue.thumbnailImage
          ? JSON.stringify({
              fieldName: overviewValue.thumbnailImage.fieldName,
              file: {
                uri: overviewValue.thumbnailImage.uri,
                name: overviewValue.thumbnailImage.name,
                type: overviewValue.thumbnailImage.type,
              },
            })
          : "No image selected"}
      </Text>
      <Text style={styles.debugText}>Overview state: {JSON.stringify(overviewValue)}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  container: {
    padding: 40,
    gap: 40,
    width: "100%",
  },

  pageHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F3B82",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },

  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  headerButtonSecondary: {
    borderWidth: 1,
    borderColor: "#1A2B5D",
    backgroundColor: "#FFFFFF",
  },

  headerButtonPrimary: {
    backgroundColor: "#1A2B5D",
  },

  headerButtonText: {
    fontWeight: "600",
  },

  headerButtonTextSecondary: {
    color: "#1A2B5D",
  },

  headerButtonTextPrimary: {
    color: "#FFFFFF",
  },

  debugText: {
    fontSize: 14,
    color: "#6C6C6C",
  },
});
