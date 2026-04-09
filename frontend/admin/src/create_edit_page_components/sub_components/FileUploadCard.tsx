import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UploadIcon } from "./UploadIcons";

type FileUploadCardProps = {
  title: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
};

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  title,
  icon,
  fullWidth = false,
  onPress,
}) => {
  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth]}>
      <View style={styles.inner}>
        {icon}
        <Text style={styles.title}>{title}</Text>

        <Pressable style={styles.button} onPress={onPress}>
          <View style={styles.buttonInner}>
            <UploadIcon />
            <Text style={styles.buttonText}>Choose File</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 200,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#B4B4B4",
    borderStyle: "dashed",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  cardFullWidth: {
    width: "100%",
    flex: 0,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "500",
    color: "#6C6C6C",
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#153A7A",
  },
});
