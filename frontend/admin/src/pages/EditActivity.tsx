import { File as ExpoFile } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  ACTIVITY_API_BASE_URL,
  getActivityById,
  getActivityId,
  type ActivityDetail,
  type ActivityStatus as ApiActivityStatus,
  type CreateActivityPayload,
  updateActivity,
} from "../api/activityApi";
import { uploadActivityMediaSelection } from "../api/activityMediaApi";
import {
  ActivityContent,
  createDefaultActivityTabs,
  type ActivityTab,
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
  THUMBNAIL_IMAGE_FORM_FIELD,
} from "../create_edit_page_components/mediaUploadConfig";
import {
  createDefaultOverviewState,
  OverviewSection,
  type OverviewFormState,
  type ThumbnailVideoFile,
} from "../create_edit_page_components/OverviewSection";
import { SEL_Opportunity } from "../create_edit_page_components/SEL_Opportunity";
import {
  type CropDraftImage,
  ImageCropModal,
} from "../create_edit_page_components/sub_components/ImageCropModal";
import { PublishPreviewModal } from "../create_edit_page_components/sub_components/PublishPreviewModal";
import {
  getVideoFrameImageName,
  type VideoFrameSource,
  VideoFramePickerModal,
} from "../create_edit_page_components/sub_components/VideoFramePickerModal";
import { showToast } from "../utils/showToast";

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

const toGradeLabel = (value: number) => (value === 0 ? "K" : String(value));

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
  const environment = overviewValue.anyEnvironment ? ["Any Environment"] : overviewValue.environments;
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
  disabled?: boolean;
};

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  label,
  onPress,
  variant = "secondary",
  disabled = false,
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.headerButton,
        isPrimary ? styles.headerButtonPrimary : styles.headerButtonSecondary,
        disabled && styles.headerButtonDisabled,
      ]}
      activeOpacity={0.85}
      disabled={disabled}
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

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getFileNameFromUrl = (value: string | undefined) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    const fileName = url.pathname.split("/").pop();
    return fileName ? decodeURIComponent(fileName) : value;
  } catch {
    const fileName = value.split("/").pop();
    return fileName ? decodeURIComponent(fileName) : value;
  }
};

const parseSectionBlocks = (content: string) =>
  content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

const parseActivityTabs = (activity: ActivityDetail): ActivityTab[] => {
  const facilitateSections = activity.facilitateSections ?? [];
  const materials = activity.materials ?? [];
  const sectionByName = new Map(facilitateSections.map((section) => [section.tabName, section]));

  const buildBaseTab = (name: string, kind: ActivityTab["kind"]): ActivityTab => ({
    id: createId(),
    name,
    kind,
    sections: [],
    guidedItems: [],
    materials: kind === "prep" ? materials : [],
    noMaterialsNeeded: kind === "prep" ? materials.length === 0 : false,
  });

  const orderedTabs: ActivityTab[] = [];
  const knownTabs: Array<{ name: string; kind: ActivityTab["kind"] }> = [
    { name: "Prep", kind: "prep" },
    { name: "Play", kind: "play" },
    { name: "Debrief", kind: "debrief" },
  ];

  knownTabs.forEach(({ name, kind }) => {
    const source =
      sectionByName.get(name) ??
      facilitateSections.find((section) => section.tabName.toLowerCase() === name.toLowerCase());
    const tab = buildBaseTab(name, kind);
    const blocks = parseSectionBlocks(source?.content ?? "");

    blocks.forEach((block) => {
      const guidedMatch =
        kind === "play"
          ? block.match(/^Step\s+\d+:\s*([\s\S]+)$/i)
          : kind === "debrief"
            ? block.match(/^Q\d+:\s*([\s\S]+)$/i)
            : null;

      if (guidedMatch) {
        tab.guidedItems.push(guidedMatch[1].trim());
        return;
      }

      const lines = block.split("\n");
      const title = lines[0]?.trim() ?? "";
      const body = lines.slice(1).join("\n").trim();

      if (!title && !body) return;

      tab.sections.push({
        id: createId(),
        title,
        content: body,
      });
    });

    if (tab.sections.length === 0) {
      const defaultTab = createDefaultActivityTabs().find((item) => item.kind === kind);
      if (defaultTab) {
        tab.sections = defaultTab.sections.map((section) => ({ ...section, id: createId() }));
      }
    }

    if (kind === "play" && tab.guidedItems.length < 2) {
      tab.guidedItems = [...tab.guidedItems, ...Array.from({ length: 2 - tab.guidedItems.length }, () => "")];
    }

    if (kind === "debrief" && tab.guidedItems.length < 1) {
      tab.guidedItems = [tab.guidedItems[0] ?? ""];
    }

    orderedTabs.push(tab);
  });

  facilitateSections.forEach((section) => {
    const lowerName = section.tabName.toLowerCase();
    if (["prep", "play", "debrief"].includes(lowerName)) return;

    const blocks = parseSectionBlocks(section.content);
    orderedTabs.push({
      id: createId(),
      name: section.tabName,
      kind: "custom",
      sections:
        blocks.length > 0
          ? blocks.map((block, index) => {
              const lines = block.split("\n");
              const title = lines[0]?.trim() || (index === 0 ? section.tabName : `Section ${index + 1}`);
              const content = lines.slice(1).join("\n").trim();

              return {
                id: createId(),
                title,
                content,
              };
            })
          : [{ id: createId(), title: section.tabName, content: "" }],
      guidedItems: [],
      materials: [],
      noMaterialsNeeded: false,
    });
  });

  return orderedTabs;
};

