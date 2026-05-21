import { File as ExpoFile } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { uploadActivityMedia } from "../api/activityMediaApi";
import {
  ActivityContent,
  createDefaultActivityTabs,
} from "../create_edit_page_components/ActivityContent";
import { CollapsibleSection } from "../create_edit_page_components/CollapsibleSection";
import {
  ACTIVITY_VIDEO_FORM_FIELD,
  formatMegabytes,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_MEDIA_FORMAT_LABEL,
  SUPPORTED_VIDEO_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES,
} from "../create_edit_page_components/mediaUploadConfig";
import {
  createDefaultOverviewState,
  OverviewSection,
} from "../create_edit_page_components/OverviewSection";
import { PublishPreviewModal } from "../create_edit_page_components/sub_components/PublishPreviewModal";
import { SEL_Opportunity } from "../create_edit_page_components/SEL_Opportunity";
import {
  type CropDraftImage,
  ImageCropModal,
} from "../create_edit_page_components/sub_components/ImageCropModal";
import {
  getVideoFrameImageName,
  VideoFramePickerModal,
  type VideoFrameSource,
} from "../create_edit_page_components/sub_components/VideoFramePickerModal";
import { showToast } from "../utils/showToast";

import type { ActivityTab } from "../create_edit_page_components/ActivityContent";
import type {
  OverviewFormState,
  ThumbnailVideoFile,
} from "../create_edit_page_components/OverviewSection";

const getImageDimensions = async (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });

const getVideoMetadataOnWeb = async (uri: string) =>
  new Promise<{ durationMs: number; width: number; height: number }>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Browser video metadata APIs are unavailable."));
      return;
    }

    const video = document.createElement("video");
    let hasSettled = false;

    const timeoutId = setTimeout(() => {
      finish(() => reject(new Error("Timed out while reading video metadata.")));
    }, 8000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeAttribute("src");
      video.load();
    };

    const finish = (callback: () => void) => {
      if (hasSettled) return;

      hasSettled = true;
      cleanup();
      callback();
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onerror = () =>
      finish(() => reject(new Error("Unable to read the selected video's metadata.")));
    video.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;

      if (!durationSeconds) {
        finish(() => reject(new Error("Selected video does not expose a readable duration.")));
        return;
      }

      finish(() =>
        resolve({
          durationMs: Math.round(durationSeconds * 1000),
          width: video.videoWidth,
          height: video.videoHeight,
        }),
      );
    };
    video.src = uri;
    video.load();
  });

const getExtension = (asset: ImagePicker.ImagePickerAsset) => {
  const sourceName = asset.fileName ?? asset.file?.name ?? asset.uri;
  const cleanSourceName = sourceName.split("?")[0]?.split("#")[0] ?? "";
  const extension = cleanSourceName.split(".").pop();

  return extension?.toLowerCase() ?? "";
};

const getAssetKind = (asset: ImagePicker.ImagePickerAsset): "image" | "video" | null => {
  const mimeType = asset.mimeType?.toLowerCase();
  const extension = getExtension(asset);

  if (
    asset.type === "image" ||
    mimeType?.startsWith("image/") ||
    SUPPORTED_IMAGE_EXTENSIONS.includes(extension)
  ) {
    return "image";
  }

  if (
    asset.type === "video" ||
    mimeType?.startsWith("video/") ||
    SUPPORTED_VIDEO_EXTENSIONS.includes(extension)
  ) {
    return "video";
  }

  return null;
};

const isSupportedAsset = (asset: ImagePicker.ImagePickerAsset, kind: "image" | "video") => {
  const mimeType = asset.mimeType?.toLowerCase();
  const extension = getExtension(asset);

  if (kind === "image") {
    return (
      (mimeType ? SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType) : false) ||
      SUPPORTED_IMAGE_EXTENSIONS.includes(extension)
    );
  }

  return (
    (mimeType ? SUPPORTED_VIDEO_MIME_TYPES.includes(mimeType) : false) ||
    SUPPORTED_VIDEO_EXTENSIONS.includes(extension)
  );
};

const getFallbackMimeType = (asset: ImagePicker.ImagePickerAsset, kind: "image" | "video") => {
  const extension = getExtension(asset);

  if (kind === "video") {
    if (extension === "mov") return "video/quicktime";
    if (extension === "m4v") return "video/x-m4v";
    return "video/mp4";
  }

  if (extension === "png") return "image/png";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
};

