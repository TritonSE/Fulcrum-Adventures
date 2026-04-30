import * as ImageManipulator from "expo-image-manipulator";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { THUMBNAIL_IMAGE_FORM_FIELD, type ThumbnailImageFile } from "../OverviewSection";

export type CropDraftImage = {
  uri: string;
  name: string;
  type: string;
  width: number;
  height: number;
};

type ImageCropModalProps = {
  image: CropDraftImage | null;
  visible: boolean;
  onCancel: () => void;
  onSave: (image: ThumbnailImageFile) => void;
};

type Offset = {
  x: number;
  y: number;
};

const CROP_ASPECT_RATIO = 4 / 3;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getCroppedFileName = (fileName: string) => {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "thumbnail-image";
  return `${baseName}-cropped.jpg`;
};

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  image,
  visible,
  onCancel,
  onSave,
}) => {
  const { width } = useWindowDimensions();
  const cropWidth = Math.min(width - 48, 420);
  const cropHeight = cropWidth / CROP_ASPECT_RATIO;
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const offsetRef = useRef(offset);
  const dragStartRef = useRef(offset);

  const metrics = useMemo(() => {
    if (!image) {
      return {
        baseScale: 1,
        scaledWidth: cropWidth,
        scaledHeight: cropHeight,
      };
    }

    const baseScale = Math.max(cropWidth / image.width, cropHeight / image.height);
    const scaledWidth = image.width * baseScale * zoom;
    const scaledHeight = image.height * baseScale * zoom;

    return {
      baseScale,
      scaledWidth,
      scaledHeight,
    };
  }, [cropHeight, cropWidth, image, zoom]);

  const clampOffset = useCallback(
    (nextOffset: Offset): Offset => {
      const maxX = Math.max(0, (metrics.scaledWidth - cropWidth) / 2);
      const maxY = Math.max(0, (metrics.scaledHeight - cropHeight) / 2);

      return {
        x: clamp(nextOffset.x, -maxX, maxX),
        y: clamp(nextOffset.y, -maxY, maxY),
      };
    },
    [cropHeight, cropWidth, metrics.scaledHeight, metrics.scaledWidth],
  );

  const resetCrop = useCallback(() => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    if (!visible) {
      resetCrop();
      setIsSaving(false);
      return;
    }

    setOffset((current) => clampOffset(current));
  }, [clampOffset, resetCrop, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartRef.current = offsetRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextOffset = clampOffset({
            x: dragStartRef.current.x + gestureState.dx,
            y: dragStartRef.current.y + gestureState.dy,
          });

          setOffset(nextOffset);
        },
      }),
    [clampOffset],
  );

  const updateZoom = (nextZoom: number) => {
    setZoom(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
  };

  const saveCrop = async () => {
    if (!image || isSaving) return;

    setIsSaving(true);

    const activeScale = metrics.baseScale * zoom;
    const imageLeft = cropWidth / 2 - metrics.scaledWidth / 2 + offset.x;
    const imageTop = cropHeight / 2 - metrics.scaledHeight / 2 + offset.y;
    const originX = clamp(Math.round((0 - imageLeft) / activeScale), 0, image.width - 1);
    const originY = clamp(Math.round((0 - imageTop) / activeScale), 0, image.height - 1);
    const cropAreaWidth = clamp(
      Math.round(cropWidth / activeScale),
      1,
      image.width - originX,
    );
    const cropAreaHeight = clamp(
      Math.round(cropHeight / activeScale),
      1,
      image.height - originY,
    );

    try {
      const result = await ImageManipulator.manipulateAsync(
        image.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropAreaWidth,
              height: cropAreaHeight,
            },
          },
        ],
        {
          compress: 0.92,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      onSave({
        fieldName: THUMBNAIL_IMAGE_FORM_FIELD,
        uri: result.uri,
        name: getCroppedFileName(image.name),
        type: "image/jpeg",
        width: result.width,
        height: result.height,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!image) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Crop Thumbnail Image</Text>
          <Text style={styles.description}>Drag or zoom the image to choose the thumbnail crop.</Text>

          <View
            style={[
              styles.cropFrame,
              {
                width: cropWidth,
                height: cropHeight,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: image.uri }}
              resizeMode="stretch"
              style={[
                styles.cropImage,
                {
                  left: cropWidth / 2 - metrics.scaledWidth / 2 + offset.x,
                  top: cropHeight / 2 - metrics.scaledHeight / 2 + offset.y,
                  width: metrics.scaledWidth,
                  height: metrics.scaledHeight,
                },
              ]}
            />
            <View pointerEvents="none" style={styles.cropBorder} />
          </View>

          <View style={styles.zoomRow}>
            <Pressable
              style={styles.zoomButton}
              onPress={() => updateZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
            >
              <Text style={styles.zoomButtonText}>-</Text>
            </Pressable>
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
            <Pressable
              style={styles.zoomButton}
              onPress={() => updateZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            >
              <Text style={styles.zoomButtonText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={resetCrop} disabled={isSaving}>
              <Text style={styles.secondaryButtonText}>Reset Changes</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onCancel} disabled={isSaving}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                void saveCrop();
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
  },
  title: {
    color: "#153A7A",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#5B6B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  cropFrame: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#D7DDE8",
    alignItems: "center",
    justifyContent: "center",
  },
  cropImage: {
    position: "absolute",
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 14,
  },
  zoomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
  },
  zoomButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#153A7A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  zoomButtonText: {
    color: "#153A7A",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "600",
  },
  zoomText: {
    minWidth: 48,
    textAlign: "center",
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#153A7A",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: 42,
    minWidth: 132,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#153A7A",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
