import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export type VideoFrameSource = {
  uri: string;
  name: string;
  type: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationMs: number;
};

export type SelectedVideoFrame = {
  uri: string;
  width: number;
  height: number;
  timeMs: number;
};

type VideoFramePickerModalProps = {
  video: VideoFrameSource | null;
  visible: boolean;
  onCancel: () => void;
  onSelectFrame: (frame: SelectedVideoFrame) => void;
};

const THUMBNAIL_GENERATION_DELAY_MS = 220;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getVideoFrameOnWebAsync = async (
  videoUri: string,
  timeMs: number,
  quality: number,
): Promise<Omit<SelectedVideoFrame, "timeMs">> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let hasResolved = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const finish = (callback: () => void) => {
      if (hasResolved) return;

      hasResolved = true;
      cleanup();
      callback();
    };

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 1;
      const height = video.videoHeight || 1;
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      if (!context) {
        finish(() =>
          reject(new Error("Unable to create a canvas context for video frame capture.")),
        );
        return;
      }

      context.drawImage(video, 0, 0, width, height);
      finish(() =>
        resolve({
          uri: canvas.toDataURL("image/jpeg", quality),
          width,
          height,
        }),
      );
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () =>
      finish(() => reject(new Error("Unable to load the selected video for frame capture.")));
    video.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;
      const targetSeconds = clamp(timeMs / 1000, 0, Math.max(durationSeconds - 0.001, 0));

      if (targetSeconds === 0) {
        video.onloadeddata = captureFrame;
        return;
      }

      video.onseeked = captureFrame;
      video.currentTime = targetSeconds;
    };
    video.src = videoUri;
    video.load();
  });

const getVideoFrameAsync = async (
  videoUri: string,
  timeMs: number,
  quality: number,
): Promise<SelectedVideoFrame> => {
  const frame =
    Platform.OS === "web"
      ? await getVideoFrameOnWebAsync(videoUri, timeMs, quality)
      : await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: timeMs,
          quality,
        });

  return {
    ...frame,
    timeMs,
  };
};

const formatTimestamp = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getFrameName = (videoName: string, timeMs: number) => {
  const baseName = videoName.replace(/\.[^/.]+$/, "") || "video-thumbnail";
  return `${baseName}-frame-${Math.round(timeMs)}.jpg`;
};

export const getVideoFrameImageName = getFrameName;

export const VideoFramePickerModal: React.FC<VideoFramePickerModalProps> = ({
  video,
  visible,
  onCancel,
  onSelectFrame,
}) => {
  const { width } = useWindowDimensions();
  const previewWidth = Math.min(width - 48, 420);
  const previewHeight = previewWidth / (4 / 3);
  const [selectedTimeMs, setSelectedTimeMs] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<SelectedVideoFrame | null>(null);
  const [trackWidth, setTrackWidth] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const durationMs = video?.durationMs ?? 0;
  const safeDurationMs = Math.max(durationMs, 1);
  const progress = clamp(selectedTimeMs / safeDurationMs, 0, 1);

  const updateSelectedTimeFromTrackPosition = (positionX: number) => {
    const nextX = clamp(positionX, 0, trackWidth);
    setSelectedTimeMs(Math.round((nextX / trackWidth) * safeDurationMs));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!visible) {
        setSelectedTimeMs(0);
        setSelectedFrame(null);
        setIsGenerating(false);
        setGenerationError(null);
        return;
      }

      setSelectedTimeMs(0);
      setGenerationError(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [visible, video?.uri]);

  useEffect(() => {
    if (!visible || !video) return;

    let isCanceled = false;

    const timeoutId = setTimeout(() => {
      setIsGenerating(true);
      setGenerationError(null);

      void getVideoFrameAsync(video.uri, selectedTimeMs, 0.88)
        .then((frame) => {
          if (isCanceled) return;

          setSelectedFrame(frame);
        })
        .catch((error: unknown) => {
          if (isCanceled) return;

          setSelectedFrame(null);
          setGenerationError(error instanceof Error ? error.message : "Unable to extract a frame.");
        })
        .finally(() => {
          if (!isCanceled) setIsGenerating(false);
        });
    }, THUMBNAIL_GENERATION_DELAY_MS);

    return () => {
      isCanceled = true;
      clearTimeout(timeoutId);
    };
  }, [selectedTimeMs, video, visible]);

  if (!video) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Select Video Thumbnail Frame</Text>
          <Text style={styles.description}>
            Drag through the video timeline, then use the selected frame for cropping.
          </Text>

          <View
            style={[
              styles.previewFrame,
              {
                width: previewWidth,
                height: previewHeight,
              },
            ]}
          >
            {selectedFrame ? (
              <Image source={{ uri: selectedFrame.uri }} style={styles.previewImage} />
            ) : generationError ? (
              <Text style={styles.previewError}>{generationError}</Text>
            ) : (
              <Text style={styles.previewPlaceholder}>Generating frame...</Text>
            )}

            {isGenerating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.timelineMeta}>
            <Text style={styles.timelineText}>{formatTimestamp(selectedTimeMs)}</Text>
            <Text style={styles.timelineText}>{formatTimestamp(durationMs)}</Text>
          </View>

          <View
            style={styles.timelineTrack}
            onLayout={(event) => setTrackWidth(Math.max(event.nativeEvent.layout.width, 1))}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(event) => {
              updateSelectedTimeFromTrackPosition(event.nativeEvent.locationX);
            }}
            onResponderMove={(event) => {
              updateSelectedTimeFromTrackPosition(event.nativeEvent.locationX);
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.timelineProgress, { width: `${progress * 100}%` }]} />
            <View style={[styles.timelineThumb, { left: `${progress * 100}%` }]} />
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={onCancel} disabled={isGenerating}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                if (selectedFrame) onSelectFrame(selectedFrame);
              }}
              disabled={!selectedFrame || isGenerating}
            >
              <Text style={styles.primaryButtonText}>Use This Frame</Text>
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
    textAlign: "center",
  },
  description: {
    color: "#5B6B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  previewFrame: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#D7DDE8",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    color: "#5B6B8B",
    fontSize: 14,
  },
  previewError: {
    color: "#E55C4D",
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineMeta: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  timelineText: {
    color: "#5B6B8B",
    fontSize: 13,
    fontWeight: "600",
  },
  timelineTrack: {
    width: "100%",
    maxWidth: 420,
    height: 34,
    justifyContent: "center",
  },
  timelineProgress: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#153A7A",
  },
  timelineThumb: {
    position: "absolute",
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#153A7A",
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
