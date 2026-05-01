import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
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

  const handleOverviewChange = (patch: Partial<OverviewFormState>) => {
    setOverviewValue((prev) => ({ ...prev, ...patch }));
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
    setStatus("Published");
  };

  return (
    <ScrollView
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
        />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity" defaultOpen>
        <SEL_Opportunity tags={selTags} onTagsChange={setSelTags} />
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