const getAssetSizeBytes = async (asset: ImagePicker.ImagePickerAsset) => {
  if (typeof asset.fileSize === "number") return asset.fileSize;
  if (typeof asset.file?.size === "number") return asset.file.size;

  if (typeof fetch === "function") {
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      return blob.size;
    } catch {
      // Fall back to Expo's file-system API for native file/content URIs.
    }
  }

  try {
    const file = new ExpoFile(asset.uri);
    const info = file.info();

    return info.exists && typeof info.size === "number" ? info.size : null;
  } catch {
    return null;
  }
};

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

type CreateActivityActionsProps = {
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

const CreateActivityActions: React.FC<CreateActivityActionsProps> = ({
  onCancel,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <View style={styles.footerActions}>
      <HeaderActionButton label="Cancel" onPress={onCancel} />
      <HeaderActionButton label="Save as Draft" onPress={onSaveDraft} />
      <HeaderActionButton label="Publish Activity" onPress={onPublish} variant="primary" />
    </View>
  );
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
  const [id, setId] = useState("");
  const [objective, setObjective] = useState("");
  const [activityTabs, setActivityTabs] = useState<ActivityTab[]>(() =>
    createDefaultActivityTabs(),
  );
  const [overviewValue, setOverviewValue] = useState<OverviewFormState>(() =>
    createDefaultOverviewState(),
  );
  const [selTags, setSelTags] = useState<string[]>([]);
  const [cropDraftImage, setCropDraftImage] = useState<CropDraftImage | null>(null);
  const [pendingVideo, setPendingVideo] = useState<VideoFrameSource | null>(null);
  const [status, setStatus] = useState<ActivityStatus>("idle");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    objective: null,
    setupInstructions: null,
    materials: null,
    playGuidedItems: [],
    debriefGuidedItems: [],
    selTags: null,
  });
  const [sectionErrors, setSectionErrors] = useState<
    Record<string, { title?: string | null; content?: string | null }>
  >({});
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
        !item.trim() ? "Please enter how to play instructions" : null,
      );
    }

    // Validate Debrief tab guided items
    const debriefTab = activityTabs.find((tab) => tab.kind === "debrief");
    if (debriefTab) {
      newErrors.debriefGuidedItems = debriefTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter a reflection question" : null,
      );
    }

    // Validate SEL tags
    if (selTags.length === 0) {
      newErrors.selTags = "Please enter at least one SEL tag";
    }

    // Validate additional sections (only validate sections added after the first one)
    const nextSectionErrors: Record<string, { title?: string | null; content?: string | null }> =
      {};
    activityTabs.forEach((tab) => {
      tab.sections.forEach((section, index) => {
        if (index === 0) return; // skip the default first section

        const errs: { title?: string | null; content?: string | null } = {};
        if (!section.title || !section.title.trim()) {
          errs.title = "Please enter a section title";
        }
        if (!section.content || !section.content.trim()) {
          errs.content = "Please enter section contents";
        }

        if (Object.keys(errs).length > 0) nextSectionErrors[section.id] = errs;
      });
    });

    setSectionErrors(nextSectionErrors);

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors =
      newErrors.objective !== null ||
      newErrors.setupInstructions !== null ||
      newErrors.materials !== null ||
      newErrors.playGuidedItems.some((e) => e !== null) ||
      newErrors.debriefGuidedItems.some((e) => e !== null) ||
      newErrors.selTags !== null ||
      Object.keys(nextSectionErrors).length > 0;

    return !hasErrors;
  };

  const handlePickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showToast(
        "error",
        "Allow media library access to choose a thumbnail image or activity video.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const assetKind = getAssetKind(asset);

    if (!assetKind || !isSupportedAsset(asset, assetKind)) {
      showToast("error", `Please choose one of these formats: ${SUPPORTED_MEDIA_FORMAT_LABEL}.`);
      return;
    }

    const sizeBytes = await getAssetSizeBytes(asset);

    if (sizeBytes === null) {
      showToast(
        "error",
        "Please choose a different file so the app can enforce the upload size limit.",
      );
      return;
    }

    const maxSizeBytes = assetKind === "image" ? MAX_IMAGE_UPLOAD_BYTES : MAX_VIDEO_UPLOAD_BYTES;

    if (sizeBytes > maxSizeBytes) {
      showToast(
        "error",
        `${assetKind === "image" ? "Images" : "Videos"} must be ${formatMegabytes(
          maxSizeBytes,
        )} or smaller.`,
      );
      return;
    }

    const fileName =
      asset.fileName ??
      asset.file?.name ??
      `thumbnail-${assetKind}.${assetKind === "image" ? "jpg" : "mp4"}`;
    const mimeType = asset.mimeType || asset.file?.type || getFallbackMimeType(asset, assetKind);

    if (assetKind === "video") {
      const webMetadata =
        !asset.duration || !asset.width || !asset.height
          ? await getVideoMetadataOnWeb(asset.uri).catch(() => null)
          : null;
      const durationMs = asset.duration ?? webMetadata?.durationMs;

      if (!durationMs) {
        showToast(
          "error",
          "Please choose a different video so the app can select a thumbnail frame.",
        );
        return;
      }

      setPendingVideo({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
        sizeBytes,
        width: asset.width || webMetadata?.width || 0,
        height: asset.height || webMetadata?.height || 0,
        durationMs,
      });
      return;
    }

    const dimensions =
      asset.width && asset.height
        ? { width: asset.width, height: asset.height }
        : await getImageDimensions(asset.uri);

    setCropDraftImage({
      uri: asset.uri,
      name: fileName,
      type: mimeType,
      width: dimensions.width,
      height: dimensions.height,
      sourceKind: "image",
      sourceName: fileName,
      sourceSizeBytes: sizeBytes,
    });
  };

  const handleCancel = () => {
    console.log("cancel");
  };

  const handleSaveDraft = async (options?: { showSuccessToast?: boolean }) => {
    try {
      const response_create = await fetch("http://localhost:4000/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: overviewValue.title,
          overview: overviewValue.overview,
          category: overviewValue.categories,
          gradeRange: {
            min: overviewValue.gradeMin === "K" ? "0" : overviewValue.gradeMin,
            max: overviewValue.gradeMax,
          },
          groupSize: {
            min: overviewValue.groupSizeMin,
            max: overviewValue.groupSizeMax,
            anySize: overviewValue.anyGroupSize,
          },
          duration: overviewValue.duration,
          energyLevel: overviewValue.energyLevel,

          objective,

          // TO CHANGE
          environment: overviewValue.environments, // check conflicting enum restrictions, backend allow different things we allow
          // backend allow:  "Large Open Space" | "Outdoor" | "Any" | "Small Space" | "Virtual";
          // we allow: Blacktop | Field | Classroom | Gym/MPR
          setup: overviewValue.setup === "Props" ? "Required" : "None", // only allow none or required?
          // backend allow: None | Required
          // frontend allow: Props | No Props
          facilitateSections: activityTabs
            .filter((tab) => tab.kind === "prep" || tab.kind === "play" || tab.kind === "debrief")
            .map((tab) => ({
              tabName: tab.kind === "prep" ? "Setup" : tab.name,
              content: tab.sections
                .map((section) => section.content.trim())
                .filter(Boolean)
                .join("\n\n"),
            })),
          materials:
            activityTabs.find((tab) => tab.kind === "prep")?.noMaterialsNeeded
              ? []
              : activityTabs.find((tab) => tab.kind === "prep")?.materials ?? [],
          selTags,
          // END TO CHANGE

          // facilitateSections: activityTabs.map((val) => ({
          //   tabName: val?.kind || "",
          //   content: val?.sections[0]?.content || "",
          // })),
          // materials: activityTabs.map((val) => val?.materials),
        }),
      });

      if (!response_create.ok) {
        const errorText = await response_create.text();
        throw new Error(
          errorText || `create activity failed with status ${response_create.status}`,
        );
      }

      const { _id } = (await response_create.json()) as { _id: string };
      if (_id) setId(_id);
      else throw new Error("creation failed, id fault");

      if (overviewValue.thumbnailImage?.uri) {
        await uploadActivityMedia({
          activityId: _id,
          media: {
            uri: overviewValue.thumbnailImage.uri,
            name: "thumbnail.jpg",
            type: "image/jpeg",
          },
          mediaTarget: "thumbnail",
          mediaType: "image",
          apiBaseUrl: "http://localhost:4000",
        });
      }

      setStatus("Draft");
      if (options?.showSuccessToast ?? true) {
        showToast("success", "Activity marked as draft.");
      }

      return _id;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "unknown error";
      showToast("error", msg);
      console.log(msg);

      return null;
    }
  };

  const handlePublish = async () => {
    try {
      const activityId = await handleSaveDraft({ showSuccessToast: false });

      if (!activityId) throw new Error("activity creation failed");

      const response_publish = await fetch(
        `http://localhost:4000/api/activities/${activityId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Published" }),
        },
      );

      if (!response_publish.ok) throw new Error("Publish failed");
      setStatus("Published");
      setIsPreviewVisible(false);
      showToast("success", "Activity marked as published.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "unkown error";
      console.log(msg);
      showToast("error", msg);
    }
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
        onSaveDraft={() => {
          void handleSaveDraft();
        }}
        onPublish={() => {
          setIsPreviewVisible(true);
        }}
      />

      <CollapsibleSection title="Overview" defaultOpen>
        <OverviewSection
          value={overviewValue}
          onChange={handleOverviewChange}
          onPickMedia={() => {
            void handlePickMedia();
          }}
        />
      </CollapsibleSection>

      <VideoFramePickerModal
        visible={!!pendingVideo && !cropDraftImage}
        video={pendingVideo}
        onCancel={() => setPendingVideo(null)}
        onSelectFrame={(frame) => {
          if (!pendingVideo) return;

          setCropDraftImage({
            uri: frame.uri,
            name: getVideoFrameImageName(pendingVideo.name, frame.timeMs),
            type: "image/jpeg",
            width: frame.width,
            height: frame.height,
            sourceKind: "video",
            sourceName: pendingVideo.name,
            sourceSizeBytes: pendingVideo.sizeBytes,
            sourceFrameTimeMs: frame.timeMs,
          });
        }}
      />

      <ImageCropModal
        visible={!!cropDraftImage}
        image={cropDraftImage}
        onCancel={() => {
          setCropDraftImage(null);
          setPendingVideo(null);
        }}
        onSave={(croppedImage) => {
          const nextVideo: ThumbnailVideoFile | null = pendingVideo
            ? {
                ...pendingVideo,
                fieldName: ACTIVITY_VIDEO_FORM_FIELD,
                selectedFrameTimeMs: cropDraftImage?.sourceFrameTimeMs ?? 0,
              }
            : null;

          setCropDraftImage(null);
          setPendingVideo(null);
          setOverviewValue((prev) => ({
            ...prev,
            thumbnailImage: croppedImage,
            thumbnailVideo: nextVideo,
            thumbnailMediaKind: nextVideo ? "video" : "image",
            thumbnailSourceName: cropDraftImage?.sourceName ?? croppedImage.name,
            thumbnailSourceSizeBytes: cropDraftImage?.sourceSizeBytes ?? null,
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
          sectionErrors={sectionErrors}
          forceOpenPrepTab={forceOpenPrepTab}
          onPrepTabOpened={() => setForceOpenPrepTab(false)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity" defaultOpen>
        <SEL_Opportunity tags={selTags} onTagsChange={setSelTags} error={errors.selTags} />
      </CollapsibleSection>

      <PublishPreviewModal
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        onSaveDraft={async () => {
          const savedId = await handleSaveDraft();
          if (savedId) {
            setIsPreviewVisible(false);
          }
        }}
        onPublish={() => {
          void handlePublish();
        }}
        overview={overviewValue}
        objective={objective}
        tabs={activityTabs}
        selTags={selTags}
      />

      <CreateActivityActions
        onCancel={handleCancel}
        onSaveDraft={() => {
          void handleSaveDraft();
        }}
        onPublish={() => {
          setIsPreviewVisible(true);
        }}
      />

      <Text style={styles.debugText}>Objective: {objective}</Text>
      <Text style={styles.debugText}>Status: {status}</Text>
      <Text style={styles.debugText}>Activity tabs: {JSON.stringify(activityTabs)}</Text>
      <Text style={styles.debugText}>Parent SEL tags: {JSON.stringify(selTags)}</Text>
      <Text style={styles.debugText}>
        Thumbnail source:{" "}
        {overviewValue.thumbnailMediaKind
          ? `${overviewValue.thumbnailMediaKind} - ${overviewValue.thumbnailSourceName}`
          : "No media selected"}
      </Text>
      <Text style={styles.debugText}>
        Thumbnail local preview URI: {overviewValue.thumbnailImage?.uri ?? "No image selected"}
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
      <Text style={styles.debugText}>
        Activity video upload part:{" "}
        {overviewValue.thumbnailVideo
          ? JSON.stringify({
              fieldName: overviewValue.thumbnailVideo.fieldName,
              file: {
                uri: overviewValue.thumbnailVideo.uri,
                name: overviewValue.thumbnailVideo.name,
                type: overviewValue.thumbnailVideo.type,
              },
              selectedFrameTimeMs: overviewValue.thumbnailVideo.selectedFrameTimeMs,
            })
          : "No video selected"}
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
    fontSize: 36,
    fontWeight: "700",
    color: "#153A7A",
    fontFamily: "League Spartan",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  footerActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
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
