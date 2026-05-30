import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { ActivityOverviewField } from "./sub_components/ActivityOverviewField";
import { ActivityTitleField } from "./sub_components/ActivityTitleField";
import { CategorySection } from "./sub_components/CategorySection";
import { DurationSection } from "./sub_components/DurationSection";
import { EnergyLevelSection } from "./sub_components/EnergyLevelSection";
import { EnvironmentSection } from "./sub_components/EnvironmentSection";
import { GradeSection } from "./sub_components/GradeSection";
import { GroupSizeSection } from "./sub_components/GroupSizeSection";
import { SetupSection } from "./sub_components/SetupSection";
import { ThumbnailSection } from "./sub_components/ThumbnailSection";

import type { ACTIVITY_VIDEO_FORM_FIELD, THUMBNAIL_IMAGE_FORM_FIELD } from "./mediaUploadConfig";

export type DurationOption = "5-15 min" | "15-30 min" | "30+ min" | null;
export type EnergyLevelOption = "Low" | "Medium" | "High" | null;
export type SetupOption = "Props" | "No Props" | null;
export type YoutubeThumbnailStatus = "idle" | "checking" | "ready" | "error";

export type ThumbnailImageFile = {
  fieldName: typeof THUMBNAIL_IMAGE_FORM_FIELD;
  uri: string;
  name: string;
  type: string;
  width: number;
  height: number;
};

export type ThumbnailVideoFile = {
  fieldName: typeof ACTIVITY_VIDEO_FORM_FIELD;
  uri: string;
  name: string;
  type: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationMs: number;
  selectedFrameTimeMs: number;
};

export type OverviewFormState = {
  thumbnailMediaKind: "image" | "video" | null;
  thumbnailSourceName: string | null;
  thumbnailSourceSizeBytes: number | null;
  thumbnailVideo: ThumbnailVideoFile | null;
  thumbnailImage: ThumbnailImageFile | null;
  videoUrl: string;
  videoThumbnailUrl: string | null;
  videoThumbnailStatus: YoutubeThumbnailStatus;
  videoThumbnailError: string | null;
  title: string;
  overview: string;
  categories: string[];
  gradeMin: string;
  gradeMax: string;
  groupSizeMin: string;
  groupSizeMax: string;
  anyGroupSize: boolean;
  duration: DurationOption;
  energyLevel: EnergyLevelOption;
  environments: string[];
  anyEnvironment: boolean;
  setup: SetupOption;
};

export const createDefaultOverviewState = (): OverviewFormState => ({
  thumbnailMediaKind: null,
  thumbnailSourceName: null,
  thumbnailSourceSizeBytes: null,
  thumbnailVideo: null,
  thumbnailImage: null,
  videoUrl: "",
  videoThumbnailUrl: null,
  videoThumbnailStatus: "idle",
  videoThumbnailError: null,
  title: "",
  overview: "",
  categories: [],
  gradeMin: "K",
  gradeMax: "6",
  groupSizeMin: "",
  groupSizeMax: "",
  anyGroupSize: false,
  duration: null,
  energyLevel: null,
  environments: [],
  anyEnvironment: false,
  setup: null,
});

type OverviewSectionProps = {
  value: OverviewFormState;
  onChange: (patch: Partial<OverviewFormState>) => void;
  errors?: {
    title?: string | null;
    overview?: string | null;
    categories?: string | null;
    groupSize?: string | null;
    duration?: string | null;
    energyLevel?: string | null;
    environment?: string | null;
    setup?: string | null;
  };
  onPickMedia?: () => void;
};

type YoutubeThumbnailDimensions = {
  width?: number;
  height?: number;
};

const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/;

const getYoutubeVideoId = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    if (
      hostname !== "youtube.com" &&
      hostname !== "m.youtube.com" &&
      hostname !== "youtube-nocookie.com"
    ) {
      return null;
    }

    const watchId = url.searchParams.get("v");
    if (watchId && YOUTUBE_VIDEO_ID_PATTERN.test(watchId)) return watchId;

    const [pathKind, pathId] = url.pathname.split("/").filter(Boolean);
    if (
      ["embed", "shorts", "live"].includes(pathKind) &&
      pathId &&
      YOUTUBE_VIDEO_ID_PATTERN.test(pathId)
    ) {
      return pathId;
    }

    return null;
  } catch {
    return null;
  }
};

const getYoutubeThumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  value,
  onChange,
  errors = {},
  onPickMedia,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;
  const handleVideoUrlChange = (next: string) =>
    onChange({
      videoUrl: next,
      videoThumbnailUrl: null,
      videoThumbnailStatus: "idle",
      videoThumbnailError: null,
    });
  const handleExtractVideoThumbnail = () => {
    const nextVideoUrl = value.videoUrl.trim();
    const videoId = getYoutubeVideoId(nextVideoUrl);

    if (!videoId) {
      onChange({
        videoThumbnailUrl: null,
        videoThumbnailStatus: "error",
        videoThumbnailError: "Enter a valid YouTube URL.",
      });
      return;
    }

    onChange({
      videoUrl: nextVideoUrl,
      videoThumbnailUrl: getYoutubeThumbnailUrl(videoId),
      videoThumbnailStatus: "checking",
      videoThumbnailError: null,
    });
  };
  const handleDeleteVideoThumbnail = () =>
    onChange({
      videoThumbnailUrl: null,
      videoThumbnailStatus: "idle",
      videoThumbnailError: null,
    });
  const handleVideoThumbnailLoad = (dimensions?: YoutubeThumbnailDimensions) => {
    if (value.videoThumbnailStatus === "ready") return;

    const thumbnailWidth = dimensions?.width ?? 0;
    const thumbnailHeight = dimensions?.height ?? 0;

    if (
      thumbnailWidth > 0 &&
      thumbnailHeight > 0 &&
      thumbnailWidth <= 120 &&
      thumbnailHeight <= 90
    ) {
      onChange({
        videoThumbnailUrl: null,
        videoThumbnailStatus: "error",
        videoThumbnailError: "Unable to find a usable thumbnail for this YouTube URL.",
      });
      return;
    }

    onChange({
      videoThumbnailStatus: "ready",
      videoThumbnailError: null,
    });
  };
  const handleVideoThumbnailError = () =>
    onChange({
      videoThumbnailUrl: null,
      videoThumbnailStatus: "error",
      videoThumbnailError: "Unable to load a thumbnail for this YouTube URL.",
    });

  return (
    <View style={styles.container}>
      <ThumbnailSection
        mediaFileName={value.thumbnailSourceName}
        previewUri={value.thumbnailImage?.uri ?? null}
        videoUrl={value.videoUrl}
        videoThumbnailUrl={value.videoThumbnailUrl}
        videoThumbnailStatus={value.videoThumbnailStatus}
        videoThumbnailError={value.videoThumbnailError}
        onVideoUrlChange={handleVideoUrlChange}
        onExtractVideoThumbnail={handleExtractVideoThumbnail}
        onDeleteVideoThumbnail={handleDeleteVideoThumbnail}
        onVideoThumbnailLoad={handleVideoThumbnailLoad}
        onVideoThumbnailError={handleVideoThumbnailError}
        onPickMedia={onPickMedia}
      />

      <ActivityTitleField
        value={value.title}
        onChangeText={(next) => onChange({ title: next })}
        error={errors.title}
      />

      <ActivityOverviewField
        value={value.overview}
        onChangeText={(next) => onChange({ overview: next })}
        error={errors.overview}
      />

      <CategorySection
        selected={value.categories}
        onChange={(next) => onChange({ categories: next })}
        error={errors.categories}
      />

      <GradeSection
        minValue={value.gradeMin}
        maxValue={value.gradeMax}
        onChange={(minValue, maxValue) => onChange({ gradeMin: minValue, gradeMax: maxValue })}
      />

      <GroupSizeSection
        minValue={value.groupSizeMin}
        maxValue={value.groupSizeMax}
        anySize={value.anyGroupSize}
        onChangeMin={(next) => onChange({ groupSizeMin: next })}
        onChangeMax={(next) => onChange({ groupSizeMax: next })}
        error={errors.groupSize}
        onChangeAnySize={(next) =>
          onChange({
            anyGroupSize: next,
            ...(next ? { groupSizeMin: "", groupSizeMax: "" } : {}),
          })
        }
      />

      <DurationSection
        value={value.duration}
        onChange={(next) => onChange({ duration: next })}
        error={errors.duration}
      />

      <EnergyLevelSection
        value={value.energyLevel}
        onChange={(next) => onChange({ energyLevel: next })}
        error={errors.energyLevel}
      />

      <View style={[styles.bottomRow, !isWide && styles.bottomRowMobile]}>
        <View style={styles.environmentColumn}>
          <EnvironmentSection
            selected={value.environments}
            anyEnvironment={value.anyEnvironment}
            onChangeSelected={(next) => onChange({ environments: next })}
            error={errors.environment}
            onChangeAnyEnvironment={(next) =>
              onChange({
                anyEnvironment: next,
                ...(next ? { environments: [] } : {}),
              })
            }
          />
        </View>

        <View style={styles.setupColumn}>
          <SetupSection
            value={value.setup}
            onChange={(next) => onChange({ setup: next })}
            error={errors.setup}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 28,
  },
  bottomRow: {
    width: "100%",
    flexDirection: "row",
    gap: 24,
    alignItems: "flex-start",
  },
  bottomRowMobile: {
    flexDirection: "column",
    gap: 28,
  },
  environmentColumn: {
    flex: 1,
    width: "100%",
  },
  setupColumn: {
    width: 220,
  },
});