const createOverviewStateFromActivity = (activity: ActivityDetail): OverviewFormState => {
  const baseState = createDefaultOverviewState();
  const environmentValues = activity.environment ?? [];
  const environments = environmentValues.filter((item) => item !== "Any Environment");
  const anyEnvironment = environmentValues.includes("Any Environment");
  const thumbnailUrl = activity.thumbnailUrl?.trim();

  return {
    ...baseState,
    thumbnailMediaKind: thumbnailUrl ? "image" : null,
    thumbnailSourceName: getFileNameFromUrl(thumbnailUrl),
    thumbnailSourceSizeBytes: null,
    thumbnailImage: thumbnailUrl
      ? {
          fieldName: THUMBNAIL_IMAGE_FORM_FIELD,
          uri: thumbnailUrl,
          name: getFileNameFromUrl(thumbnailUrl) ?? "thumbnail.jpg",
          type: "image/jpeg",
          width: 0,
          height: 0,
        }
      : null,
    thumbnailVideo: null,
    videoUrl: "",
    title: activity.title ?? "",
    overview: activity.overview ?? "",
    categories: activity.category ?? [],
    gradeMin: toGradeLabel(activity.gradeRange?.min ?? 0),
    gradeMax: toGradeLabel(activity.gradeRange?.max ?? 0),
    groupSizeMin: activity.groupSize?.anySize ? "" : String(activity.groupSize?.min ?? ""),
    groupSizeMax: activity.groupSize?.anySize ? "" : String(activity.groupSize?.max ?? ""),
    anyGroupSize: Boolean(activity.groupSize?.anySize),
    duration: (activity.duration as OverviewFormState["duration"]) ?? null,
    energyLevel: (activity.energyLevel as OverviewFormState["energyLevel"]) ?? null,
    environments,
    anyEnvironment,
    setup: activity.setup === "Required" ? "Props" : "No Props",
  };
};

type EditActivityProps = {
  activityId?: string;
  onCancel?: () => void;
};

const getActivityIdFromPath = () => {
  if (typeof window === "undefined") return null;

  const segments = window.location.pathname.split("/").filter(Boolean);
  const editIndex = segments.lastIndexOf("edit");

  if (editIndex > 0) return segments[editIndex - 1] ?? null;
  return segments.at(-1) ?? null;
};

