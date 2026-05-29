import { File as ExpoFile } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  ACTIVITY_API_BASE_URL,
  createActivity,
  getActivityId,
  updateActivityStatus,
} from "../api/activityApi";
import { uploadActivityMediaSelection } from "../api/activityMediaApi";
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
import { SEL_Opportunity } from "../create_edit_page_components/SEL_Opportunity";
import {
  type CropDraftImage,
  ImageCropModal,
} from "../create_edit_page_components/sub_components/ImageCropModal";
import { PublishPreviewModal } from "../create_edit_page_components/sub_components/PublishPreviewModal";
import {
  getVideoFrameImageName,
  VideoFramePickerModal,
  type VideoFrameSource,
} from "../create_edit_page_components/sub_components/VideoFramePickerModal";
import { showToast } from "../utils/showToast";

import type {
  ActivityStatus as ApiActivityStatus,
  CreateActivityPayload,
} from "../api/activityApi";
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

type SubmissionStatus = "idle" | ApiActivityStatus;

type FormErrors = {
  objective: string | null;
  setupInstructions: string | null;
  materials: string | null;
  playGuidedItems: (string | null)[];
  debriefGuidedItems: (string | null)[];
  selTags: string | null;
};

const toGradeNumber = (value: string) => (value === "K" ? 0 : Number(value));

const toPositiveInteger = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const getPrepTab = (activityTabs: ActivityTab[]) =>
  activityTabs.find((tab) => tab.kind === "prep") ?? null;

const getActivityTabsWithPendingMaterial = (
  activityTabs: ActivityTab[],
  pendingMaterialInput: string,
) => {
  const nextMaterial = pendingMaterialInput.trim();
  if (!nextMaterial) return activityTabs;

  return activityTabs.map((tab) => {
    if (tab.kind !== "prep" || tab.noMaterialsNeeded) return tab;

    if (tab.materials.some((item) => item.toLowerCase() === nextMaterial.toLowerCase())) {
      return tab;
    }

    return {
      ...tab,
      materials: [...tab.materials, nextMaterial],
      noMaterialsNeeded: false,
    };
  });
};

const getGuidedItemLabel = (tab: ActivityTab, index: number) => {
  if (tab.kind === "play") return `Step ${index + 1}`;
  if (tab.kind === "debrief") return `Q${index + 1}`;
  return `Item ${index + 1}`;
};

const buildFacilitateSections = (activityTabs: ActivityTab[]) =>
  activityTabs
    .map((tab) => {
      const sectionLines = tab.sections
        .map((section) => {
          const content = section.content.trim();
          if (!content) return null;

          const title = section.title.trim() || tab.name;
          return `${title}\n${content}`;
        })
        .filter((line): line is string => Boolean(line));

      const guidedLines = tab.guidedItems
        .map((item, index) => {
          const content = item.trim();
          return content ? `${getGuidedItemLabel(tab, index)}: ${content}` : null;
        })
        .filter((line): line is string => Boolean(line));

      return {
        tabName: tab.name,
        content: [...sectionLines, ...guidedLines].join("\n\n"),
      };
    })
    .filter((section) => section.content.length > 0);

const buildActivityPayload = ({
  overviewValue,
  objective,
  activityTabs,
  selTags,
  status,
}: {
  overviewValue: OverviewFormState;
  objective: string;
  activityTabs: ActivityTab[];
  selTags: string[];
  status: ApiActivityStatus;
}): CreateActivityPayload => {
  const prepTab = getPrepTab(activityTabs);
  const environment = overviewValue.anyEnvironment
    ? ["Any"]
    : overviewValue.environments;
  const groupSizeMin = overviewValue.anyGroupSize
    ? 0
    : toPositiveInteger(overviewValue.groupSizeMin);
  const groupSizeMax = overviewValue.anyGroupSize
    ? 0
    : toPositiveInteger(overviewValue.groupSizeMax);
  const videoUrl = overviewValue.videoUrl.trim();

  const payload: CreateActivityPayload = {
    title: overviewValue.title.trim(),
    overview: overviewValue.overview.trim(),
    category: overviewValue.categories,
    gradeRange: {
      min: toGradeNumber(overviewValue.gradeMin),
      max: toGradeNumber(overviewValue.gradeMax),
    },
    groupSize: {
      min: groupSizeMin,
      max: groupSizeMax,
      anySize: overviewValue.anyGroupSize,
    },
    duration: overviewValue.duration ?? "",
    energyLevel: overviewValue.energyLevel ?? "",
    environment,
    setup: overviewValue.setup === "Props" ? "Required" : "None",
    objective: objective.trim(),
    facilitateSections: buildFacilitateSections(activityTabs),
    materials: prepTab?.noMaterialsNeeded ? [] : (prepTab?.materials ?? []),
    selTags,
    status,
  };

  if (videoUrl) {
    payload.videoUrl = videoUrl;
  }

  return payload;
};

