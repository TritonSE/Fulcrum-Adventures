import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type ThumbnailSectionProps = {
  videoFileName: string | null;
  imageFileName: string | null;
  onPickVideo?: () => void;
  onPickImage?: () => void;
};

type UploadCardProps = {
  icon: string;
  title: string;
  fileName: string | null;
  onPress?: () => void;
  fullWidth?: boolean;
};

const UploadCard: React.FC<UploadCardProps> = ({
  icon,
  title,
  fileName,
  onPress,
  fullWidth = false,
}) => {
  return (
    <View style={[styles.uploadCard, fullWidth && styles.uploadCardFull]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>

      <Pressable style={styles.chooseButton} onPress={onPress}>
        <Text style={styles.chooseButtonText}>Choose File</Text>
      </Pressable>

      <Text style={styles.fileNameText}>{fileName ? fileName : "No file selected"}</Text>
    </View>
  );
};

export const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({
  videoFileName,
  imageFileName,
  onPickVideo,
  onPickImage,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thumbnail</Text>

      <View style={[styles.row, isMobile && styles.rowMobile]}>
        <UploadCard
          icon="🎥"
          title="Upload Activity Video"
          fileName={videoFileName}
          onPress={onPickVideo}
          fullWidth={isMobile}
        />

        <View style={[styles.orContainer, isMobile && styles.orContainerMobile]}>
          <Text style={styles.orText}>Or</Text>
        </View>

        <UploadCard
          icon="🖼️"
          title="Upload Thumbnail Image"
          fileName={imageFileName}
          onPress={onPickImage}
          fullWidth={isMobile}
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
    color: "#1F3B82",
    marginBottom: 12,
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
  orContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  orContainerMobile: {
    width: "100%",
    paddingVertical: 4,
  },
  orText: {
    fontSize: 18,
    color: "#6C6C6C",
    fontWeight: "500",
  },
  uploadCard: {
    flex: 1,
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
    flex: 0,
  },
  icon: {
    fontSize: 38,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6C6C6C",
    fontWeight: "500",
    marginBottom: 18,
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
});