export const EditActivity: React.FC<EditActivityProps> = ({
  activityId: activityIdProp,
  onCancel,
}) => {
  const activityIdParam = activityIdProp ?? getActivityIdFromPath();
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasNewMediaSelection, setHasNewMediaSelection] = useState(false);
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

  useEffect(() => {
    if (!activityIdParam) {
      setLoadError("Missing activity id in the route.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadActivity = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const activity = await getActivityById(activityIdParam);

        if (!isMounted) return;

        setObjective(activity.objective ?? "");
        setActivityTabs(parseActivityTabs(activity));
        setOverviewValue(createOverviewStateFromActivity(activity));
        setSelTags(activity.selTags ?? []);
        setStatus(activity.status ?? "Draft");
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : "Unable to load activity for editing.";
        setLoadError(message);
        showToast("error", message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      isMounted = false;
    };
  }, [activityIdParam]);

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

    if (!objective.trim()) {
      newErrors.objective = "Please enter an activity objective";
    }

    const prepTab = tabsToValidate.find((tab) => tab.kind === "prep");
    if (prepTab) {
      const setupSection = prepTab.sections[0];
      if (!setupSection?.content.trim()) {
        newErrors.setupInstructions = "Please enter set-up instructions";
      }
    }

    if (prepTab) {
      if (!prepTab.noMaterialsNeeded && prepTab.materials.length === 0) {
        newErrors.materials = "Please enter items or select no materials";
      }
    }

    const playTab = tabsToValidate.find((tab) => tab.kind === "play");
    if (playTab) {
      newErrors.playGuidedItems = playTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter how to play instructions" : null,
      );
    }

    const debriefTab = tabsToValidate.find((tab) => tab.kind === "debrief");
    if (debriefTab) {
      newErrors.debriefGuidedItems = debriefTab.guidedItems.map((item) =>
        !item.trim() ? "Please enter a reflection question" : null,
      );
    }

    if (selTags.length === 0) {
      newErrors.selTags = "Please enter at least one SEL tag";
    }

    const nextSectionErrors: Record<string, { title?: string | null; content?: string | null }> = {};
    tabsToValidate.forEach((tab) => {
      tab.sections.forEach((section, index) => {
        if (index === 0) return;

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
    if (onCancel) {
      onCancel();
      return;
    }

    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const submitActivity = async (targetStatus: ApiActivityStatus) => {
    if (isSubmitting) return null;
    if (!activityIdParam) return null;

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
      scrollToFirstError();
      showToast("error", "Please fix the highlighted fields before submitting.");
      return null;
    }

    setIsSubmitting(true);

    try {
      const updatedActivity = await updateActivity(
        activityIdParam,
        buildActivityPayload({
          overviewValue,
          objective,
          activityTabs: activityTabsForSubmission,
          selTags,
          status: targetStatus,
        }),
      );

      const resolvedActivityId = getActivityId(updatedActivity) ?? activityIdParam;

      if (resolvedActivityId && hasNewMediaSelection) {
        await uploadActivityMediaSelection({
          activityId: resolvedActivityId,
          thumbnailImage: overviewValue.thumbnailImage,
          thumbnailVideo: overviewValue.thumbnailVideo,
          apiBaseUrl: ACTIVITY_API_BASE_URL,
        });
        setHasNewMediaSelection(false);
      }

      setStatus(updatedActivity.status ?? targetStatus);
      showToast(
        "success",
        targetStatus === "Published" ? "Activity updated and published." : "Activity draft updated.",
      );
      return resolvedActivityId;
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to update activity. Please try again.",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => submitActivity("Draft");

  const handlePublish = async () => {
    const savedId = await submitActivity("Published");
    if (savedId) setIsPreviewVisible(false);
    return savedId;
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

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerStateTitle}>Loading activity...</Text>
      </View>
    );
  }

  if (loadError || !activityIdParam) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerStateTitle}>Unable to load activity</Text>
        <Text style={styles.centerStateBody}>{loadError ?? "Missing activity id."}</Text>
        <HeaderActionButton label="Go Back" onPress={handleCancel} />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.pageTitle}>Edit Activity</Text>
        </View>

        <View style={styles.headerActions}>
          <HeaderActionButton label="Cancel" onPress={handleCancel} disabled={isSubmitting} />
          <HeaderActionButton
            label="Save as Draft"
            onPress={() => {
              void handleSaveDraft();
            }}
            disabled={isSubmitting}
          />
          <HeaderActionButton
            label="Publish Activity"
            onPress={openPublishPreview}
            variant="primary"
            disabled={isSubmitting}
          />
        </View>
      </View>

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
          setHasNewMediaSelection(true);
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

      <View style={styles.footerActions}>
        <HeaderActionButton label="Cancel" onPress={handleCancel} disabled={isSubmitting} />
        <HeaderActionButton
          label="Save as Draft"
          onPress={() => {
            void handleSaveDraft();
          }}
          disabled={isSubmitting}
        />
        <HeaderActionButton
          label="Publish Activity"
          onPress={openPublishPreview}
          variant="primary"
          disabled={isSubmitting}
        />
      </View>
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
  headerButtonDisabled: {
    opacity: 0.5,
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
  centerState: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#F7F7F7",
  },
  centerStateTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#153A7A",
    fontFamily: "League Spartan",
    textAlign: "center",
  },
  centerStateBody: {
    maxWidth: 520,
    fontSize: 16,
    lineHeight: 24,
    color: "#5F6B85",
    textAlign: "center",
  },
});
