import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { FieldError } from "./FieldError";
import {
  formatMegabytes,
  MAX_IMAGE_UPLOAD_BYTES,
  SUPPORTED_IMAGE_FORMAT_LABEL,
} from "../mediaUploadConfig";

import type { YoutubeThumbnailStatus } from "../OverviewSection";

type ThumbnailSectionProps = {
  mediaFileName: string | null;
  previewUri?: string | null;
  videoUrl: string;
  videoThumbnailUrl: string | null;
  videoThumbnailStatus: YoutubeThumbnailStatus;
  videoThumbnailError: string | null;
  error?: string | null;
  onVideoUrlChange: (value: string) => void;
  onExtractVideoThumbnail: () => void;
  onDeleteVideoThumbnail: () => void;
  onVideoThumbnailLoad: (dimensions?: { width?: number; height?: number }) => void;
  onVideoThumbnailError: () => void;
  onPickMedia?: () => void;
};

type UploadCardProps = {
  mediaFileName: string | null;
  previewUri?: string | null;
  onPress?: () => void;
  fullWidth?: boolean;
};

const UploadCard: React.FC<UploadCardProps> = ({
  mediaFileName,
  previewUri,
  onPress,
  fullWidth = false,
}) => {
  const selectedLabel = mediaFileName ? `Image selected: ${mediaFileName}` : "No image selected";

  return (
    <View style={[styles.uploadCard, fullWidth && styles.uploadCardFull]}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
      ) : (
        <Text style={styles.icon}>+</Text>
      )}
      <Text style={styles.cardTitle}>Upload cover image</Text>
      <Text style={styles.cardDescription}>Upload an image to use as the activity cover.</Text>

      <Pressable style={styles.chooseButton} onPress={onPress}>
        <Text style={styles.chooseButtonText}>Choose Image</Text>
      </Pressable>

      <Text style={styles.fileNameText}>{selectedLabel}</Text>
      <Text style={styles.supportText}>Supported formats: {SUPPORTED_IMAGE_FORMAT_LABEL}</Text>
      <Text style={styles.supportText}>Max size: {formatMegabytes(MAX_IMAGE_UPLOAD_BYTES)}</Text>
    </View>
  );
};

export const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({
  mediaFileName,
  previewUri,
  videoUrl,
  videoThumbnailUrl,
  videoThumbnailStatus,
  videoThumbnailError,
  error,
  onVideoUrlChange,
  onExtractVideoThumbnail,
  onDeleteVideoThumbnail,
  onVideoThumbnailLoad,
  onVideoThumbnailError,
  onPickMedia,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const hasExtractedThumbnail = videoThumbnailStatus === "ready" && !!videoThumbnailUrl;
  const isCheckingThumbnail = videoThumbnailStatus === "checking";
  const isExtractDisabled = isCheckingThumbnail || (!videoUrl.trim() && !hasExtractedThumbnail);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thumbnail</Text>

      <View style={[styles.row, isMobile && styles.rowMobile]}>
        <UploadCard
          mediaFileName={mediaFileName}
          previewUri={previewUri}
          onPress={onPickMedia}
          fullWidth={isMobile}
        />
      </View>
      {error ? <FieldError message={error} /> : null}

      <View style={styles.videoUrlGroup}>
        <Text style={styles.videoUrlLabel}>YouTube Video URL</Text>
        <View style={[styles.videoUrlRow, isMobile && styles.videoUrlRowMobile]}>
          <TextInput
            value={videoUrl}
            onChangeText={onVideoUrlChange}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            placeholderTextColor="#A6A6A6"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[styles.videoUrlInput, videoThumbnailError && styles.videoUrlInputError]}
          />

          <Pressable
            style={[
              styles.videoUrlButton,
              hasExtractedThumbnail && styles.videoUrlButtonDanger,
              isExtractDisabled && styles.videoUrlButtonDisabled,
            ]}
            onPress={hasExtractedThumbnail ? onDeleteVideoThumbnail : onExtractVideoThumbnail}
            disabled={isExtractDisabled}
          >
            <Text
              style={[
                styles.videoUrlButtonText,
                hasExtractedThumbnail && styles.videoUrlButtonDangerText,
              ]}
            >
              {hasExtractedThumbnail
                ? "Delete"
                : isCheckingThumbnail
                  ? "Checking..."
                  : "Extract Thumbnail"}
            </Text>
          </Pressable>
        </View>
        {videoThumbnailError ? (
          <Text style={styles.videoUrlErrorText}>{videoThumbnailError}</Text>
        ) : null}

        {videoThumbnailUrl ? (
          <View style={styles.youtubeThumbnailPreview}>
            <Image
              source={{ uri: videoThumbnailUrl }}
              style={styles.youtubeThumbnailImage}
              resizeMode="cover"
              onLoad={(event) => {
                const source = event.nativeEvent.source as
                  | { width?: number; height?: number }
                  | undefined;

                onVideoThumbnailLoad({
                  width: source?.width,
                  height: source?.height,
                });
              }}
              onError={onVideoThumbnailError}
            />
            <Text style={styles.youtubeThumbnailLabel}>
              {isCheckingThumbnail ? "Checking thumbnail..." : "Extracted thumbnail"}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans Bold",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  rowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  videoUrlGroup: {
    width: "100%",
    marginTop: 18,
  },
  videoUrlLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F3B82",
    marginBottom: 8,
  },
  videoUrlRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  videoUrlRowMobile: {
    flexDirection: "column",
  },
  videoUrlInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  videoUrlInputError: {
    borderColor: "#DC2626",
  },
  videoUrlButton: {
    minHeight: 44,
    minWidth: 148,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#153A7A",
    alignItems: "center",
    justifyContent: "center",
  },
  videoUrlButtonDanger: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  videoUrlButtonDisabled: {
    opacity: 0.5,
  },
  videoUrlButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  videoUrlButtonDangerText: {
    color: "#DC2626",
  },
  videoUrlErrorText: {
    marginTop: 8,
    color: "#DC2626",
    fontSize: 13,
  },
  youtubeThumbnailPreview: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  youtubeThumbnailImage: {
    width: 220,
    height: 124,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
  },
  youtubeThumbnailLabel: {
    marginTop: 6,
    color: "#6C6C6C",
    fontSize: 13,
  },
  uploadCard: {
    width: "100%",
    minHeight: 210,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#B4B4B4",
    borderStyle: "dashed",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  uploadCardFull: {
    width: "100%",
  },
  icon: {
    fontSize: 38,
    marginBottom: 12,
  },
  previewImage: {
    width: 136,
    height: 102,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#E8E8E8",
  },
  cardTitle: {
    fontSize: 16,
    color: "#6C6C6C",
    fontWeight: "500",
    marginBottom: 18,
    textAlign: "center",
  },
  cardDescription: {
    maxWidth: 420,
    color: "#6C6C6C",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  chooseButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  chooseButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "600",
  },
  fileNameText: {
    marginTop: 12,
    fontSize: 13,
    color: "#8B8B8B",
    textAlign: "center",
  },
  supportText: {
    marginTop: 6,
    fontSize: 12,
    color: "#8B8B8B",
    textAlign: "center",
  },
});
