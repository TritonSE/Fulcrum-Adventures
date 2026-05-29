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

import {
  formatMegabytes,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  SUPPORTED_MEDIA_FORMAT_LABEL,
} from "../mediaUploadConfig";

type ThumbnailSectionProps = {
  mediaFileName: string | null;
  mediaKind: "image" | "video" | null;
  previewUri?: string | null;
  videoUrl: string;
  onVideoUrlChange: (value: string) => void;
  onPickMedia?: () => void;
};

type UploadCardProps = {
  mediaFileName: string | null;
  mediaKind: "image" | "video" | null;
  previewUri?: string | null;
  onPress?: () => void;
  fullWidth?: boolean;
};

const UploadCard: React.FC<UploadCardProps> = ({
  mediaFileName,
  mediaKind,
  previewUri,
  onPress,
  fullWidth = false,
}) => {
  const selectedLabel = mediaKind
    ? `${mediaKind === "video" ? "Video" : "Image"} selected`
    : "No file selected";

  return (
    <View style={[styles.uploadCard, fullWidth && styles.uploadCardFull]}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
      ) : (
        <Text style={styles.icon}>+</Text>
      )}
      <Text style={styles.cardTitle}>Upload Thumbnail Media</Text>
      <Text style={styles.cardDescription}>
        Upload an image, or upload a video and select a frame to crop as the thumbnail.
      </Text>

      <Pressable style={styles.chooseButton} onPress={onPress}>
        <Text style={styles.chooseButtonText}>Choose Image or Video</Text>
      </Pressable>

      <Text style={styles.fileNameText}>
        {mediaFileName ? `${selectedLabel}: ${mediaFileName}` : selectedLabel}
      </Text>
      <Text style={styles.supportText}>Supported formats: {SUPPORTED_MEDIA_FORMAT_LABEL}</Text>
      <Text style={styles.supportText}>
        Max size: images {formatMegabytes(MAX_IMAGE_UPLOAD_BYTES)}, videos{" "}
        {formatMegabytes(MAX_VIDEO_UPLOAD_BYTES)}
      </Text>
    </View>
  );
};

export const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({
  mediaFileName,
  mediaKind,
  previewUri,
  videoUrl,
  onVideoUrlChange,
  onPickMedia,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thumbnail</Text>

      <View style={[styles.row, isMobile && styles.rowMobile]}>
        <UploadCard
          mediaFileName={mediaFileName}
          mediaKind={mediaKind}
          previewUri={previewUri}
          onPress={onPickMedia}
          fullWidth={isMobile}
        />
      </View>

      <View style={styles.videoUrlGroup}>
        <Text style={styles.videoUrlLabel}>YouTube Video URL</Text>
        <TextInput
          value={videoUrl}
          onChangeText={onVideoUrlChange}
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          placeholderTextColor="#A6A6A6"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.videoUrlInput}
        />
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
  videoUrlInput: {
    width: "100%",
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
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
