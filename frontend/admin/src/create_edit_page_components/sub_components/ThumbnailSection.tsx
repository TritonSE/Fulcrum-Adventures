import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { FileUploadCard } from "./FileUploadCard";
import { ImageIcon, VideoIcon } from "./UploadIcons";

export const ThumbnailSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thumbnail</Text>

      <View style={[styles.cardsContainer, isMobile && styles.cardsContainerMobile]}>
        <FileUploadCard title="Upload Activity Video" icon={<VideoIcon />} fullWidth={isMobile} />

        <View style={[styles.orContainer, isMobile && styles.orContainerMobile]}>
          <Text style={styles.orText}>Or</Text>
        </View>

        <FileUploadCard title="Upload Thumbnail Image" icon={<ImageIcon />} fullWidth={isMobile} />
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
  cardsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardsContainerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  orContainer: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  orContainerMobile: {
    width: "100%",
    paddingVertical: 12,
  },
  orText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6C6C6C",
    textAlign: "center",
  },
});