const getSubmissionValidationMessage = ({
  overviewValue,
  objective,
  activityTabs,
  selTags,
}: {
  overviewValue: OverviewFormState;
  objective: string;
  activityTabs: ActivityTab[];
  selTags: string[];
}) => {
  if (!overviewValue.title.trim()) return "Please enter an activity title.";
  if (!overviewValue.overview.trim()) return "Please enter an activity overview.";
  if (overviewValue.categories.length === 0) return "Please select at least one category.";
  if (!overviewValue.duration) return "Please select a duration.";
  if (!overviewValue.energyLevel) return "Please select an energy level.";
  if (!overviewValue.anyEnvironment && overviewValue.environments.length === 0) {
    return "Please select an environment or Any Environment.";
  }
  if (!overviewValue.setup) return "Please select whether the activity needs props.";

  if (!overviewValue.anyGroupSize) {
    const groupSizeMin = toPositiveInteger(overviewValue.groupSizeMin);
    const groupSizeMax = toPositiveInteger(overviewValue.groupSizeMax);

    if (!Number.isFinite(groupSizeMin) || !Number.isFinite(groupSizeMax)) {
      return "Please enter a minimum and maximum group size, or select Any Size.";
    }

    if (groupSizeMin < 1 || groupSizeMax < groupSizeMin) {
      return "Please enter a valid group size range.";
    }
  }

  const prepTab = getPrepTab(activityTabs);
  if (prepTab && !prepTab.noMaterialsNeeded && prepTab.materials.length === 0) {
    return "Please add materials or select No materials needed.";
  }

  if (!objective.trim()) return "Please enter an activity objective.";
  if (selTags.length === 0) return "Please enter at least one SEL tag.";

  return null;
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
  const [objective, setObjective] = useState("");
  const [activityTabs, setActivityTabs] = useState<ActivityTab[]>(() =>
    createDefaultActivityTabs(),
  );
  const [overviewValue, setOverviewValue] = useState<OverviewFormState>(() =>
    createDefaultOverviewState(),
  );
  const [activeActivityTabId, setActiveActivityTabId] = useState<string | null>(null);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState("");
  const [cropDraftImage, setCropDraftImage] = useState<CropDraftImage | null>(null);
  const [pendingVideo, setPendingVideo] = useState<VideoFrameSource | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleOverviewChange = (patch: Partial<OverviewFormState>) => {
    setOverviewValue((prev) => ({ ...prev, ...patch }));
  };

  const validateForm = (tabsToValidate = activityTabs) => {
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
    const prepTab = tabsToValidate.find((tab) => tab.kind === "prep");
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
    const playTab = tabsToValidate.find((tab) => tab.kind === "play");
    if (playTab) {
      newErrors.playGuidedItems = playTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter how to play instructions" : null,
      );
    }

    // Validate Debrief tab guided items
    const debriefTab = tabsToValidate.find((tab) => tab.kind === "debrief");
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
    const nextSectionErrors: Record<string, { title?: string | null; content?: string | null }> = {};
    tabsToValidate.forEach((tab) => {
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

  const submitActivity = async (targetStatus: ApiActivityStatus) => {
    if (isSubmitting) return null;

    const activityTabsForSubmission = getActivityTabsWithPendingMaterial(
      activityTabs,
      materialInput,
    );
    const hasPendingMaterialInput = materialInput.trim().length > 0;

    if (hasPendingMaterialInput) {
      setActivityTabs(activityTabsForSubmission);
      setMaterialInput("");
    }

    const validationMessage = getSubmissionValidationMessage({
      overviewValue,
      objective,
      activityTabs: activityTabsForSubmission,
      selTags,
    });

    if (validationMessage) {
      showToast("error", validationMessage);
      return null;
    }

    if (!validateForm(activityTabsForSubmission)) {
      // Scroll to first error
      scrollToFirstError();
      showToast("error", "Please fix the highlighted fields before submitting.");
      return null;
    }

    setIsSubmitting(true);

    try {
      const createdActivity = await createActivity(
        buildActivityPayload({
          overviewValue,
          objective,
          activityTabs: activityTabsForSubmission,
          selTags,
          status: targetStatus,
        }),
      );
      const activityId = getActivityId(createdActivity);
      const hasMediaSelection = Boolean(overviewValue.thumbnailImage || overviewValue.thumbnailVideo);

      if (!activityId && (hasMediaSelection || targetStatus === "Published")) {
        throw new Error("Activity was created, but the response did not include an activity id.");
      }

      if (activityId && hasMediaSelection) {
        await uploadActivityMediaSelection({
          activityId,
          thumbnailImage: overviewValue.thumbnailImage,
          thumbnailVideo: overviewValue.thumbnailVideo,
          apiBaseUrl: ACTIVITY_API_BASE_URL,
        });
      }

      const savedActivity =
        activityId && targetStatus === "Published"
          ? await updateActivityStatus(activityId, "Published")
          : createdActivity;

      setStatus(savedActivity.status ?? targetStatus);
      showToast(
        "success",
        targetStatus === "Published" ? "Activity published." : "Activity saved as draft.",
      );
      return activityId;
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to submit activity. Please try again.",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const activityId = await submitActivity("Draft");
    return activityId;
  };

  const handlePublish = async () => {
    const activityId = await submitActivity("Published");
    if (activityId) setIsPreviewVisible(false);
    return activityId;
  };

  const openPublishPreview = () => {
    const activityTabsForPreview = getActivityTabsWithPendingMaterial(activityTabs, materialInput);

    if (materialInput.trim()) {
      setActivityTabs(activityTabsForPreview);
      setMaterialInput("");
    }

    setIsPreviewVisible(true);
  };

  const scrollToFirstError = () => {
    // Priority order: objective -> setup -> materials -> play -> debrief -> selTags
    if (errors.objective) {
      scrollViewRef.current?.scrollTo({ y: 150, animated: true });
    } else if (errors.setupInstructions || errors.materials) {
      const prepTab = activityTabs.find((tab) => tab.kind === "prep");
      if (prepTab) setActiveActivityTabId(prepTab.id);
      scrollViewRef.current?.scrollTo({ y: 350, animated: true });
    } else if (errors.playGuidedItems.some((e) => e !== null)) {
      const playTab = activityTabs.find((tab) => tab.kind === "play");
      if (playTab) {
        setActiveActivityTabId(playTab.id);
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      }
    } else if (errors.debriefGuidedItems.some((e) => e !== null)) {
      const debriefTab = activityTabs.find((tab) => tab.kind === "debrief");
      if (debriefTab) {
        setActiveActivityTabId(debriefTab.id);
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
        onPublish={openPublishPreview}
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
          activeTabId={activeActivityTabId}
          onActiveTabChange={setActiveActivityTabId}
          materialInput={materialInput}
          onMaterialInputChange={setMaterialInput}
          objectiveError={errors.objective}
          setupError={errors.setupInstructions}
          materialsError={errors.materials}
          playGuidedItemErrors={errors.playGuidedItems}
          debriefGuidedItemErrors={errors.debriefGuidedItems}
          sectionErrors={sectionErrors}
        />
      </CollapsibleSection>

      <CollapsibleSection title="SEL Opportunity" defaultOpen>
        <SEL_Opportunity tags={selTags} onTagsChange={setSelTags} error={errors.selTags} />
      </CollapsibleSection>

      <PublishPreviewModal
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        onSaveDraft={() => {
          void handleSaveDraft().then((savedId) => {
            if (savedId) {
              setIsPreviewVisible(false);
            }
          });
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
        onPublish={openPublishPreview}
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
